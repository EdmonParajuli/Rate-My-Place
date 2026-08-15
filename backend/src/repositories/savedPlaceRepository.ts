import { InputSavedPlaceInterface, SavedPlaceInterface } from '../interfaces/savedPlaceInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';

export class SavedPlaceRepository extends BaseRepository<InputSavedPlaceInterface, SavedPlaceInterface> {
  constructor() {
    super(Model.SavedPlace);
  }
}
