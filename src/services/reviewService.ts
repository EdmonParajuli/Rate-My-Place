import { Transaction } from 'sequelize';
import { InputReviewInterface } from '../interfaces/reviewInterface';
import { ReviewRepository } from '../repositories/reviewRepository';
import PlaceService from './placeService';
import { Database } from '../config';
import { throwError } from '../helpers/errorHelper';
import { assertOwnership } from '../utils/auth';

export class ReviewService {
  private repository: ReviewRepository;
  private placeService: PlaceService;

  constructor() {
    this.repository = new ReviewRepository();
    this.placeService = new PlaceService();
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
}
