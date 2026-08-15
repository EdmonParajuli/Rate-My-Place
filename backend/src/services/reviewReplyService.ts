import { Op } from 'sequelize';
import { ReviewReplyRepository } from '../repositories/reviewReplyRepository';
import { ReviewService } from './reviewService';
import PlaceService from './placeService';
import { NotificationService } from './notificationService';
import { NotificationTypeEnum } from '../enums/notificationTypeEnum';
import { throwError } from '../helpers/errorHelper';
import { assertOwnership } from '../utils/auth';

export class ReviewReplyService {
  private repository: ReviewReplyRepository;
  private reviewService: ReviewService;
  private placeService: PlaceService;
  private notificationService: NotificationService;

  constructor() {
    this.repository = new ReviewReplyRepository();
    this.reviewService = new ReviewService();
    this.placeService = new PlaceService();
    this.notificationService = new NotificationService();
  }

  // Reply authorship is the place's owner, not the review's reviewer - the
  // reply always attaches to a review, but permission to write it comes from
  // owning the place the review is about. Returns both fetched entities so
  // createReply can reuse them for the notification below instead of
  // re-querying.
  private async assertPlaceOwnership(reviewId: number, requestingUserId: string) {
    const review = await this.reviewService.getReviewById(reviewId);
    if (!review) {
      throwError(`Review with ID ${reviewId} not found`, "NOT_FOUND", 404);
    }

    const place = await this.placeService.getPlaceById(review.placeId);
    if (!place) {
      throwError(`Place with ID ${review.placeId} not found`, "NOT_FOUND", 404);
    }

    assertOwnership(place.ownerId, requestingUserId, "You do not own the place this review belongs to.");

    return { review, place };
  }

  async createReply({
    reviewId,
    requestingUserId,
    description,
  }: {
    reviewId: number;
    requestingUserId: string;
    description: string;
  }) {
    const { review, place } = await this.assertPlaceOwnership(reviewId, requestingUserId);

    const existingReply = await this.repository.findOne({ where: { reviewId } });
    if (existingReply) {
      throwError("This review already has a reply.", "CONFLICT", 409);
    }

    const reply = await this.repository.create({ reviewId, ownerId: requestingUserId, description });

    await this.notificationService.create({
      userId: review.reviewerId,
      type: NotificationTypeEnum.REVIEW_REPLY,
      message: `${place.label} replied to your review`,
      placeId: Number(place.id),
    });

    return reply;
  }

  async updateReply({
    replyId,
    requestingUserId,
    description,
  }: {
    replyId: number;
    requestingUserId: string;
    description: string;
  }) {
    const existingReply = await this.repository.findByPk(replyId);
    if (!existingReply) {
      throwError(`Reply with ID ${replyId} not found`, "NOT_FOUND", 404);
    }
    assertOwnership(existingReply.ownerId, requestingUserId, "You do not own this reply.");

    await this.repository.updateOne({ id: replyId, input: { description } });
    return this.repository.findByPk(replyId);
  }

  async deleteReply(replyId: number, requestingUserId: string) {
    const existingReply = await this.repository.findByPk(replyId);
    if (!existingReply) {
      throwError(`Reply with ID ${replyId} not found`, "NOT_FOUND", 404);
    }
    assertOwnership(existingReply.ownerId, requestingUserId, "You do not own this reply.");

    return this.repository.deleteOne(replyId);
  }

  async getByReviewId(reviewId: number | string) {
    return this.repository.findOne({ where: { reviewId } });
  }

  // Thin passthrough - BusinessDashboardService uses this to compute response
  // rate (repliedReviews / totalReviews) against the review ids it already
  // fetched, rather than a join (ReviewReply has no placeId column of its
  // own - only reviewId).
  async getForReviews(reviewIds: number[]): Promise<{ reviewId: number; createdAt: Date }[]> {
    if (reviewIds.length === 0) {
      return [];
    }
    return this.repository.findAll({
      where: { reviewId: { [Op.in]: reviewIds } },
      attributes: ['reviewId', 'createdAt'],
    }) as unknown as Promise<{ reviewId: number; createdAt: Date }[]>;
  }
}
