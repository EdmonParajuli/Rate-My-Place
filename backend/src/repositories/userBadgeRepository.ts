import { InputUserBadgeInterface, UserBadgeInterface } from '../interfaces/userBadgeInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';

export class UserBadgeRepository extends BaseRepository<InputUserBadgeInterface, UserBadgeInterface> {
  constructor() {
    super(Model.UserBadge);
  }
}
