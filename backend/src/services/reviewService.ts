import { Transaction } from 'sequelize';
import { InputReviewInterface } from '../interfaces/reviewInterface';
import { ReviewRepository } from '../repositories/reviewRepository';
import PlaceService from './placeService';
import { Database } from '../config';
import { throwError } from '../helpers/errorHelper';
import { assertOwnership } from '../utils/auth';
import { CursorBasedPagination, SortEnum } from '../packages/cursors/service';
import { ReviewSortEnum } from '../enums/reviewSortEnum';
import { NotificationService } from './notificationService';
import { NotificationTypeEnum } from '../enums/notificationTypeEnum';
import { SavedPlaceService } from './savedPlaceService';

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
  private notificationService: NotificationService;
  private savedPlaceService: SavedPlaceService;

  constructor() {
    this.repository = new ReviewRepository();
    this.placeService = new PlaceService();
    this.pagination = new CursorBasedPagination();
    this.notificationService = new NotificationService();
    this.savedPlaceService = new SavedPlaceService();
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

    const created = await this.withTransaction(async (transaction) => {
      const createdReview = await this.repository.create(
        { placeId, reviewerId, review, rating },
        { transaction }
      );

      // Recompute from source (AVG/COUNT over the place's current reviews)
      // rather than incrementally adjusting a running counter - simpler and
      // correct by construction, cheap enough given the index on place_id.
      await this.recomputePlaceStats(placeId, transaction);

      return createdReview;
    });

    // Best-effort side effect, deliberately outside the transaction above -
    // a notification failing to write should never roll back the review
    // itself. place is already fetched (the self-review check needs it), no
    // extra query.
    await this.notificationService.create({
      userId: place.ownerId,
      type: NotificationTypeEnum.NEW_REVIEW,
      message: `New review on ${place.label}`,
      placeId: Number(place.id),
    });

    await this.notifyWatchers(place, reviewerId);

    return created;
  }

  // Everyone who's saved this place or reviewed it before (minus the
  // reviewer who just wrote this one, and the owner - already notified via
  // NEW_REVIEW above) gets a WATCHED_PLACE_REVIEW notification. Best-effort,
  // same as the NEW_REVIEW notification above - failures here never affect
  // the review write itself.
  private async notifyWatchers(place: { id: number | string; label: string; ownerId: string | number }, reviewerId: string) {
    const [saverIds, pastReviewerIds] = await Promise.all([
      this.savedPlaceService.getSaverUserIds(Number(place.id)),
      this.repository.getReviewerIdsForPlace(Number(place.id), reviewerId),
    ]);

    const watcherIds = new Set([...saverIds, ...pastReviewerIds].map(String));
    watcherIds.delete(String(reviewerId));
    watcherIds.delete(String(place.ownerId));

    await Promise.all(
      Array.from(watcherIds).map((userId) =>
        this.notificationService.create({
          userId,
          type: NotificationTypeEnum.WATCHED_PLACE_REVIEW,
          message: `New review on ${place.label}`,
          placeId: Number(place.id),
        })
      )
    );
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

  // Pure write - MediaService (which owns the media data) computes the
  // count and calls this inside its own transaction, same shape as
  // updateHelpfulCount above.
  async updatePhotoCount(reviewId: number, photoCount: number, transaction?: Transaction) {
    return this.repository.updateOne({ id: reviewId, input: { photoCount } }, { transaction });
  }

  async getReviewerStats(reviewerId: string) {
    return this.repository.getReviewerStats(reviewerId);
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
