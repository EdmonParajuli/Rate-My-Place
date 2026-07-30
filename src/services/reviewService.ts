import { InputReviewInterface } from '../interfaces/reviewInterface';
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
      await this.placeService.recomputeRatingStats(placeId, transaction);
      await transaction.commit();
      return created;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
