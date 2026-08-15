import { UserRepository } from "../repositories/userRepository";

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async getById(id: number | string) {
    return this.repository.findByPk(id);
  }

  // updateOne returns an affected-row count, not the row itself (same shape
  // every other BaseRepository.updateOne caller in this codebase works
  // around) - re-fetch so the resolver has a real User to return.
  async updateUser(id: number | string, fullName: string) {
    await this.repository.updateOne({ id, input: { fullName } });
    return this.repository.findByPk(id);
  }
}
