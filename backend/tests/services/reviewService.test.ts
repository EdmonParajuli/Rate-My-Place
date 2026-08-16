import { GraphQLError } from "graphql";
import { ReviewService } from "../../src/services/reviewService";
import { ReviewRepository } from "../../src/repositories/reviewRepository";
import PlaceService from "../../src/services/placeService";
import { Database } from "../../src/config";
import { NotificationService } from "../../src/services/notificationService";
import { SavedPlaceService } from "../../src/services/savedPlaceService";
import { NotificationTypeEnum } from "../../src/enums/notificationTypeEnum";

// Factory mocks (not bare jest.mock(path) automocks) - automocking would
// still require() the real module to inspect its shape, which for these
// classes means loading the real Sequelize model graph (src/models/index.ts)
// and hitting a real, unmocked Database.sequelize.define. A factory replaces
// the module outright, so the real implementation - and its imports - never
// runs.
jest.mock("../../src/repositories/reviewRepository", () => ({
  ReviewRepository: jest.fn().mockImplementation(() => ({
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    getRatingStats: jest.fn(),
    getReviewerIdsForPlace: jest.fn(),
  })),
}));
jest.mock("../../src/services/placeService", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getPlaceById: jest.fn(),
    updateRatingStats: jest.fn(),
  })),
}));
jest.mock("../../src/services/notificationService", () => ({
  NotificationService: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
  })),
}));
jest.mock("../../src/services/savedPlaceService", () => ({
  SavedPlaceService: jest.fn().mockImplementation(() => ({
    getSaverUserIds: jest.fn(),
  })),
}));
jest.mock("../../src/config", () => ({
  Database: { sequelize: { transaction: jest.fn() } },
}));

const MockedReviewRepository = ReviewRepository as unknown as jest.Mock;
const MockedPlaceService = PlaceService as unknown as jest.Mock;
const MockedNotificationService = NotificationService as unknown as jest.Mock;
const MockedSavedPlaceService = SavedPlaceService as unknown as jest.Mock;

function latestInstance(mockedConstructor: jest.Mock) {
  return mockedConstructor.mock.results[mockedConstructor.mock.results.length - 1].value;
}

let mockFindOne: jest.Mock;
let mockFindByPk: jest.Mock;
let mockCreate: jest.Mock;
let mockUpdateOne: jest.Mock;
let mockDeleteOne: jest.Mock;
let mockGetRatingStats: jest.Mock;
let mockGetReviewerIdsForPlace: jest.Mock;
let mockGetPlaceById: jest.Mock;
let mockUpdateRatingStats: jest.Mock;
let mockNotify: jest.Mock;
let mockGetSaverUserIds: jest.Mock;

const mockTransaction = Database.sequelize.transaction as jest.Mock;

const PLACE = { id: 10, ownerId: "owner-1", label: "Test Place" };

function fakeTransaction() {
  return { commit: jest.fn().mockResolvedValue(undefined), rollback: jest.fn().mockResolvedValue(undefined) };
}

async function expectGraphQLError(fn: () => Promise<unknown>, code: string) {
  try {
    await fn();
    fail("expected the promise to reject");
  } catch (error) {
    expect(error).toBeInstanceOf(GraphQLError);
    expect((error as GraphQLError).extensions.code).toBe(code);
  }
}

