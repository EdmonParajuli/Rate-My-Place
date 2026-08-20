import { InputReviewQrCodeInterface, ReviewQrCodeInterface } from '../interfaces/reviewQrCodeInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';

export class ReviewQrCodeRepository extends BaseRepository<InputReviewQrCodeInterface, ReviewQrCodeInterface> {
  constructor() {
    super(Model.ReviewQrCode);
  }

  findActiveByPlaceId(placeId: number): Promise<ReviewQrCodeInterface> {
    return this.findOne({ where: { placeId, isActive: true } });
  }

  // Ticket 02 (docs/specs/phase-11-qr-review-flow.md) - the public scan path.
  // isActive: true covers unknown, deactivated, and superseded tokens with
  // one condition, since all three simply fail to match.
  findActiveByToken(publicToken: string): Promise<ReviewQrCodeInterface> {
    return this.findOne({ where: { publicToken, isActive: true } });
  }
}
