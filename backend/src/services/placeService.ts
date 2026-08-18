import { Transaction } from 'sequelize';
import { InputPlaceInterface, PlaceFilterOptions } from '../interfaces/placeInterface';
import PlaceRepository from '../repositories/placeRepository';
import { assertOwnership } from '../utils/auth';
import { throwError } from '../helpers/errorHelper';
import { PlaceSortEnum } from '../enums/placeSortEnum';
import { CursorBasedPagination, SortEnum } from '../packages/cursors/service';

export default class PlaceService {
  private repository: PlaceRepository;
  private pagination: CursorBasedPagination;

  constructor() {
    this.repository = new PlaceRepository();
    this.pagination = new CursorBasedPagination();
  }

  // Column-based sorts: each just names a real, stored column to order by -
  // PlaceRepository.paginateByColumn doesn't care which. TRENDING sorts on
  // trending_score, refreshed hourly by src/jobs/trendingScoreJob.ts (see
  // docs/08-trending-strategy.md) rather than computed live per request -
  // NEAREST is the one sort that isn't a stored column, handled separately
  // below.
  private static readonly COLUMN_SORTS: Partial<Record<PlaceSortEnum, { order: string; sort: SortEnum }>> = {
    [PlaceSortEnum.NEW]: { order: 'createdAt', sort: SortEnum.Desc },
    [PlaceSortEnum.HIGHEST_RATED]: { order: 'averageRating', sort: SortEnum.Desc },
    [PlaceSortEnum.TRENDING]: { order: 'trendingScore', sort: SortEnum.Desc },
  };

  async listPlaces({
    sort,
    near,
    filter,
    first,
    after,
  }: {
    sort?: PlaceSortEnum;
    near?: { latitude: number; longitude: number };
    filter?: PlaceFilterOptions;
    first?: number;
    after?: string;
  }) {
    const resolvedSort = sort ?? PlaceSortEnum.NEW;

    if (resolvedSort === PlaceSortEnum.NEAREST) {
      if (!near) {
        throwError("`near` is required when sorting by NEAREST.", "BAD_REQUEST", 400);
      }

      const cursorQuery = this.pagination.validateParameters({
        cursor: after,
        limit: first,
        order: 'distance',
        sort: SortEnum.Asc,
      });
      // near is guaranteed defined by the throwError above (TS's never-return
      // narrowing doesn't reach across the intervening statements here).
      const rows = await this.repository.paginateByDistance(near!, cursorQuery, filter);
      const { cursor: pageInfo, data } = this.pagination.paginate(rows, cursorQuery);

      return { data, pageInfo };
    }

    const columnSort = PlaceService.COLUMN_SORTS[resolvedSort];
    if (!columnSort) {
      throwError(`Sort '${resolvedSort}' is not yet supported.`, "BAD_REQUEST", 400);
    }

    const cursorQuery = this.pagination.validateParameters({
      cursor: after,
      limit: first,
      order: columnSort!.order,
      sort: columnSort!.sort,
    });
    const rows = await this.repository.paginateByColumn(cursorQuery, filter);
    const { cursor: pageInfo, data } = this.pagination.paginate(rows, cursorQuery);

    return { data, pageInfo };
  }

  async getPlaceById(id: number) {
    return this.repository.findByPk(id);
  }

  // Thin passthrough - BusinessDashboardService derives "the caller's place"
  // from context.user.id rather than a caller-supplied placeId. A business
  // account owns exactly one place today (created atomically by
  // signUpBusiness), so findOne is sufficient - no multi-place support yet.
  async getByOwnerId(ownerId: string) {
    return this.repository.findOne({ where: { ownerId } });
  }

  // transaction is optional - BusinessOnboardingService.signUpBusiness passes one
  // so the Place write commits atomically with the owning User's creation;
  // createPlace's normal caller (placeResolver.ts) omits it, same as
  // updateRatingStats below.
  async createPlace(input: InputPlaceInterface, transaction?: Transaction) {
    return this.repository.create(input, { transaction });
  }

  async updatePlace({
    placeId,
    input,
    requestingUserId,
  }: {
    placeId: number;
    input: InputPlaceInterface;
    requestingUserId: string;
  }) {
    const existingPlace = await this.getPlaceById(placeId);
    if (!existingPlace) {
      throw new Error(`Place with ID ${placeId} not found`);
    }
    assertOwnership(existingPlace.ownerId, requestingUserId, "You do not own this place.");

    // repository.updateOne resolves to Sequelize's [affectedCount] from
    // Model.update, not the updated row - returning that directly serialized
    // every field of the mutation's response as null. Same bug class ticket
    // 04 fixed for ReviewService.updateReview; same fix, a post-write re-fetch.
    await this.repository.updateOne({ id: placeId, input });
    return this.getPlaceById(placeId);
  }

  async delete(placeId: number, requestingUserId: string) {
    const existingPlace = await this.getPlaceById(placeId);
    if(!existingPlace){
      throw new Error(`Place with ID ${placeId} not found`);
    }
    assertOwnership(existingPlace.ownerId, requestingUserId, "You do not own this place.");
    return this.repository.deleteOne(placeId);
  }

  // Thin passthrough - src/jobs/trendingScoreJob.ts is a caller like any
  // other (a resolver, a service), so it goes through PlaceService rather
  // than touching PlaceRepository directly, same layering as everything else.
  async refreshTrendingScores(): Promise<void> {
    return this.repository.refreshTrendingScores();
  }

  // Thin passthrough - categoryResolver.ts's Category.businessCount/avgRating
  // field resolvers call this directly, same pattern as reviewResolver.ts's
  // Review.reviewer/place field resolvers calling UserService/PlaceService
  // directly rather than routing through the "owning" service.
  async getCategoryStats(categoryId: number | string) {
    return this.repository.getCategoryStats(categoryId);
  }

  // Thin passthrough - PlatformStatsService composes this with
  // ReviewService.countAll() rather than either service reaching into the
  // other's repository directly.
  async countAll(): Promise<number> {
    return this.repository.count({});
  }

  // Pure write - the caller (ReviewService, which owns the review data) computes
  // the stats. Keeps PlaceService from needing to know anything about reviews.
  async updateRatingStats(
    placeId: number,
    { averageRating, reviewCount }: { averageRating: number; reviewCount: number },
    transaction?: Transaction
  ) {
    return this.repository.updateOne(
      { id: placeId, input: { averageRating, reviewCount } },
      { transaction }
    );
  }

  // Called by MediaService inside its own transaction, mirroring
  // UserService.updateProfilePicture/updateCoverPicture - coverPhotoUrl is a
  // denormalized read cache (same "recompute and store" precedent as
  // averageRating/reviewCount above) so Discover's card grid stays a plain
  // column read. url: null clears it (used when the current cover photo is
  // removed via MediaService.removeMedia).
  async updateCoverPhoto(placeId: number, url: string | null, transaction?: Transaction) {
    await this.repository.updateOne({ id: placeId, input: { coverPhotoUrl: url } }, { transaction });
  }

  // Same shape/reasoning as updateCoverPhoto above - a distinct single-slot
  // image (the square logo shown next to the place name via an AVATAR media
  // row), not the wide cover banner.
  async updateProfilePicture(placeId: number, url: string | null, transaction?: Transaction) {
    await this.repository.updateOne({ id: placeId, input: { profilePicture: url } }, { transaction });
  }
}
