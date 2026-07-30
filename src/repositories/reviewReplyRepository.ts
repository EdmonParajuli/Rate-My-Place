import { InputReviewReplyInterface, ReviewReplyInterface } from '../interfaces/reviewReplyInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';

export class ReviewReplyRepository extends BaseRepository<InputReviewReplyInterface, ReviewReplyInterface> {
  constructor() {
    super(Model.ReviewReply);
  }
}
