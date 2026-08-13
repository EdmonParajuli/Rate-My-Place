import { Transaction } from 'sequelize';
import { InputReviewVoteInterface, ReviewVoteInterface } from '../interfaces/reviewVoteInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';

export class ReviewVoteRepository extends BaseRepository<InputReviewVoteInterface, ReviewVoteInterface> {
  constructor() {
    super(Model.ReviewVote);
  }

  // Direct this.model.count(), not BaseRepository's generic count() wrapper -
  // that wrapper doesn't accept a transaction, and this needs to see the vote
  // row just created/deleted in the same transaction before it commits (same
  // reasoning as ReviewRepository.getRatingStats using this.model directly).
  async countForReview(reviewId: number, transaction?: Transaction): Promise<number> {
    return this.model.count({ where: { reviewId }, transaction });
  }
}
