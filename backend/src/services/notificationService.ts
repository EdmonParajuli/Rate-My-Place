import { NotificationRepository } from '../repositories/notificationRepository';
import { NotificationTypeEnum } from '../enums/notificationTypeEnum';
import { throwError } from '../helpers/errorHelper';
import { assertOwnership } from '../utils/auth';

enum NotificationFilterEnum {
  ALL = 'ALL',
  UNREAD = 'UNREAD',
}

export class NotificationService {
  private repository: NotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  // Best-effort side effect, not core write correctness - deliberately not
  // wrapped in the caller's transaction (unlike recomputePlaceStats, which
  // must never drift from the reviews it's derived from).
  async create({
    userId,
    type,
    message,
    placeId,
  }: {
    userId: string;
    type: NotificationTypeEnum;
    message: string;
    placeId?: number | null;
  }) {
    return this.repository.create({ userId, type, message, placeId: placeId ?? null });
  }

  // Real SQL where-clause filter, not "fetch all, filter in JS" - a
  // notification feed is unbounded and grows over time, unlike Saved
  // Places' small, capped per-tab lists.
  async getForUser(userId: string, filter: NotificationFilterEnum = NotificationFilterEnum.ALL) {
    return this.repository.findAll({
      where: { userId, ...(filter === NotificationFilterEnum.UNREAD ? { read: false } : {}) },
      order: [['createdAt', 'DESC']],
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.countUnread(userId);
  }

  async markAsRead(userId: string, notificationId: number) {
    const existing = await this.repository.findOne({ where: { id: notificationId } });
    if (!existing) {
      throwError(`Notification with ID ${notificationId} not found`, "NOT_FOUND", 404);
    }
    assertOwnership(existing.userId, userId, "You do not own this notification.");

    await this.repository.updateOne({ id: notificationId, input: { read: true } });
  }

  async markAllAsRead(userId: string) {
    await this.repository.markAllReadForUser(userId);
  }

  async deleteNotification(userId: string, notificationId: number) {
    const existing = await this.repository.findOne({ where: { id: notificationId } });
    if (!existing) {
      throwError(`Notification with ID ${notificationId} not found`, "NOT_FOUND", 404);
    }
    assertOwnership(existing.userId, userId, "You do not own this notification.");

    await this.repository.deleteOne(notificationId);
  }
}
