import { Transaction } from 'sequelize';
import { MediaRepository } from '../repositories/mediaRepository';
import { UserService } from './userService';
import { MediaOwnerTypeEnum } from '../enums/mediaOwnerTypeEnum';
import { MediaKindEnum } from '../enums/mediaKindEnum';
import { Database, cloudinary as cloudinaryConfig } from '../config';
import { generateUploadSignature } from '../utils/cloudinary';
import { throwError } from '../helpers/errorHelper';

// Only self-serve USER avatar/cover is implemented - ownerType/ownerId
// aren't exposed on the GraphQL layer yet (no way to request PLACE/REVIEW
// today), even though the providers_media table and MediaOwnerTypeEnum
// already support the full polymorphic shape doc 3 designed. Extending to
// place/review photos is a later, separate ticket - see
// docs/specs/phase-8-media-plumbing.md.
export class MediaService {
  private repository: MediaRepository;
  private userService: UserService;

  constructor() {
    this.repository = new MediaRepository();
    this.userService = new UserService();
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

  // kind is a GraphQL enum that also allows PHOTO - reject it here since
  // there's no owner for a self-serve upload to attach a PHOTO to yet.
  getUploadSignature(userId: string, kind: MediaKindEnum) {
    if (kind !== MediaKindEnum.AVATAR && kind !== MediaKindEnum.COVER) {
      throwError("Only AVATAR or COVER uploads are supported so far.", "BAD_REQUEST", 400);
    }

    const folder = `rate-my-place/users/${userId}/${kind.toLowerCase()}`;
    const { signature, timestamp } = generateUploadSignature(folder);

    return {
      signature,
      timestamp,
      apiKey: cloudinaryConfig.apiKey,
      cloudName: cloudinaryConfig.cloudName,
      folder,
    };
  }

  // AVATAR/COVER are single-slot, not a gallery - the previous row (if any)
  // is replaced, not accumulated. Writes both the audit row and the
  // denormalized User column in one transaction so they never disagree.
  async attachMedia(userId: string, { kind, url }: { kind: MediaKindEnum.AVATAR | MediaKindEnum.COVER; url: string }) {
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
}
