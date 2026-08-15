import { Transaction } from 'sequelize';
import { InputReviewInterface } from '../interfaces/reviewInterface';
import { ReviewRepository } from '../repositories/reviewRepository';
import PlaceService from './placeService';
import { Database } from '../config';
import { throwError } from '../helpers/errorHelper';
import { assertOwnership } from '../utils/auth';
import { CursorBasedPagination, SortEnum } from '../packages/cursors/service';
import { ReviewSortEnum } from '../enums/reviewSortEnum';

const NEWEST_FIRST = { order: 'createdAt', sort: SortEnum.Desc };

// Column-based sorts: each just names a real, stored column to order by -
// same shape as PlaceService.COLUMN_SORTS. HELPFUL orders on helpfulCount,
// materialized on Review by ReviewVoteService.toggle specifically so this can
// be a plain ORDER BY through the existing keyset-pagination shape, rather
// than a live-computed aggregate (see docs/03-architecture.md's Place Detail
// follow-ups section for why).
const REVIEW_SORTS: Record<ReviewSortEnum, { order: string; sort: SortEnum }> = {
  [ReviewSortEnum.RECENT]: NEWEST_FIRST,
  [ReviewSortEnum.HELPFUL]: { order: 'helpfulCount', sort: SortEnum.Desc },
};

export class ReviewService {
  private repository: ReviewRepository;
  private placeService: PlaceService;
  private pagination: CursorBasedPagination;

  constructor() {
    this.repository = new ReviewRepository();
    this.placeService = new PlaceService();
    this.pagination = new CursorBasedPagination();
  }

