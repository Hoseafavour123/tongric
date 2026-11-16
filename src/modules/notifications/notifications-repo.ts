import type {
  CreateNotificationInput,
  NotificationSummary,
} from "./schemas.ts";

export interface NotificationsRepository {
  createNotification(data: CreateNotificationInput): Promise<NotificationSummary>;
  listUserNotifications(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number },
  ): Promise<NotificationSummary[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(userId: string, notificationId: string): Promise<NotificationSummary | null>;
  markAllAsRead(userId: string): Promise<number>;
}

