import { Transaction } from 'sequelize';
import { MediaRepository } from '../repositories/mediaRepository';
import { UserService } from './userService';
import PlaceService from './placeService';
import { ReviewService } from './reviewService';
import { MediaOwnerTypeEnum } from '../enums/mediaOwnerTypeEnum';
import { MediaKindEnum } from '../enums/mediaKindEnum';
import { Database, cloudinary as cloudinaryConfig } from '../config';
import { generateUploadSignature } from '../utils/cloudinary';
import { throwError } from '../helpers/errorHelper';
import { assertOwnership } from '../utils/auth';

const MAX_PLACE_PHOTOS = 12;
const MAX_REVIEW_PHOTOS = 6;

export class MediaService {
  private repository: MediaRepository;
  private userService: UserService;
  private placeService: PlaceService;
  private reviewService: ReviewService;

  constructor() {
    this.repository = new MediaRepository();
    this.userService = new UserService();
    this.placeService = new PlaceService();
    this.reviewService = new ReviewService();
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

  // ownerId required for PLACE/REVIEW (checked against real ownership);
  // ignored for USER - always the caller's own account, never a
  // client-supplied id.
  async getUploadSignature(
    userId: string,
    ownerType: MediaOwnerTypeEnum,
    kind: MediaKindEnum,
    ownerId?: number | null
  ) {
    let folder: string;

    if (ownerType === MediaOwnerTypeEnum.USER) {
      if (kind !== MediaKindEnum.AVATAR && kind !== MediaKindEnum.COVER) {
        throwError("Only AVATAR or COVER uploads are supported for a user.", "BAD_REQUEST", 400);
      }
      folder = `rate-my-place/users/${userId}/${kind.toLowerCase()}`;
    } else if (ownerType === MediaOwnerTypeEnum.PLACE) {
      if (kind !== MediaKindEnum.AVATAR && kind !== MediaKindEnum.COVER && kind !== MediaKindEnum.PHOTO) {
        throwError("Only AVATAR, COVER, or PHOTO uploads are supported for a place.", "BAD_REQUEST", 400);
      }
      if (!ownerId) {
        throwError("ownerId is required for a place upload.", "BAD_REQUEST", 400);
      }
      await this.assertOwnsPlace(ownerId!, userId);
      folder = `rate-my-place/places/${ownerId}/${kind.toLowerCase()}`;
    } else if (ownerType === MediaOwnerTypeEnum.REVIEW) {
      if (kind !== MediaKindEnum.PHOTO) {
        throwError("Only PHOTO uploads are supported for a review.", "BAD_REQUEST", 400);
      }
      if (!ownerId) {
        throwError("ownerId is required for a review upload.", "BAD_REQUEST", 400);
      }
      await this.assertOwnsReview(ownerId!, userId);
      folder = `rate-my-place/reviews/${ownerId}/photo`;
    } else {
      throwError("Only USER, PLACE, or REVIEW uploads are supported.", "BAD_REQUEST", 400);
      return;
    }

    const { signature, timestamp } = generateUploadSignature(folder);

    return {
      signature,
      timestamp,
      apiKey: cloudinaryConfig.apiKey,
      cloudName: cloudinaryConfig.cloudName,
      folder,
    };
  }

  private async assertOwnsPlace(placeId: number, userId: string) {
    const place = await this.placeService.getPlaceById(placeId);
    if (!place) {
      throwError(`Place with ID ${placeId} not found`, "NOT_FOUND", 404);
    }
    assertOwnership(place!.ownerId, userId, "You do not own this place.");
    return place!;
  }

  private async assertOwnsReview(reviewId: number, userId: string) {
    const review = await this.reviewService.getReviewById(reviewId);
    if (!review) {
      throwError(`Review with ID ${reviewId} not found`, "NOT_FOUND", 404);
    }
    assertOwnership(review!.reviewerId, userId, "You do not own this review.");
    return review!;
  }

  // Recomputes from source rather than +1/-1 - same "recompute and store"
  // pattern as ReviewVoteService.toggle maintaining helpfulCount, and reuses
  // the same count attachMedia's cap check just computed.
  private async syncReviewPhotoCount(reviewId: number, transaction: Transaction) {
    // Must pass the transaction through - the just-created/removed row isn't
    // visible to a query outside it (default READ COMMITTED), so an
    // un-scoped count here would silently read the pre-write count.
    const count = await this.repository.count({ where: { ownerType: MediaOwnerTypeEnum.REVIEW, ownerId: reviewId, kind: MediaKindEnum.PHOTO }, transaction });
    await this.reviewService.updatePhotoCount(reviewId, count, transaction);
  }

  async attachMedia(
    userId: string,
    { ownerType, ownerId, kind, url }: { ownerType: MediaOwnerTypeEnum; ownerId?: number | null; kind: MediaKindEnum; url: string }
  ) {
    if (ownerType === MediaOwnerTypeEnum.USER) {
      // AVATAR/COVER are single-slot - the previous row (if any) is
      // replaced, not accumulated.
      return this.withTransaction(async (transaction) => {
        await this.repository.deleteAllForOwner(MediaOwnerTypeEnum.USER, Number(userId), kind, transaction);
        const media = await this.repository.create(
          { ownerType: MediaOwnerTypeEnum.USER, ownerId: Number(userId), kind, url },
          { transaction }
        );

        if (kind === MediaKindEnum.AVATAR) {
          await this.userService.updateProfilePicture(userId, url, transaction);
        } else {
          await this.userService.updateCoverPicture(userId, url, transaction);
        }

        return media;
      });
    }

    if (ownerType === MediaOwnerTypeEnum.PLACE) {
      if (!ownerId) {
        throwError("ownerId is required for a place upload.", "BAD_REQUEST", 400);
      }
      await this.assertOwnsPlace(ownerId!, userId);

      if (kind === MediaKindEnum.AVATAR || kind === MediaKindEnum.COVER) {
        // Single-slot, same replace-on-upload behavior as USER's AVATAR/COVER.
        return this.withTransaction(async (transaction) => {
          await this.repository.deleteAllForOwner(MediaOwnerTypeEnum.PLACE, ownerId!, kind, transaction);
          const media = await this.repository.create(
            { ownerType: MediaOwnerTypeEnum.PLACE, ownerId: ownerId!, kind, url },
            { transaction }
          );
          if (kind === MediaKindEnum.AVATAR) {
            await this.placeService.updateProfilePicture(ownerId!, url, transaction);
          } else {
            await this.placeService.updateCoverPhoto(ownerId!, url, transaction);
          }
          return media;
        });
      }

      // PHOTO: a real gallery, additive - no delete-before-create. Capped so
      // one place can't accumulate an unbounded number of rows.
      const existingCount = await this.repository.count({ where: { ownerType: MediaOwnerTypeEnum.PLACE, ownerId: ownerId!, kind: MediaKindEnum.PHOTO } });
      if (existingCount >= MAX_PLACE_PHOTOS) {
        throwError(`A place can have at most ${MAX_PLACE_PHOTOS} photos. Remove one before adding another.`, "BAD_REQUEST", 400);
      }
      return this.repository.create({ ownerType: MediaOwnerTypeEnum.PLACE, ownerId: ownerId!, kind, url });
    }

    if (ownerType === MediaOwnerTypeEnum.REVIEW) {
      if (!ownerId) {
        throwError("ownerId is required for a review upload.", "BAD_REQUEST", 400);
      }
      await this.assertOwnsReview(ownerId!, userId);

      // PHOTO only - additive, same gallery shape as PLACE's, just a
      // smaller cap (a single review, not a whole listing).
      const existingCount = await this.repository.count({ where: { ownerType: MediaOwnerTypeEnum.REVIEW, ownerId: ownerId!, kind: MediaKindEnum.PHOTO } });
      if (existingCount >= MAX_REVIEW_PHOTOS) {
        throwError(`A review can have at most ${MAX_REVIEW_PHOTOS} photos. Remove one before adding another.`, "BAD_REQUEST", 400);
      }

      return this.withTransaction(async (transaction) => {
        const media = await this.repository.create({ ownerType: MediaOwnerTypeEnum.REVIEW, ownerId: ownerId!, kind: MediaKindEnum.PHOTO, url }, { transaction });
        await this.syncReviewPhotoCount(ownerId!, transaction);
        return media;
      });
    }

    throwError("Only USER, PLACE, or REVIEW uploads are supported.", "BAD_REQUEST", 400);
  }

  // Live, per-owner lookup (not denormalized) - a gallery is inherently a
  // list, and this is only ever requested for one owner at a time (Place
  // Detail/My Listing for a place, getReviewById for a review), never
  // across a list of many owners at once, so there's no N+1 risk to avoid
  // here the way there was for coverPhotoUrl/profilePicture. Review lists
  // (placeReviews/myReviews) use the materialized photoCount instead of
  // this - see syncReviewPhotoCount above.
  async getForOwner(ownerType: MediaOwnerTypeEnum, ownerId: number, kind: MediaKindEnum) {
    return this.repository.findAll({
      where: { ownerType, ownerId, kind },
      order: [['createdAt', 'ASC']],
    });
  }

  async removeMedia(userId: string, mediaId: number) {
    const media = await this.repository.findByPk(mediaId);
    if (!media) {
      throwError(`Media with ID ${mediaId} not found`, "NOT_FOUND", 404);
    }

    if (media!.ownerType === MediaOwnerTypeEnum.USER) {
      assertOwnership(media!.ownerId, userId, "You do not own this media.");
    } else if (media!.ownerType === MediaOwnerTypeEnum.PLACE) {
      await this.assertOwnsPlace(Number(media!.ownerId), userId);
    } else if (media!.ownerType === MediaOwnerTypeEnum.REVIEW) {
      await this.assertOwnsReview(Number(media!.ownerId), userId);
    } else {
      throwError("Only USER, PLACE, or REVIEW media can be removed.", "BAD_REQUEST", 400);
    }

    await this.withTransaction(async (transaction) => {
      await this.repository.deleteOne(mediaId, transaction);

      // Clear the denormalized column/count too, so it never keeps
      // pointing at a soft-deleted row.
      if (media!.kind === MediaKindEnum.COVER) {
        if (media!.ownerType === MediaOwnerTypeEnum.USER) {
          await this.userService.updateCoverPicture(media!.ownerId, null, transaction);
        } else {
          await this.placeService.updateCoverPhoto(Number(media!.ownerId), null, transaction);
        }
      } else if (media!.kind === MediaKindEnum.AVATAR) {
        if (media!.ownerType === MediaOwnerTypeEnum.USER) {
          await this.userService.updateProfilePicture(media!.ownerId, null, transaction);
        } else {
          await this.placeService.updateProfilePicture(Number(media!.ownerId), null, transaction);
        }
      } else if (media!.kind === MediaKindEnum.PHOTO && media!.ownerType === MediaOwnerTypeEnum.REVIEW) {
        await this.syncReviewPhotoCount(Number(media!.ownerId), transaction);
      }
    });
  }
}
