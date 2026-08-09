import { literal, Op, QueryTypes, WhereOptions } from 'sequelize';
import Model from '../models';
import { InputPlaceInterface, PlaceFilterOptions, PlaceInterface } from '../interfaces';
import { BaseRepository } from './baseRepository';
import { Database } from '../config';
import { Base64 } from '../packages/cursors/utils';
import { CursorDataInterface, CursorQueryResponseInterface, SortEnum } from '../packages/cursors/service';
import { getCurrentServerDayAndTime } from '../utils/businessHours';

// How far out a NEAREST search looks before ranking by exact distance - the
// bounding box this produces is what keeps paginateByDistance's Haversine
// computation cheap (run only over the pre-filtered candidates, not every
// row). See docs/07-geo-and-location-strategy.md §4-5.
const MAX_SEARCH_RADIUS_KM = 50;
const KM_PER_DEGREE_LATITUDE = 111;

export default class PlaceRepository extends BaseRepository<InputPlaceInterface, PlaceInterface> {
  constructor() {
    super(Model.Place);
  }

  // sort: NEW / HIGHEST_RATED - same keyset-pagination shape as
  // ReviewRepository.paginate, ordering on a real, stored column
  // (createdAt or averageRating - whichever cursorQuery.order names), so
  // plain Sequelize where/Op is enough; nothing here is specific to either
  // column. See ReviewRepository.paginate for why the id tie-breaker's
  // comparator is derived from the caller's sort direction.
  async paginateByColumn(
    cursorQuery: CursorQueryResponseInterface,
    filter?: PlaceFilterOptions
  ): Promise<PlaceInterface[]> {
    const conditions: (WhereOptions | ReturnType<typeof literal>)[] = [];

    if (cursorQuery.cursor) {
      const { id, sortValue } = Base64.decode<CursorDataInterface>(cursorQuery.cursor);
      const comparator = cursorQuery.sort === SortEnum.Asc ? Op.gt : Op.lt;

      conditions.push({
        [Op.or]: [
          { [cursorQuery.order]: { [comparator]: sortValue } },
          { [cursorQuery.order]: sortValue, id: { [comparator]: id } },
        ],
      });
    }

    if (filter?.categoryId !== undefined) {
      conditions.push({ categoryId: filter.categoryId });
    }
    if (filter?.priceRange) {
      conditions.push({ priceRange: filter.priceRange });
    }
    if (filter?.minRating !== undefined) {
      conditions.push({ averageRating: { [Op.gte]: filter.minRating } });
    }
    if (filter?.query) {
      conditions.push({ label: { [Op.iLike]: `%${filter.query}%` } });
    }
    if (filter?.openNow) {
      conditions.push(literal(this.openNowExistsSql()));
    }

    const where: WhereOptions = conditions.length > 0 ? { [Op.and]: conditions } : {};

    return this.model.findAll({
      where,
      order: [
        [cursorQuery.order, cursorQuery.sort],
        [cursorQuery.cursorOrder, cursorQuery.sort],
      ],
      limit: cursorQuery.limit + 1,
    });
  }

  // Server-computed day-of-week/time only (never caller input), still run
  // through sequelize.escape() for correct SQL literal formatting and to
  // keep the "never bare-interpolate into raw SQL" discipline uniform
  // regardless of whether a given value happens to be attacker-reachable.
  private openNowExistsSql(): string {
    const { dayOfWeek, time } = getCurrentServerDayAndTime();

    return `EXISTS (
      SELECT 1 FROM providers_place_hours
      WHERE providers_place_hours.place_id = providers_places.id
        AND providers_place_hours.day_of_week = ${Database.sequelize.escape(dayOfWeek)}
        AND providers_place_hours.opens_at <= ${Database.sequelize.escape(time)}
        AND providers_place_hours.closes_at > ${Database.sequelize.escape(time)}
    )`;
  }

