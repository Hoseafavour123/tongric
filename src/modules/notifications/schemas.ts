import { z } from "zod";

export const notificationCategoryEnum = z.enum([
  "OFFER_ACTIVITY",
  "ORDER_STATUS",
  "TRANSPORT_DISPATCH",
  "SYSTEM_ALERT",
]);

export type NotificationCategory = z.infer<typeof notificationCategoryEnum>;

export const createNotificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  title: z.string().trim().min(1, "Title is required").max(100),
  body: z.string().trim().min(1, "Notification body is required").max(500),
  category: notificationCategoryEnum.default("SYSTEM_ALERT"),
  entityType: z.string().trim().optional().nullable(),
  entityId: z.string().trim().optional().nullable(),
  actionUrl: z.string().trim().optional().nullable(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

export interface NotificationSummary {
  id: string;
  userId: string;
  title: string;
  body: string;
  category: NotificationCategory;
  entityType: string | null;
  entityId: string | null;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationSummary[];
  unreadCount: number;
}

export const listNotificationsQuerySchema = z.object({
  unreadOnly: z.coerce.boolean().optional().default(false),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});

export type ListNotificationsQueryInput = z.infer<typeof listNotificationsQuerySchema>;

