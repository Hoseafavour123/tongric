import { describe, expect, it, vi } from "vitest";

const mockRequireAuth = vi.fn();
const mockListUserNotifications = vi.fn();
const mockMarkNotificationAsRead = vi.fn();
const mockMarkAllNotificationsAsRead = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/notifications", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/notifications")>();
  return {
    ...actual,
    listUserNotifications: (...args: unknown[]) => mockListUserNotifications(...args),
    markNotificationAsRead: (...args: unknown[]) => mockMarkNotificationAsRead(...args),
    markAllNotificationsAsRead: (...args: unknown[]) => mockMarkAllNotificationsAsRead(...args),
  };
});

import { GET as getNotificationsRoute } from "../route";
import { PATCH as patchReadRoute } from "../[id]/read/route";
import { POST as postReadAllRoute } from "../read-all/route";

describe("Notifications API Routes", () => {
  const sampleUser = {
    sessionId: "sess_user_1",
    user: {
      id: "usr_user_1",
      fullName: "Aondona Iorfa",
      role: "FARMER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    },
  };

  describe("GET /api/notifications", () => {
    it("returns 200 with notifications and unreadCount", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleUser);
      mockListUserNotifications.mockResolvedValueOnce({
        notifications: [
          {
            id: "notif-1",
            userId: "usr_user_1",
            title: "Offer Received",
            body: "You received an offer of ₦30,000",
            category: "OFFER_ACTIVITY",
            entityType: "offer",
            entityId: "off-1",
            actionUrl: "/orders/offers/off-1",
            isRead: false,
            readAt: null,
            createdAt: "2026-11-16T00:00:00.000Z",
          },
        ],
        unreadCount: 1,
      });

      const request = new Request("http://localhost/api/notifications?unreadOnly=false&limit=20");
      const response = await getNotificationsRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.unreadCount).toBe(1);
      expect(data.data.notifications).toHaveLength(1);
      expect(mockListUserNotifications).toHaveBeenCalledWith("usr_user_1", {
        unreadOnly: false,
        limit: 20,
      });
    });
  });

  describe("PATCH /api/notifications/[id]/read", () => {
    it("returns 200 and marks single notification as read", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleUser);
      mockMarkNotificationAsRead.mockResolvedValueOnce({
        id: "notif-1",
        userId: "usr_user_1",
        title: "Offer Received",
        body: "You received an offer of ₦30,000",
        category: "OFFER_ACTIVITY",
        entityType: "offer",
        entityId: "off-1",
        actionUrl: "/orders/offers/off-1",
        isRead: true,
        readAt: "2026-11-16T01:00:00.000Z",
        createdAt: "2026-11-16T00:00:00.000Z",
      });

      const request = new Request("http://localhost/api/notifications/notif-1/read", {
        method: "PATCH",
      });
      const response = await patchReadRoute(request, {
        params: Promise.resolve({ id: "notif-1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.notification.isRead).toBe(true);
      expect(mockMarkNotificationAsRead).toHaveBeenCalledWith("usr_user_1", "notif-1");
    });
  });

  describe("POST /api/notifications/read-all", () => {
    it("returns 200 and updates all notifications to read", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleUser);
      mockMarkAllNotificationsAsRead.mockResolvedValueOnce({
        updatedCount: 3,
      });

      const request = new Request("http://localhost/api/notifications/read-all", {
        method: "POST",
      });
      const response = await postReadAllRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.updatedCount).toBe(3);
      expect(mockMarkAllNotificationsAsRead).toHaveBeenCalledWith("usr_user_1");
    });
  });
});

