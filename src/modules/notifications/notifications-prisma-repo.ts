import type { PrismaClient } from "@prisma/client";
import type { NotificationsRepository } from "./notifications-repo.ts";
import type { CreateNotificationInput, NotificationSummary } from "./schemas.ts";

export function createPrismaNotificationsRepository(
  db: PrismaClient,
): NotificationsRepository {
  return {
    async createNotification(data: CreateNotificationInput): Promise<NotificationSummary> {
      const record = await db.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          body: data.body,
          category: data.category,
          entityType: data.entityType,
          entityId: data.entityId,
          actionUrl: data.actionUrl,
        },
      });

      return {
        id: record.id,
        userId: record.userId,
        title: record.title,
        body: record.body,
        category: record.category,
        entityType: record.entityType,
        entityId: record.entityId,
        actionUrl: record.actionUrl,
        isRead: record.isRead,
        readAt: record.readAt ? record.readAt.toISOString() : null,
        createdAt: record.createdAt.toISOString(),
      };
    },

    async listUserNotifications(
      userId: string,
      options?: { unreadOnly?: boolean; limit?: number },
    ): Promise<NotificationSummary[]> {
      const records = await db.notification.findMany({
        where: {
          userId,
          ...(options?.unreadOnly ? { isRead: false } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: options?.limit ?? 20,
      });

      return records.map((record) => ({
        id: record.id,
        userId: record.userId,
        title: record.title,
        body: record.body,
        category: record.category,
        entityType: record.entityType,
        entityId: record.entityId,
        actionUrl: record.actionUrl,
        isRead: record.isRead,
        readAt: record.readAt ? record.readAt.toISOString() : null,
        createdAt: record.createdAt.toISOString(),
      }));
    },

    async getUnreadCount(userId: string): Promise<number> {
      return db.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
    },

    async markAsRead(
      userId: string,
      notificationId: string,
    ): Promise<NotificationSummary | null> {
      const existing = await db.notification.findFirst({
        where: { id: notificationId, userId },
      });

      if (!existing) {
        return null;
      }

      const updated = await db.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return {
        id: updated.id,
        userId: updated.userId,
        title: updated.title,
        body: updated.body,
        category: updated.category,
        entityType: updated.entityType,
        entityId: updated.entityId,
        actionUrl: updated.actionUrl,
        isRead: updated.isRead,
        readAt: updated.readAt ? updated.readAt.toISOString() : null,
        createdAt: updated.createdAt.toISOString(),
      };
    },

    async markAllAsRead(userId: string): Promise<number> {
      const result = await db.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return result.count;
    },
  };
}

