import { Transaction } from 'sequelize';
import { InputMediaInterface, MediaInterface } from '../interfaces/mediaInterface';
import { MediaOwnerTypeEnum } from '../enums/mediaOwnerTypeEnum';
import { MediaKindEnum } from '../enums/mediaKindEnum';
import Model from '../models';
import { BaseRepository } from './baseRepository';

export class MediaRepository extends BaseRepository<InputMediaInterface, MediaInterface> {
  constructor() {
    super(Model.Media);
  }

  // AVATAR/COVER are single-slot per owner (not a gallery) - MediaService
  // calls this before creating the new row so at most one row per
  // (ownerType, ownerId, kind) survives. Not used yet for PHOTO, which will
  // be a real multi-row gallery once place/review photos land.
  async deleteAllForOwner(
    ownerType: MediaOwnerTypeEnum,
    ownerId: number,
    kind: MediaKindEnum,
    transaction: Transaction
  ): Promise<number> {
    return this.deleteMany({ where: { ownerType, ownerId, kind }, transaction });
  }
}
