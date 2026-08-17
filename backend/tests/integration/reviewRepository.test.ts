import { ReviewRepository } from "../../src/repositories/reviewRepository";
import { UserTypeEnum } from "../../src/enums/userTypesEnum";
import { truncateAll, createTestUser, createTestPlace } from "./helpers";

// Real Postgres, not a mocked repository - doc 6's testing layer 2. These
// specifically guard two real bugs already found and fixed once in this
// project's history (see docs/02-current-state.md's "Known issues" section) -
// a mocked ReviewRepository unit test can't catch either, since both depend
// on the actual unique-index/constraint behavior a real Postgres enforces.
describe("ReviewRepository (integration)", () => {
  let repository: ReviewRepository;
  let ownerId: string;
  let reviewerId: string;
  let placeId: number;

  beforeEach(async () => {
    await truncateAll();
    repository = new ReviewRepository();

    const owner = await createTestUser({ userType: UserTypeEnum.BUSINESS });
    const reviewer = await createTestUser();
    const place = await createTestPlace({ ownerId: owner.id });
    ownerId = owner.id;
    reviewerId = reviewer.id;
    placeId = Number(place.id);
  });

  it("rejects a second live review from the same reviewer on the same place", async () => {
    await repository.create({ placeId, reviewerId, review: "Great spot", rating: 5 });

    await expect(
      repository.create({ placeId, reviewerId, review: "Again", rating: 3 })
    ).rejects.toThrow();
  });

  // Regression test for the bug documented in docs/02-current-state.md: the
  // original unique index on (place_id, reviewer_id) wasn't filtered to
  // non-deleted rows, so deleting a review and writing a new one for the same
  // place/reviewer pair failed with a unique-constraint violation even though
  // the old review was gone. Fixed by making the index partial
  // (WHERE deleted_at IS NULL) - this locks that fix in.
  it("allows a new review for the same place/reviewer pair after the old one is soft-deleted", async () => {
    const first = await repository.create({ placeId, reviewerId, review: "First try", rating: 2 });
    await repository.deleteOne(first.id);

    const second = await repository.create({ placeId, reviewerId, review: "Second try", rating: 5 });

    expect(second.id).not.toBe(first.id);
    await expect(repository.findByPk(second.id)).resolves.not.toBeNull();
  });

  it("computes average/count from real rows, as a proper float rather than truncated to an integer", async () => {
    const reviewerB = await createTestUser();
    const reviewerC = await createTestUser();

    await repository.create({ placeId, reviewerId, review: "a", rating: 3 });
    await repository.create({ placeId, reviewerId: reviewerB.id, review: "b", rating: 4 });
    await repository.create({ placeId, reviewerId: reviewerC.id, review: "c", rating: 4 });

    const stats = await repository.getRatingStats(placeId);

    expect(stats.count).toBe(3);
    expect(stats.average).toBeCloseTo((3 + 4 + 4) / 3, 5);
  });

  it("excludes soft-deleted reviews from getRatingStats", async () => {
    const reviewerB = await createTestUser();
    const toDelete = await repository.create({ placeId, reviewerId, review: "will be deleted", rating: 1 });
    await repository.create({ placeId, reviewerId: reviewerB.id, review: "stays", rating: 5 });

    await repository.deleteOne(toDelete.id);

    const stats = await repository.getRatingStats(placeId);
    expect(stats.count).toBe(1);
    expect(stats.average).toBe(5);
  });
});
