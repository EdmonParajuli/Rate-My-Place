import { Transaction } from 'sequelize';
import crypto from 'crypto';
import { Database } from '../config';
import { ReviewQrCodeRepository } from '../repositories/reviewQrCodeRepository';
import PlaceService from './placeService';
import { throwError } from '../helpers/errorHelper';

export class ReviewQrCodeService {
  private repository: ReviewQrCodeRepository;
  private placeService: PlaceService;

  constructor() {
    this.repository = new ReviewQrCodeRepository();
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

  // Resolves "my place" the same way BusinessDashboardService already does
  // (PlaceService.getByOwnerId, scoped to the caller's own id) - no
  // client-supplied placeId ever crosses this boundary, so there's nothing to
  // assertOwnership against beyond the WHERE ownerId = callerId that query
  // already applies. Get-or-create, not "generate" - a business's first visit
  // to the QR page silently creates one, no empty state to click through.
  async getOrCreateForOwner(requestingUserId: string) {
    const place = await this.placeService.getByOwnerId(requestingUserId);
    if (!place) {
      throwError("You don't have a place yet.", "NOT_FOUND", 404);
    }

    // place.id is typed string (matches PlaceInterface throughout this
    // codebase) even though the column is numeric - same Number(place.id)
    // coercion ReviewService.notifyWatchers already uses.
    const placeId = Number(place!.id);
    const existing = await this.repository.findActiveByPlaceId(placeId);
    if (existing) {
      return existing;
    }

    return this.repository.create({
      placeId,
      publicToken: crypto.randomBytes(24).toString("hex"),
      createdBy: requestingUserId,
    });
  }

  // Not called from any resolver in V1 - regeneration isn't self-service
  // (docs/specs/phase-11-qr-review-flow.md). Invoked via a one-off script
  // when support needs to run it on a business's behalf, same precedent
  // Phase 8's place-photo seeding used ("a one-off script, not committed,
  // deleted after running"). No requestingUserId param for that reason.
  async regenerate(placeId: number) {
    const place = await this.placeService.getPlaceById(placeId);
    if (!place) {
      throwError(`Place with ID ${placeId} not found`, "NOT_FOUND", 404);
    }

    return this.withTransaction(async (transaction) => {
      const existing = await this.repository.findActiveByPlaceId(placeId);
      if (existing) {
        await this.repository.updateOne(
          { id: existing.id, input: { isActive: false } },
          { transaction }
        );
      }

      return this.repository.create(
        {
          placeId,
          publicToken: crypto.randomBytes(24).toString("hex"),
          createdBy: place!.ownerId,
        },
        { transaction }
      );
    });
  }

  // Called from PlaceService.delete's own transaction (Q6: deleting or
  // deactivating a place cascades to deactivate its QR) - no ownership check
  // here, the caller has already proven that before reaching this point.
  async deactivateForPlace(placeId: number, transaction?: Transaction): Promise<void> {
    const existing = await this.repository.findActiveByPlaceId(placeId);
    if (!existing) {
      return;
    }
    await this.repository.updateOne(
      { id: existing.id, input: { isActive: false } },
      { transaction }
    );
  }

  // Ticket 02 - the public scan path. No requireAuth anywhere upstream of
  // this - resolving a token to a place is meant to be public, same as
  // listPlaces. An unknown, deactivated, or superseded token all fail the
  // same isActive: true lookup, so they get one identical NOT_FOUND rather
  // than three distinguishable states to leak to a caller.
  async resolveActiveToken(token: string): Promise<number> {
    const record = await this.repository.findActiveByToken(token);
    if (!record) {
      throwError("QR code not found or no longer active.", "NOT_FOUND", 404);
    }
    return record!.placeId;
  }
}
