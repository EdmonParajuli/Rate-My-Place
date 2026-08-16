import { Transaction } from "sequelize";
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

  // Called by MediaService inside its own transaction after writing the
  // providers_media audit row - profilePicture/coverPicture are a
  // denormalized read cache (same "recompute, store, read the column"
  // pattern as Place.averageRating) so every place/review list that embeds
  // User.profilePicture stays a plain column read, not a per-row Media
  // lookup.
  // url: null clears it (used when the current avatar/cover is removed via
  // MediaService.removeMedia).
  async updateProfilePicture(id: number | string, url: string | null, transaction?: Transaction) {
    await this.repository.updateOne({ id, input: { profilePicture: url } }, { transaction });
  }

  async updateCoverPicture(id: number | string, url: string | null, transaction?: Transaction) {
    await this.repository.updateOne({ id, input: { coverPicture: url } }, { transaction });
  }
}
