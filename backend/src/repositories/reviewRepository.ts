import * as Sequelize from 'sequelize';
import { col, fn, Op, Transaction, WhereOptions } from 'sequelize';
import { InputReviewInterface, ReviewInterface } from '../interfaces/reviewInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';
import { Base64 } from '../packages/cursors/utils';
import { CursorDataInterface, CursorQueryResponseInterface, SortEnum } from '../packages/cursors/service';

export class ReviewRepository extends BaseRepository<InputReviewInterface, ReviewInterface> {
  constructor() {
    super(Model.Review);
  }

  async getRatingStats(placeId: number, transaction?: Transaction): Promise<{ average: number; count: number }> {
    const count: number = await this.model.count({ where: { placeId }, transaction });

    if (count === 0) {
      return { average: 0, count: 0 };
    }

    // rating is stored as INTEGER, and Sequelize's aggregate() parses the SQL
    // result using the field's declared type by default - without an explicit
    // dataType override here, a fractional AVG (e.g. 3.5) gets silently
    // coerced back to an integer (3) before it ever reaches this code.
    const average = await this.model.aggregate('rating', 'avg', {
      where: { placeId },
      transaction,
      dataType: Sequelize.DataTypes.FLOAT,
    });

    return { average: Number(average), count };
  }

  // Live-computed, not materialized - same "recompute from source" precedent
  // as getRatingStats above and as Category.businessCount/avgRating
  // (docs/03-architecture.md's Place Detail follow-ups section). Sequelize's
  // typed fn/col group-by, not raw SQL - the ORM can express this one fine,
  // unlike paginateByDistance's Haversine expression above.
  async getRatingBreakdown(placeId: number | string): Promise<{ stars: number; count: number }[]> {
    const rows = (await this.model.findAll({
      attributes: ['rating', [fn('COUNT', col('id')), 'count']],
      where: { placeId },
      group: ['rating'],
      raw: true,
    })) as unknown as { rating: number; count: string }[];

    // COUNT(*) comes back as a string (Postgres bigint), and only star values
    // with at least one review get a row at all - fill in the full 5..1 range
    // with zero counts so callers (the Place Detail bar chart) don't have to.
    const counts = new Map(rows.map((r) => [Number(r.rating), Number(r.count)]));
    return [5, 4, 3, 2, 1].map((stars) => ({ stars, count: counts.get(stars) ?? 0 }));
  }

  // Backs BadgeService's criteria checks - one aggregate query per stat,
  // same style as getRatingStats above (this.model.aggregate with an explicit
  // dataType so Postgres's bigint-as-string COUNT/SUM results come back as
  // real numbers). No transaction needed - badge evaluation is a plain read.
  async getReviewerStats(reviewerId: string): Promise<{ reviewCount: number; helpfulVotesReceived: number; distinctPlacesReviewed: number }> {
    const reviewCount: number = await this.model.count({ where: { reviewerId } });

    if (reviewCount === 0) {
      return { reviewCount: 0, helpfulVotesReceived: 0, distinctPlacesReviewed: 0 };
    }

    const helpfulVotesReceived = await this.model.aggregate('helpfulCount', 'sum', {
      where: { reviewerId },
      dataType: Sequelize.DataTypes.INTEGER,
    });

    const distinctPlacesReviewed = await this.model.aggregate('placeId', 'count', {
      where: { reviewerId },
      distinct: true,
      dataType: Sequelize.DataTypes.INTEGER,
    });

    return {
      reviewCount,
      helpfulVotesReceived: Number(helpfulVotesReceived) || 0,
      distinctPlacesReviewed: Number(distinctPlacesReviewed) || 0,
    };
  }

  // Keyset (cursor) pagination built directly on Sequelize's own where/Op -
  // parameterized automatically, unlike the vendored CursorPaginate/QueryBuilder
  // helper in src/packages/cursors, which builds raw SQL by string-interpolating
  // values and is a SQL injection risk if ever fed user input. Only the safe,
  // DB-agnostic row-processing parts of that package (CursorBasedPagination,
  // Base64) are reused here - not its query-building.
  async paginate(baseWhere: WhereOptions, cursorQuery: CursorQueryResponseInterface): Promise<ReviewInterface[]> {
    let where: WhereOptions = baseWhere;

    if (cursorQuery.cursor) {
      const { id, sortValue } = Base64.decode<CursorDataInterface>(cursorQuery.cursor);

      // The id tie-breaker moves in the same direction as the primary sort,
      // not the direction CursorBasedPagination.validateParameters computes
      // for cursorSort (which only tracks pagination direction, Next/Previous,
      // independent of the caller's chosen sort order). Using that value here
      // would order tied rows (identical createdAt) oldest-of-the-pair-first
      // even under a "newest first" sort. This phase only supports one fixed
      // sort order and forward pagination, so a single comparator is correct
      // for both the primary field and its tie-breaker.
      const comparator = cursorQuery.sort === SortEnum.Asc ? Op.gt : Op.lt;

      where = {
        [Op.and]: [
          baseWhere,
          {
            [Op.or]: [
              { [cursorQuery.order]: { [comparator]: sortValue } },
              { [cursorQuery.order]: sortValue, id: { [comparator]: id } },
            ],
          },
        ],
      };
    }

    return this.model.findAll({
      where,
      order: [
        [cursorQuery.order, cursorQuery.sort],
        [cursorQuery.cursorOrder, cursorQuery.sort],
      ],
      limit: cursorQuery.limit + 1,
    });
  }
}
