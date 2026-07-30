import { Transaction } from 'sequelize';
import { InputPlaceInterface, PlaceInterface } from '../interfaces/placeInterface';
import PlaceRepository from '../repositories/placeRepository';
import { ReviewRepository } from '../repositories/reviewRepository';
import { throwError } from '../helpers/errorHelper';

export default class PlaceService {
  private repository: PlaceRepository;
  private reviewRepository: ReviewRepository;

  constructor() {
    this.repository = new PlaceRepository();
    this.reviewRepository = new ReviewRepository();
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

  private assertOwnership(place: PlaceInterface, requestingUserId: string) {
    if (String(place.ownerId) !== String(requestingUserId)) {
      throwError("You do not own this place.", "FORBIDDEN", 403);
    }
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
    this.assertOwnership(existingPlace, requestingUserId);
    return this.repository.updateOne({ id: placeId, input });
  }

  async delete(placeId: number, requestingUserId: string) {
    const existingPlace = await this.getPlaceById(placeId);
    if(!existingPlace){
      throw new Error(`Place with ID ${placeId} not found`);
    }
    this.assertOwnership(existingPlace, requestingUserId);
    return this.repository.deleteOne(placeId);
  }

  // Recomputes from source (AVG/COUNT over the place's current reviews) rather
  // than incrementally adjusting a running counter - simpler and correct by
  // construction, cheap enough given the index on place_id.
  async recomputeRatingStats(placeId: number, transaction?: Transaction) {
    const { average, count } = await this.reviewRepository.getRatingStats(placeId, transaction);
    return this.repository.updateOne(
      { id: placeId, input: { averageRating: average, reviewCount: count } },
      { transaction }
    );
  }
}
