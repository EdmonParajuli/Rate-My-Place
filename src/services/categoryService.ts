import { CategoryRepository } from '../repositories/categoryRepository';

export class CategoryService {
  private repository: CategoryRepository;

  constructor() {
    this.repository = new CategoryRepository();
  }

  async list() {
    return this.repository.findAll({});
  }

  async getById(id: number) {
    return this.repository.findByPk(id);
  }
}
