import { SavedPlaceRepository } from '../repositories/savedPlaceRepository';
import { SavedPlaceInterface } from '../interfaces/savedPlaceInterface';
import { SavedListTypeEnum } from '../enums/savedListTypeEnum';
import { throwError } from '../helpers/errorHelper';

export class SavedPlaceService {
  private repository: SavedPlaceRepository;

  constructor() {
    this.repository = new SavedPlaceRepository();
  }

  // Mirrors ReviewVoteService.toggle - no transaction needed here (unlike
  // that one) since there's no derived/materialized count on another table
  // to keep in sync, just this one row.
  async toggle(userId: string, placeId: number): Promise<{ savedByMe: boolean; listType: SavedListTypeEnum | null }> {
    const existing = await this.repository.findOne({ where: { userId, placeId } });

    if (existing) {
      await this.repository.deleteMany({ where: { userId, placeId } });
      return { savedByMe: false, listType: null };
    }

    const created = await this.repository.create({ userId, placeId, listType: SavedListTypeEnum.SAVED });
    return { savedByMe: true, listType: created.listType };
  }

  async setListType(userId: string, placeId: number, listType: SavedListTypeEnum): Promise<SavedPlaceInterface> {
    const existing = await this.repository.findOne({ where: { userId, placeId } });
    if (!existing) {
      throwError("This place hasn't been saved yet.", "NOT_FOUND", 404);
    }

    await this.repository.updateOne({ id: existing.id, input: { listType } });
    return this.repository.findOne({ where: { userId, placeId } });
  }

  // Unfiltered - the ALL/WANT_TO_VISIT/FAVORITE tab split happens as a plain
  // JS filter over this one result set in the resolver (same "start simple,
  // compute in memory" precedent as businessDashboardMath.ts). Reviewed is
  // deliberately not representable here at all - see
  // docs/specs/phase-5-saved-places.md.
  async getForUser(userId: string): Promise<SavedPlaceInterface[]> {
    return this.repository.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
  }

  async hasSaved(placeId: number | string, userId?: string): Promise<SavedPlaceInterface | null> {
    if (!userId) {
      return null;
    }
    return (await this.repository.findOne({ where: { placeId, userId } })) ?? null;
  }

  // Backs ReviewService's WATCHED_PLACE_REVIEW notification - every user who
  // has this place saved (any list type), regardless of who saved it.
  async getSaverUserIds(placeId: number): Promise<string[]> {
    const rows = await this.repository.findAll({ where: { placeId } });
    return rows.map((r) => r.userId);
  }
}
