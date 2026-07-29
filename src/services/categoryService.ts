import { CategoryRepository } from '../repositories/categoryRepository';
import { throwError } from '../helpers/errorHelper';

export class CategoryService {
  private repository: CategoryRepository;

  constructor() {
    this.repository = new CategoryRepository();
  }

  async list() {
    return this.repository.findAll({});
  }

  async getById(id: number) {
    const category = await this.repository.findByPk(id);
    if (!category) {
      throwError(`Category with ID ${id} not found`, "NOT_FOUND", 404);
    }
    return category;
  }
}
