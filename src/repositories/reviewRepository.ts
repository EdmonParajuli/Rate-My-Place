import * as Sequelize from 'sequelize';
import { Transaction } from 'sequelize';
import { InputReviewInterface, ReviewInterface } from '../interfaces/reviewInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';

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
}
