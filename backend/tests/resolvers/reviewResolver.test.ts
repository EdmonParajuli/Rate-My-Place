import { ReviewRepository } from "../../src/repositories/reviewRepository";
import PlaceRepository from "../../src/repositories/placeRepository";
import { UserTypeEnum } from "../../src/enums/userTypesEnum";
import { execute, contextAs, firstError } from "./helpers";

jest.mock("../../src/repositories/reviewRepository");
jest.mock("../../src/repositories/placeRepository");

const mockFindOne = ReviewRepository.prototype.findOne as jest.Mock;
const mockPlaceFindByPk = PlaceRepository.prototype.findByPk as jest.Mock;

const CREATE_REVIEW = `
  mutation CreateReview($placeId: Int!, $input: InputReview!) {
    createReview(placeId: $placeId, input: $input) { message data { id review rating } }
  }
`;

describe("reviewResolver (GraphQL execution)", () => {
  describe("createReview", () => {
    it("rejects an unauthenticated caller before touching any repository", async () => {
      const result = await execute(CREATE_REVIEW, {
        variableValues: { placeId: 1, input: { review: "Great place, would visit again.", rating: 5 } },
        context: {},
      });

      expect(firstError(result.errors).extensions.code).toBe("UNAUTHENTICATED");
      expect(mockPlaceFindByPk).not.toHaveBeenCalled();
    });

    // Trust-on-the-line guard, enforced service-side (ReviewService) but
    // triggered here through the real resolver -> Validator -> service path.
    it("rejects reviewing your own place", async () => {
      mockPlaceFindByPk.mockResolvedValue({ id: 1, ownerId: "7" });

      const result = await execute(CREATE_REVIEW, {
        variableValues: { placeId: 1, input: { review: "Great place, would visit again.", rating: 5 } },
        context: contextAs("7", UserTypeEnum.REGULAR),
      });

      expect(result.data?.createReview).toBeNull();
      expect(firstError(result.errors).extensions.code).toBe("FORBIDDEN");
      expect(mockFindOne).not.toHaveBeenCalled();
    });

    it("rejects a second review of the same place by the same reviewer", async () => {
      mockPlaceFindByPk.mockResolvedValue({ id: 1, ownerId: "owner-1" });
      mockFindOne.mockResolvedValue({ id: 99, placeId: 1, reviewerId: "7" });

      const result = await execute(CREATE_REVIEW, {
        variableValues: { placeId: 1, input: { review: "Great place, would visit again.", rating: 5 } },
        context: contextAs("7", UserTypeEnum.REGULAR),
      });

      expect(result.data?.createReview).toBeNull();
      expect(firstError(result.errors).extensions.code).toBe("CONFLICT");
    });

    it("rejects a rating outside the valid range via Joi, before any service call", async () => {
      const result = await execute(CREATE_REVIEW, {
        variableValues: { placeId: 1, input: { review: "Great place, would visit again.", rating: 9 } },
        context: contextAs("7", UserTypeEnum.REGULAR),
      });

      expect(firstError(result.errors)).toBeDefined();
      expect(mockPlaceFindByPk).not.toHaveBeenCalled();
    });

    it("rejects a review for a place that doesn't exist", async () => {
      mockPlaceFindByPk.mockResolvedValue(null);

      const result = await execute(CREATE_REVIEW, {
        variableValues: { placeId: 999, input: { review: "Great place, would visit again.", rating: 5 } },
        context: contextAs("7", UserTypeEnum.REGULAR),
      });

      expect(result.data?.createReview).toBeNull();
      expect(firstError(result.errors).extensions.code).toBe("NOT_FOUND");
    });
  });
});
