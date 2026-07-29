import { InputPlaceInterface, PlaceInterface } from '../interfaces/placeInterface';
import PlaceRepository from '../repositories/placeRepository';
import { throwError } from '../helpers/errorHelper';

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
}
