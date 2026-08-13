import { Transaction } from 'sequelize';
import Model from '../models';
import { InputPlaceHourInterface, PlaceHourInterface } from '../interfaces/placeHourInterface';
import { BaseRepository } from './baseRepository';

export class PlaceHourRepository extends BaseRepository<InputPlaceHourInterface, PlaceHourInterface> {
  constructor() {
    super(Model.PlaceHour);
  }

  // Whole-week replace, not per-day create/update/delete - matches how the
  // hours form is naturally edited (the whole week at once, then save).
  async replaceForPlace(
    placeId: number,
    hours: Omit<InputPlaceHourInterface, 'placeId'>[],
    transaction: Transaction
  ): Promise<void> {
    await this.model.destroy({ where: { placeId }, transaction });
    if (hours.length === 0) {
      return;
    }
    await this.model.bulkCreate(
      hours.map((hour) => ({ ...hour, placeId })),
      { transaction }
    );
  }
}