  // sort: NEAREST - distance is computed, not a stored column, so it can't be
  // referenced in a WHERE clause the way a real column can (Postgres doesn't
  // allow a SELECT-list alias in WHERE, only in ORDER BY). Wrapping the
  // Haversine computation in a subquery and filtering/ordering in the outer
  // query is the standard way around that - the alias becomes a real column
  // of the derived table once it's wrapped. This is why this method drops to
  // raw SQL (via sequelize.query + named `replacements`, Sequelize's actual
  // parameterization mechanism - not string interpolation, not the
  // queryBuilder.ts package ticket 05 flagged as unsafe) instead of the
  // ORM's where/attributes API like paginateByCreatedAt above.
  async paginateByDistance(
    { latitude, longitude }: { latitude: number; longitude: number },
    cursorQuery: CursorQueryResponseInterface,
    filter?: PlaceFilterOptions
  ): Promise<PlaceInterface[]> {
    let cursorId: number | string | null = null;
    let cursorDistance: number | null = null;

    if (cursorQuery.cursor) {
      const decoded = Base64.decode<CursorDataInterface>(cursorQuery.cursor);
      cursorId = decoded.id;
      cursorDistance = Number(decoded.sortValue);
    }

    // A degree of longitude covers less ground the further from the equator
    // you are - dividing by cos(latitude) keeps the box roughly square in km
    // rather than narrowing to nothing near the poles. Clamped so a place
    // exactly at the poles (cos(90) = 0) can't produce a divide-by-zero box.
    const latDelta = MAX_SEARCH_RADIUS_KM / KM_PER_DEGREE_LATITUDE;
    const lngDelta =
      MAX_SEARCH_RADIUS_KM / (KM_PER_DEGREE_LATITUDE * Math.max(Math.cos((latitude * Math.PI) / 180), 0.01));

    const openNowClause = filter?.openNow ? `AND ${this.openNowExistsSql()}` : '';

    // Columns explicitly aliased to their camelCase JS names - raw
    // sequelize.query results, unlike the ORM path, don't get the model's
    // usual underscored-column-to-camelCase-attribute mapping applied
    // automatically, so every downstream consumer (Place.owner's
    // parent.ownerId, GraphQL's averageRating/reviewCount/isVerified fields)
    // would silently see undefined without this.
    const rows = await Database.sequelize.query<PlaceInterface>(
      `
      SELECT * FROM (
        SELECT
          id,
          owner_id AS "ownerId",
          label,
          description,
          address,
          phone,
          website,
          category_id AS "categoryId",
          average_rating AS "averageRating",
          review_count AS "reviewCount",
          is_verified AS "isVerified",
          latitude,
          longitude,
          price_range AS "priceRange",
          created_at AS "createdAt",
          updated_at AS "updatedAt",
          deleted_at AS "deletedAt",
          (
            6371 * acos(
              LEAST(1, GREATEST(-1,
                cos(radians(:lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians(:lng))
                + sin(radians(:lat)) * sin(radians(latitude))
              ))
            )
          ) AS distance
        FROM providers_places
        WHERE deleted_at IS NULL
          AND latitude IS NOT NULL AND longitude IS NOT NULL
          AND latitude BETWEEN :minLat AND :maxLat
          AND longitude BETWEEN :minLng AND :maxLng
          AND (:categoryId IS NULL OR category_id = :categoryId)
          AND (:priceRange IS NULL OR price_range = :priceRange)
          AND (:minRating IS NULL OR average_rating >= :minRating)
          AND (:query IS NULL OR label ILIKE '%' || :query || '%')
          ${openNowClause}
      ) candidates
      WHERE :cursorDistance IS NULL
        OR (candidates.distance, candidates.id) > (:cursorDistance, :cursorId)
      ORDER BY candidates.distance ASC, candidates.id ASC
      LIMIT :limit
      `,
      {
        type: QueryTypes.SELECT,
        replacements: {
          lat: latitude,
          lng: longitude,
          minLat: latitude - latDelta,
          maxLat: latitude + latDelta,
          minLng: longitude - lngDelta,
          maxLng: longitude + lngDelta,
          categoryId: filter?.categoryId ?? null,
          priceRange: filter?.priceRange ?? null,
          minRating: filter?.minRating ?? null,
          query: filter?.query ?? null,
          cursorDistance,
          cursorId,
          limit: cursorQuery.limit + 1,
        },
      }
    );

    return rows;
  }
}
