import { UserRepository } from "../repositories/userRepository";

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async getById(id: number | string) {
    return this.repository.findByPk(id);
  }
}
