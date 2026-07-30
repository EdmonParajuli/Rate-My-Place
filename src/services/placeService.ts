import { Transaction } from 'sequelize';
import { InputPlaceInterface } from '../interfaces/placeInterface';
import PlaceRepository from '../repositories/placeRepository';
import { assertOwnership } from '../utils/auth';

export default class PlaceService {
  private repository: PlaceRepository;

  constructor() {
    this.repository = new PlaceRepository();
  }

  // async listPlaces() {
  //   return this.repository.findAll();
  // }

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
    return this.repository.updateOne({ id: placeId, input });
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
