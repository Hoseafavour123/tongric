import { describe, expect, it } from "vitest";
import type { NotificationsRepository } from "../notifications-repo";
import type { CreateNotificationInput, NotificationSummary } from "../schemas";
import {
  dispatchNotificationWithRepo,
  getUnreadNotificationCountWithRepo,
  listUserNotificationsWithRepo,
  markAllNotificationsAsReadWithRepo,
  markNotificationAsReadWithRepo,
} from "../notifications-core";
import { NotFoundError } from "@/lib/errors";

function createMockNotificationsRepo(initial: NotificationSummary[] = []): NotificationsRepository {
  const store: NotificationSummary[] = [...initial];

  return {
    async createNotification(data: CreateNotificationInput): Promise<NotificationSummary> {
      const summary: NotificationSummary = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: data.userId,
        title: data.title,
        body: data.body,
        category: data.category,
        entityType: data.entityType ?? null,
        entityId: data.entityId ?? null,
        actionUrl: data.actionUrl ?? null,
        isRead: false,
        readAt: null,
        createdAt: new Date().toISOString(),
      };
      store.push(summary);
      return summary;
    },

    async listUserNotifications(userId: string, options?: { unreadOnly?: boolean; limit?: number }) {
      let filtered = store.filter((n) => n.userId === userId);
      if (options?.unreadOnly) {
        filtered = filtered.filter((n) => !n.isRead);
      }
      return filtered.slice(0, options?.limit ?? 20);
    },

    async getUnreadCount(userId: string): Promise<number> {
      return store.filter((n) => n.userId === userId && !n.isRead).length;
    },

    async markAsRead(userId: string, notificationId: string): Promise<NotificationSummary | null> {
      const item = store.find((n) => n.id === notificationId && n.userId === userId);
      if (!item) return null;
      item.isRead = true;
      item.readAt = new Date().toISOString();
      return item;
    },

    async markAllAsRead(userId: string): Promise<number> {
      let count = 0;
      for (const item of store) {
        if (item.userId === userId && !item.isRead) {
          count++;
          item.isRead = true;
          item.readAt = new Date().toISOString();
        }
      }
      return count;
    },
  };
}

describe("Notifications Domain Core", () => {
  it("dispatches notification with valid schema and defaults", async () => {
    const repo = createMockNotificationsRepo();
    const notification = await dispatchNotificationWithRepo(repo, {
      userId: "user-1",
      title: "New Trade Offer",
      body: "You received an offer of ₦25,000 for Yam tubers.",
      category: "OFFER_ACTIVITY",
      actionUrl: "/orders/offers/off-123",
    });

    expect(notification.id).toBeDefined();
    expect(notification.userId).toBe("user-1");
    expect(notification.title).toBe("New Trade Offer");
    expect(notification.category).toBe("OFFER_ACTIVITY");
    expect(notification.isRead).toBe(false);
  });

  it("throws ValidationError when title is missing or empty", async () => {
    const repo = createMockNotificationsRepo();
    await expect(
      dispatchNotificationWithRepo(repo, {
        userId: "user-1",
        title: "",
        body: "Test body",
      }),
    ).rejects.toThrow();
  });

  it("lists user notifications and reports accurate unread count", async () => {
    const initial: NotificationSummary[] = [
      {
        id: "notif-1",
        userId: "user-1",
        title: "Offer Accepted",
        body: "Your offer was accepted",
        category: "OFFER_ACTIVITY",
        entityType: "order",
        entityId: "ord-1",
        actionUrl: "/orders/ord-1",
        isRead: false,
        readAt: null,
        createdAt: "2026-11-16T00:00:00.000Z",
      },
      {
        id: "notif-2",
        userId: "user-1",
        title: "Dispatch Alert",
        body: "Carrier assigned",
        category: "TRANSPORT_DISPATCH",
        entityType: "order",
        entityId: "ord-1",
        actionUrl: "/orders/ord-1",
        isRead: true,
        readAt: "2026-11-16T00:30:00.000Z",
        createdAt: "2026-11-16T00:10:00.000Z",
      },
      {
        id: "notif-3",
        userId: "user-2",
        title: "Other user notif",
        body: "Should not appear",
        category: "SYSTEM_ALERT",
        entityType: null,
        entityId: null,
        actionUrl: null,
        isRead: false,
        readAt: null,
        createdAt: "2026-11-16T00:00:00.000Z",
      },
    ];

    const repo = createMockNotificationsRepo(initial);

    // List all
    const all = await listUserNotificationsWithRepo(repo, "user-1");
    expect(all.notifications).toHaveLength(2);
    expect(all.unreadCount).toBe(1);

    // List unread only
    const unread = await listUserNotificationsWithRepo(repo, "user-1", { unreadOnly: true });
    expect(unread.notifications).toHaveLength(1);
    expect(unread.notifications[0]?.id).toBe("notif-1");
  });

  it("marks a notification as read and returns updated summary", async () => {
    const initial: NotificationSummary[] = [
      {
        id: "notif-1",
        userId: "user-1",
        title: "Offer Received",
        body: "Test body",
        category: "OFFER_ACTIVITY",
        entityType: null,
        entityId: null,
        actionUrl: null,
        isRead: false,
        readAt: null,
        createdAt: "2026-11-16T00:00:00.000Z",
      },
    ];

    const repo = createMockNotificationsRepo(initial);
    const updated = await markNotificationAsReadWithRepo(repo, "user-1", "notif-1");

    expect(updated.isRead).toBe(true);
    expect(updated.readAt).toBeDefined();

    const unreadCount = await getUnreadNotificationCountWithRepo(repo, "user-1");
    expect(unreadCount).toBe(0);
  });

  it("throws NotFoundError when marking non-existent or other user notification as read", async () => {
    const repo = createMockNotificationsRepo();
    await expect(
      markNotificationAsReadWithRepo(repo, "user-1", "non-existent-id"),
    ).rejects.toThrow(NotFoundError);
  });

  it("marks all notifications as read for a user", async () => {
    const initial: NotificationSummary[] = [
      {
        id: "notif-1",
        userId: "user-1",
        title: "1",
        body: "1",
        category: "SYSTEM_ALERT",
        entityType: null,
        entityId: null,
        actionUrl: null,
        isRead: false,
        readAt: null,
        createdAt: "2026-11-16T00:00:00.000Z",
      },
      {
        id: "notif-2",
        userId: "user-1",
        title: "2",
        body: "2",
        category: "SYSTEM_ALERT",
        entityType: null,
        entityId: null,
        actionUrl: null,
        isRead: false,
        readAt: null,
        createdAt: "2026-11-16T00:00:00.000Z",
      },
    ];

    const repo = createMockNotificationsRepo(initial);
    const result = await markAllNotificationsAsReadWithRepo(repo, "user-1");

    expect(result.updatedCount).toBe(2);

    const count = await getUnreadNotificationCountWithRepo(repo, "user-1");
    expect(count).toBe(0);
  });
});
