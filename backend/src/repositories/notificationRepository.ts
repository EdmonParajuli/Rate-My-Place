import { InputNotificationInterface, NotificationInterface } from '../interfaces/notificationInterface';
import Model from '../models';
import { BaseRepository } from './baseRepository';

export class NotificationRepository extends BaseRepository<InputNotificationInterface, NotificationInterface> {
  constructor() {
    super(Model.Notification);
  }

  // Same single-purpose count shape as ReviewVoteRepository.countForReview -
  // backs the nav badge's unreadNotificationCount query.
  async countUnread(userId: string): Promise<number> {
    return this.model.count({ where: { userId, read: false } });
  }

  // BaseRepository.updateOne only targets a single id - "mark all as read"
  // needs a bulk where-scoped update, so this goes through this.model
  // directly, same as every other repository method that needs a shape
  // BaseRepository doesn't generically express.
  async markAllReadForUser(userId: string): Promise<[number]> {
    return this.model.update({ read: true }, { where: { userId, read: false } });
  }
}
