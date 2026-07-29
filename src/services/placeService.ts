import { InputPlaceInterface, PlaceInterface } from '../interfaces/placeInterface';
import PlaceRepository from '../repositories/placeRepository';

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

  async updatePlace({ placeId, input }: { placeId: number; input: InputPlaceInterface }) {
    const existingPlace = await this.getPlaceById(placeId);
    if (!existingPlace) {
      throw new Error(`Place with ID ${placeId} not found`);
    }
    return this.repository.updateOne({ id: placeId, input });
  }

  async delete(placeId: number) {
    const placeExists = await this.getPlaceById(placeId);
    if(!placeExists){
      throw new Error(`Place with ID ${placeId} not found`);
    }
    return this.repository.deleteOne(placeId);
  }
}
