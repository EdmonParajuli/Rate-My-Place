import { InputReviewVoteInterface, ReviewVoteInterface } from '../interfaces/reviewVoteInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';

export class ReviewVoteRepository extends BaseRepository<InputReviewVoteInterface, ReviewVoteInterface> {
  constructor() {
    super(Model.ReviewVote);
  }
}
