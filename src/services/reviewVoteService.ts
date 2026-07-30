import { ReviewVoteRepository } from '../repositories/reviewVoteRepository';
import { ReviewService } from './reviewService';
import { throwError } from '../helpers/errorHelper';

export class ReviewVoteService {
  private repository: ReviewVoteRepository;
  private reviewService: ReviewService;

  constructor() {
    this.repository = new ReviewVoteRepository();
    this.reviewService = new ReviewService();
  }

  async toggle(reviewId: number, userId: string): Promise<{ helpfulCount: number; helpfulByMe: boolean }> {
    const review = await this.reviewService.getReviewById(reviewId);
    if (!review) {
      throwError(`Review with ID ${reviewId} not found`, "NOT_FOUND", 404);
    }

    const existingVote = await this.repository.findOne({ where: { reviewId, userId } });

    let helpfulByMe: boolean;
    if (existingVote) {
      await this.repository.deleteMany({ where: { reviewId, userId } });
      helpfulByMe = false;
    } else {
      await this.repository.create({ reviewId, userId });
      helpfulByMe = true;
    }

    const helpfulCount = await this.repository.count({ where: { reviewId } });
    return { helpfulCount, helpfulByMe };
  }

  async getHelpfulCount(reviewId: number | string): Promise<number> {
    return this.repository.count({ where: { reviewId } });
  }

  async hasVoted(reviewId: number | string, userId?: string): Promise<boolean> {
    if (!userId) {
      return false;
    }
    const vote = await this.repository.findOne({ where: { reviewId, userId } });
    return !!vote;
  }
}
