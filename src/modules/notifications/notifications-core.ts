import { NotFoundError } from "@/lib/errors";
import type { NotificationsRepository } from "./notifications-repo.ts";
import {
  createNotificationSchema,
  listNotificationsQuerySchema,
  type NotificationListResponse,
  type NotificationSummary,
} from "./schemas.ts";

export async function listUserNotificationsWithRepo(
  repo: NotificationsRepository,
  userId: string,
  rawQuery?: unknown,
): Promise<NotificationListResponse> {
  const query = listNotificationsQuerySchema.parse(rawQuery ?? {});
  const [notifications, unreadCount] = await Promise.all([
    repo.listUserNotifications(userId, {
      unreadOnly: query.unreadOnly,
      limit: query.limit,
    }),
    repo.getUnreadCount(userId),
  ]);

  return {
    notifications,
    unreadCount,
  };
}

export async function getUnreadNotificationCountWithRepo(
  repo: NotificationsRepository,
  userId: string,
): Promise<number> {
  return repo.getUnreadCount(userId);
}

export async function markNotificationAsReadWithRepo(
  repo: NotificationsRepository,
  userId: string,
  notificationId: string,
): Promise<NotificationSummary> {
  const updated = await repo.markAsRead(userId, notificationId);
  if (!updated) {
    throw new NotFoundError("Notification not found or access denied");
  }
  return updated;
}

export async function markAllNotificationsAsReadWithRepo(
  repo: NotificationsRepository,
  userId: string,
): Promise<{ updatedCount: number }> {
  const updatedCount = await repo.markAllAsRead(userId);
  return { updatedCount };
}

export async function dispatchNotificationWithRepo(
  repo: NotificationsRepository,
  rawInput: unknown,
): Promise<NotificationSummary> {
  const parsed = createNotificationSchema.parse(rawInput);
  return repo.createNotification(parsed);
}

