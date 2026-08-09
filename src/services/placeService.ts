import { Transaction } from 'sequelize';
import { InputPlaceInterface } from '../interfaces/placeInterface';
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

  // sort defaults to NEW, matching placeReviews'/myReviews' "newest first"
  // default from Phase 2. HIGHEST_RATED/TRENDING are deferred to follow-up
  // tickets (TRENDING specifically needs the scheduled trending_score refresh
  // job, which doesn't exist yet), so PlaceSortEnum only has two values today.
  async listPlaces({
    sort,
    near,
    first,
    after,
  }: {
    sort?: PlaceSortEnum;
    near?: { latitude: number; longitude: number };
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
      const rows = await this.repository.paginateByDistance(near!, cursorQuery);
      const { cursor: pageInfo, data } = this.pagination.paginate(rows, cursorQuery);

      return { data, pageInfo };
    }

    const cursorQuery = this.pagination.validateParameters({
      cursor: after,
      limit: first,
      order: 'createdAt',
      sort: SortEnum.Desc,
    });
    const rows = await this.repository.paginateByCreatedAt(cursorQuery);
    const { cursor: pageInfo, data } = this.pagination.paginate(rows, cursorQuery);

    return { data, pageInfo };
  }

  async getPlaceById(id: number) {
    return this.repository.findByPk(id);
  }

  async createPlace(input: InputPlaceInterface) {
    return this.repository.create(input);
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
}
