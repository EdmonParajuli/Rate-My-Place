import { InputCategoryInterface, CategoryInterface } from '../interfaces/categoryInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';

export class CategoryRepository extends BaseRepository<InputCategoryInterface, CategoryInterface> {
  constructor() {
    super(Model.Category);
  }
}
