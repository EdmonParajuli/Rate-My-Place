import { Transaction } from 'sequelize';
import { ReviewVoteRepository } from '../repositories/reviewVoteRepository';
import { ReviewService } from './reviewService';
import { NotificationService } from './notificationService';
import { NotificationTypeEnum } from '../enums/notificationTypeEnum';
import { Database } from '../config';
import { throwError } from '../helpers/errorHelper';

export class ReviewVoteService {
  private repository: ReviewVoteRepository;
  private reviewService: ReviewService;
  private notificationService: NotificationService;

  constructor() {
    this.repository = new ReviewVoteRepository();
    this.reviewService = new ReviewService();
    this.notificationService = new NotificationService();
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

  async toggle(reviewId: number, userId: string): Promise<{ helpfulCount: number; helpfulByMe: boolean }> {
    const review = await this.reviewService.getReviewById(reviewId);
    if (!review) {
      throwError(`Review with ID ${reviewId} not found`, "NOT_FOUND", 404);
    }

    const existingVote = await this.repository.findOne({ where: { reviewId, userId } });

    // The vote write, the recount, and writing that count onto the Review row
    // (Review.helpfulCount - materialized so placeReviews's HELPFUL sort can
    // order on it, see docs/03-architecture.md) all happen in one transaction
    // so the stored count can never drift from the actual vote rows.
    const result = await this.withTransaction(async (transaction) => {
      let helpfulByMe: boolean;
      if (existingVote) {
        await this.repository.deleteMany({ where: { reviewId, userId }, transaction });
        helpfulByMe = false;
      } else {
        await this.repository.create({ reviewId, userId }, { transaction });
        helpfulByMe = true;
      }

      const helpfulCount = await this.repository.countForReview(reviewId, transaction);
      await this.reviewService.updateHelpfulCount(reviewId, helpfulCount, transaction);

      return { helpfulCount, helpfulByMe };
    });

    // Best-effort, outside the transaction - same "side effect, not core
    // write correctness" precedent every other notification hook follows.
    // Only fires on a new vote (not un-voting), and never for a
    // self-vote. No dedup - toggling off and back on re-fires this, a known
    // limitation carried over from the original decision to defer this event
    // (docs/specs/phase-5-notifications.md's non-goals).
    if (result.helpfulByMe && String(review.reviewerId) !== String(userId)) {
      await this.notificationService.create({
        userId: review.reviewerId,
        type: NotificationTypeEnum.HELPFUL_VOTE_RECEIVED,
        message: `Someone found your review helpful`,
        placeId: review.placeId,
      });
    }

    return result;
  }

  async hasVoted(reviewId: number | string, userId?: string): Promise<boolean> {
    if (!userId) {
      return false;
    }
    const vote = await this.repository.findOne({ where: { reviewId, userId } });
    return !!vote;
  }
}