  private async withTransaction<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T> {
    const transaction = await Database.sequelize.transaction();
    try {
      const result = await fn(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private async recomputePlaceStats(placeId: number, transaction: Transaction) {
    const { average, count } = await this.repository.getRatingStats(placeId, transaction);
    await this.placeService.updateRatingStats(
      placeId,
      { averageRating: average, reviewCount: count },
      transaction
    );
  }

  async getReviewById(reviewId: number) {
    return this.repository.findByPk(reviewId);
  }

  async createReview({ placeId, reviewerId, review, rating }: InputReviewInterface) {
    const place = await this.placeService.getPlaceById(placeId);
    if (!place) {
      throwError(`Place with ID ${placeId} not found`, "NOT_FOUND", 404);
    }

    if (String(place.ownerId) === String(reviewerId)) {
      throwError("You cannot review your own place.", "FORBIDDEN", 403);
    }

    const existingReview = await this.repository.findOne({ where: { placeId, reviewerId } });
    if (existingReview) {
      throwError(
        "You've already reviewed this place. Edit your existing review instead.",
        "CONFLICT",
        409
      );
    }

    return this.withTransaction(async (transaction) => {
      const created = await this.repository.create(
        { placeId, reviewerId, review, rating },
        { transaction }
      );

      // Recompute from source (AVG/COUNT over the place's current reviews)
      // rather than incrementally adjusting a running counter - simpler and
      // correct by construction, cheap enough given the index on place_id.
      await this.recomputePlaceStats(placeId, transaction);

      return created;
    });
  }

  async updateReview({
    reviewId,
    requestingUserId,
    review,
    rating,
  }: {
    reviewId: number;
    requestingUserId: string;
    review?: string;
    rating?: number;
  }) {
    const existingReview = await this.repository.findByPk(reviewId);
    if (!existingReview) {
      throwError(`Review with ID ${reviewId} not found`, "NOT_FOUND", 404);
    }
    assertOwnership(existingReview.reviewerId, requestingUserId, "You do not own this review.");

    const input: Partial<InputReviewInterface> = {};
    if (review !== undefined) input.review = review;
    if (rating !== undefined) input.rating = rating;

    // The re-fetch below must happen after withTransaction resolves (i.e.
    // after commit) - findByPk doesn't take a transaction, so calling it
    // inside the callback would read the pre-commit, stale row.
    await this.withTransaction(async (transaction) => {
      await this.repository.updateOne({ id: reviewId, input }, { transaction });
      await this.recomputePlaceStats(existingReview.placeId, transaction);
    });
    return this.repository.findByPk(reviewId);
  }

  async deleteReview(reviewId: number, requestingUserId: string) {
    const existingReview = await this.repository.findByPk(reviewId);
    if (!existingReview) {
      throwError(`Review with ID ${reviewId} not found`, "NOT_FOUND", 404);
    }
    assertOwnership(existingReview.reviewerId, requestingUserId, "You do not own this review.");

    return this.withTransaction(async (transaction) => {
      await this.repository.deleteOne(reviewId, transaction);
      await this.recomputePlaceStats(existingReview.placeId, transaction);
    });
  }

  // RECENT (default) or HELPFUL - first/after/sort are the only
  // caller-controlled params; each sort's order/direction is fixed so a given
  // cursor's encoded sortValue always means the same thing across a single
  // paginated walk (switching sort mid-walk isn't supported, same as
  // PlaceService.listPlaces).
  async listByPlace(
    placeId: number,
    { first, after, sort }: { first?: number; after?: string; sort?: ReviewSortEnum }
  ) {
    const place = await this.placeService.getPlaceById(placeId);
    if (!place) {
      throwError(`Place with ID ${placeId} not found`, "NOT_FOUND", 404);
    }

    const { order, sort: sortDirection } = REVIEW_SORTS[sort ?? ReviewSortEnum.RECENT];

    const cursorQuery = this.pagination.validateParameters({
      cursor: after,
      limit: first,
      order,
      sort: sortDirection,
    });
    const rows = await this.repository.paginate({ placeId }, cursorQuery);
    const { cursor: pageInfo, data } = this.pagination.paginate(rows, cursorQuery);

    return { data, pageInfo };
  }

  // Thin passthrough - placeResolver.ts's Place.ratingBreakdown field resolver
  // calls this directly, same pattern as Place.owner/hours/openNow calling
  // UserService/PlaceHourService directly rather than routing through the
  // "owning" service for the parent type.
  async getRatingBreakdown(placeId: number | string) {
    return this.repository.getRatingBreakdown(placeId);
  }

  // Thin passthrough - PlatformStatsService composes this with
  // PlaceService.countAll() rather than either service reaching into the
  // other's repository directly.
  async countAll(): Promise<number> {
    return this.repository.count({});
  }

  // Thin passthrough - BusinessDashboardService aggregates these lightweight
  // rows in memory (monthly buckets, sentiment, recency, reputation score)
  // rather than issuing a separate SQL aggregate query per metric. Fine at
  // MVP review volume, same "start simple" call as My Reviews' client-side
  // stats.
  async getForDashboard(placeId: number | string): Promise<{ id: number; rating: number; createdAt: Date }[]> {
    return this.repository.findAll({
      where: { placeId },
      attributes: ['id', 'rating', 'createdAt'],
    }) as unknown as Promise<{ id: number; rating: number; createdAt: Date }[]>;
  }

  // Pure write - ReviewVoteService (which owns the vote data) computes the
  // count and calls this inside its own transaction, same shape as
  // PlaceService.updateRatingStats.
  async updateHelpfulCount(reviewId: number, helpfulCount: number, transaction?: Transaction) {
    return this.repository.updateOne({ id: reviewId, input: { helpfulCount } }, { transaction });
  }

  async listByReviewer(reviewerId: string, { first, after }: { first?: number; after?: string }) {
    const cursorQuery = this.pagination.validateParameters({
      cursor: after,
      limit: first,
      ...NEWEST_FIRST,
    });
    const rows = await this.repository.paginate({ reviewerId }, cursorQuery);
    const { cursor: pageInfo, data } = this.pagination.paginate(rows, cursorQuery);

    return { data, pageInfo };
  }
}
