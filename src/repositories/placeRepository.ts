import Model from '../models';
import { InputPlaceInterface, PlaceInterface } from '../interfaces';
import { BaseRepository } from './baseRepository';

export default class PlaceRepository extends BaseRepository<InputPlaceInterface, PlaceInterface> {
  constructor() {
    super(Model.Place);
  }
}
