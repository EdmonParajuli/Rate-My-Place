import { InputBadgeInterface, BadgeInterface } from '../interfaces/badgeInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';

export class BadgeRepository extends BaseRepository<InputBadgeInterface, BadgeInterface> {
  constructor() {
    super(Model.Badge);
  }
}