describe("ReviewService", () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService();

    const repo = latestInstance(MockedReviewRepository);
    mockFindOne = repo.findOne;
    mockFindByPk = repo.findByPk;
    mockCreate = repo.create;
    mockUpdateOne = repo.updateOne;
    mockDeleteOne = repo.deleteOne;
    mockGetRatingStats = repo.getRatingStats;
    mockGetReviewerIdsForPlace = repo.getReviewerIdsForPlace;

    const placeService = latestInstance(MockedPlaceService);
    mockGetPlaceById = placeService.getPlaceById;
    mockUpdateRatingStats = placeService.updateRatingStats;

    mockNotify = latestInstance(MockedNotificationService).create;
    mockGetSaverUserIds = latestInstance(MockedSavedPlaceService).getSaverUserIds;

    mockGetPlaceById.mockResolvedValue(PLACE);
    mockGetReviewerIdsForPlace.mockResolvedValue([]);
    mockGetSaverUserIds.mockResolvedValue([]);
    mockTransaction.mockImplementation(async () => fakeTransaction());
  });

  describe("createReview", () => {
    it("rejects when the place doesn't exist", async () => {
      mockGetPlaceById.mockResolvedValue(null);

      await expectGraphQLError(
        () => reviewService.createReview({ placeId: 10, reviewerId: "reviewer-1", review: "great", rating: 5 }),
        "NOT_FOUND"
      );
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("blocks an owner from reviewing their own place", async () => {
      await expectGraphQLError(
        () => reviewService.createReview({ placeId: 10, reviewerId: "owner-1", review: "great", rating: 5 }),
        "FORBIDDEN"
      );
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("blocks a second review from the same reviewer on the same place", async () => {
      mockFindOne.mockResolvedValue({ id: 1, placeId: 10, reviewerId: "reviewer-1" });

      await expectGraphQLError(
        () => reviewService.createReview({ placeId: 10, reviewerId: "reviewer-1", review: "again", rating: 3 }),
        "CONFLICT"
      );
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("creates the review, recomputes place stats in the same transaction, and notifies the owner", async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ id: 99, placeId: 10, reviewerId: "reviewer-1", review: "great", rating: 5 });
      mockGetRatingStats.mockResolvedValue({ average: 4.5, count: 3 });

      const result = await reviewService.createReview({
        placeId: 10,
        reviewerId: "reviewer-1",
        review: "great",
        rating: 5,
      });

      expect(result).toEqual({ id: 99, placeId: 10, reviewerId: "reviewer-1", review: "great", rating: 5 });
      expect(mockGetRatingStats).toHaveBeenCalledWith(10, expect.anything());
      expect(mockUpdateRatingStats).toHaveBeenCalledWith(
        10,
        { averageRating: 4.5, reviewCount: 3 },
        expect.anything()
      );
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "owner-1", type: NotificationTypeEnum.NEW_REVIEW, placeId: 10 })
      );
    });

    it("notifies past reviewers and savers of the place, excluding the reviewer and the owner", async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ id: 99, placeId: 10, reviewerId: "reviewer-1", review: "great", rating: 5 });
      mockGetRatingStats.mockResolvedValue({ average: 5, count: 1 });
      mockGetSaverUserIds.mockResolvedValue(["saver-1", "reviewer-1"]);
      mockGetReviewerIdsForPlace.mockResolvedValue(["past-reviewer-1", "owner-1"]);

      await reviewService.createReview({ placeId: 10, reviewerId: "reviewer-1", review: "great", rating: 5 });

      const watcherCalls = mockNotify.mock.calls.filter(
        ([arg]) => arg.type === NotificationTypeEnum.WATCHED_PLACE_REVIEW
      );
      const notifiedUserIds = watcherCalls.map(([arg]) => arg.userId).sort();
      expect(notifiedUserIds).toEqual(["past-reviewer-1", "saver-1"]);
    });

    it("rolls back the transaction if persisting the review fails", async () => {
      mockFindOne.mockResolvedValue(null);
      const transaction = fakeTransaction();
      mockTransaction.mockResolvedValue(transaction);
      mockCreate.mockRejectedValue(new Error("db exploded"));

      await expect(
        reviewService.createReview({ placeId: 10, reviewerId: "reviewer-1", review: "great", rating: 5 })
      ).rejects.toThrow("db exploded");

      expect(transaction.commit).not.toHaveBeenCalled();
      expect(transaction.rollback).toHaveBeenCalledTimes(1);
      expect(mockUpdateRatingStats).not.toHaveBeenCalled();
    });
  });

  describe("updateReview", () => {
    it("rejects when the review doesn't exist", async () => {
      mockFindByPk.mockResolvedValue(null);

      await expectGraphQLError(
        () => reviewService.updateReview({ reviewId: 1, requestingUserId: "reviewer-1", review: "edited" }),
        "NOT_FOUND"
      );
    });

    it("rejects when the requester doesn't own the review", async () => {
      mockFindByPk.mockResolvedValue({ id: 1, placeId: 10, reviewerId: "reviewer-1" });

      await expectGraphQLError(
        () => reviewService.updateReview({ reviewId: 1, requestingUserId: "someone-else", review: "edited" }),
        "FORBIDDEN"
      );
      expect(mockUpdateOne).not.toHaveBeenCalled();
    });

    it("updates only the provided fields and recomputes place stats", async () => {
      mockFindByPk
        .mockResolvedValueOnce({ id: 1, placeId: 10, reviewerId: "reviewer-1" }) // ownership fetch
        .mockResolvedValueOnce({ id: 1, placeId: 10, reviewerId: "reviewer-1", rating: 4 }); // post-commit re-fetch
      mockGetRatingStats.mockResolvedValue({ average: 4, count: 2 });

      const result = await reviewService.updateReview({ reviewId: 1, requestingUserId: "reviewer-1", rating: 4 });

      expect(mockUpdateOne).toHaveBeenCalledWith(
        { id: 1, input: { rating: 4 } },
        expect.anything()
      );
      expect(mockUpdateRatingStats).toHaveBeenCalledWith(10, { averageRating: 4, reviewCount: 2 }, expect.anything());
      expect(result).toEqual({ id: 1, placeId: 10, reviewerId: "reviewer-1", rating: 4 });
    });
  });

  describe("deleteReview", () => {
    it("rejects when the requester doesn't own the review", async () => {
      mockFindByPk.mockResolvedValue({ id: 1, placeId: 10, reviewerId: "reviewer-1" });

      await expectGraphQLError(
        () => reviewService.deleteReview(1, "someone-else"),
        "FORBIDDEN"
      );
      expect(mockDeleteOne).not.toHaveBeenCalled();
    });

    it("deletes the review and recomputes place stats in the same transaction", async () => {
      mockFindByPk.mockResolvedValue({ id: 1, placeId: 10, reviewerId: "reviewer-1" });
      mockGetRatingStats.mockResolvedValue({ average: 0, count: 0 });

      await reviewService.deleteReview(1, "reviewer-1");

      expect(mockDeleteOne).toHaveBeenCalledWith(1, expect.anything());
      expect(mockUpdateRatingStats).toHaveBeenCalledWith(10, { averageRating: 0, reviewCount: 0 }, expect.anything());
    });
  });
});
