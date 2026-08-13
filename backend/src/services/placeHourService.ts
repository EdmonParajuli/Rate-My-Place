import { PlaceHourRepository } from '../repositories/placeHourRepository';
import { InputPlaceHourInterface } from '../interfaces/placeHourInterface';
import PlaceService from './placeService';
import { Database } from '../config';
import { throwError } from '../helpers/errorHelper';
import { assertOwnership } from '../utils/auth';
import { getCurrentServerDayAndTime } from '../utils/businessHours';

export class PlaceHourService {
  private repository: PlaceHourRepository;
  private placeService: PlaceService;

  constructor() {
    this.repository = new PlaceHourRepository();
    this.placeService = new PlaceService();
  }

  async replaceForPlace({
    placeId,
    requestingUserId,
    hours,
  }: {
    placeId: number;
    requestingUserId: string;
    hours: Omit<InputPlaceHourInterface, 'placeId'>[];
  }) {
    const place = await this.placeService.getPlaceById(placeId);
    if (!place) {
      throwError(`Place with ID ${placeId} not found`, "NOT_FOUND", 404);
    }
    assertOwnership(place.ownerId, requestingUserId, "You do not own this place.");

    const transaction = await Database.sequelize.transaction();
    try {
      await this.repository.replaceForPlace(placeId, hours, transaction);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return this.getForPlace(placeId);
  }

  async getForPlace(placeId: number | string) {
    return this.repository.findAll({ where: { placeId }, order: [['dayOfWeek', 'ASC']] });
  }

  // null (not false) when a place has no hours rows at all - "hours unknown"
  // is a genuinely different state from "known closed right now", same
  // "resolves null, not a guess" precedent as Review.reply/Place.distance.
  async isOpenNow(placeId: number | string): Promise<boolean | null> {
    const hours = await this.getForPlace(placeId);
    if (hours.length === 0) {
      return null;
    }

    const { dayOfWeek, time } = getCurrentServerDayAndTime();
    return hours.some((hour) => hour.dayOfWeek === dayOfWeek && hour.opensAt <= time && hour.closesAt > time);
  }
}
