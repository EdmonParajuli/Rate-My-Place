import { Transaction } from 'sequelize';
import { InputReviewInterface, ReviewInterface } from '../interfaces/reviewInterface';
import { ReviewRepository } from '../repositories/reviewRepository';
import PlaceService from './placeService';
import { Database } from '../config';
import { throwError } from '../helpers/errorHelper';

export class ReviewService {
  private repository: ReviewRepository;
  private placeService: PlaceService;

  constructor() {
    this.repository = new ReviewRepository();
    this.placeService = new PlaceService();
  }

  private assertOwnership(review: ReviewInterface, requestingUserId: string) {
    if (String(review.reviewerId) !== String(requestingUserId)) {
      throwError("You do not own this review.", "FORBIDDEN", 403);
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

    const transaction = await Database.sequelize.transaction();
    try {
      const created = await this.repository.create(
        { placeId, reviewerId, review, rating },
        { transaction }
      );

      // Recompute from source (AVG/COUNT over the place's current reviews)
      // rather than incrementally adjusting a running counter - simpler and
      // correct by construction, cheap enough given the index on place_id.
      await this.recomputePlaceStats(placeId, transaction);

      await transaction.commit();
      return created;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
    this.assertOwnership(existingReview, requestingUserId);

    const input: Partial<InputReviewInterface> = {};
    if (review !== undefined) input.review = review;
    if (rating !== undefined) input.rating = rating;

    const transaction = await Database.sequelize.transaction();
    try {
      await this.repository.updateOne({ id: reviewId, input }, { transaction });
      await this.recomputePlaceStats(existingReview.placeId, transaction);
      await transaction.commit();
      return this.repository.findByPk(reviewId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteReview(reviewId: number, requestingUserId: string) {
    const existingReview = await this.repository.findByPk(reviewId);
    if (!existingReview) {
      throwError(`Review with ID ${reviewId} not found`, "NOT_FOUND", 404);
    }
    this.assertOwnership(existingReview, requestingUserId);

    const transaction = await Database.sequelize.transaction();
    try {
      await this.repository.deleteOne(reviewId, transaction);
      await this.recomputePlaceStats(existingReview.placeId, transaction);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
