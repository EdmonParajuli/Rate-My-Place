import * as Sequelize from 'sequelize';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { InputReviewInterface, ReviewInterface } from '../interfaces/reviewInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';
import { Base64 } from '../packages/cursors/utils';
import { CursorDataInterface, CursorDirectionEnum, CursorQueryResponseInterface, SortEnum } from '../packages/cursors/service';

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
      const sortComparator = cursorQuery.sort === SortEnum.Asc ? Op.gt : Op.lt;
      const cursorComparator =
        cursorQuery.direction === CursorDirectionEnum.Next
          ? cursorQuery.withCursor ? Op.gte : Op.gt
          : cursorQuery.withCursor ? Op.lte : Op.lt;

      where = {
        [Op.and]: [
          baseWhere,
          {
            [Op.or]: [
              { [cursorQuery.order]: { [sortComparator]: sortValue } },
              { [cursorQuery.order]: sortValue, id: { [cursorComparator]: id } },
            ],
          },
        ],
      };
    }

    return this.model.findAll({
      where,
      order: [
        [cursorQuery.order, cursorQuery.sort],
        [cursorQuery.cursorOrder, cursorQuery.cursorSort],
      ],
      limit: cursorQuery.limit + 1,
    });
  }
}
