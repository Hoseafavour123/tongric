import { getDb } from "@/lib/db";
import { createPrismaNotificationsRepository } from "./notifications-prisma-repo.ts";
import {
  listUserNotificationsWithRepo,
  getUnreadNotificationCountWithRepo,
  markNotificationAsReadWithRepo,
  markAllNotificationsAsReadWithRepo,
  dispatchNotificationWithRepo,
} from "./notifications-core.ts";
import type {
  CreateNotificationInput,
  NotificationListResponse,
  NotificationSummary,
} from "./schemas.ts";

function getNotificationsRepo() {
  return createPrismaNotificationsRepository(getDb());
}

export async function listUserNotifications(
  userId: string,
  rawQuery?: unknown,
): Promise<NotificationListResponse> {
  return listUserNotificationsWithRepo(getNotificationsRepo(), userId, rawQuery);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return getUnreadNotificationCountWithRepo(getNotificationsRepo(), userId);
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string,
): Promise<NotificationSummary> {
  return markNotificationAsReadWithRepo(getNotificationsRepo(), userId, notificationId);
}

export async function markAllNotificationsAsRead(
  userId: string,
): Promise<{ updatedCount: number }> {
  return markAllNotificationsAsReadWithRepo(getNotificationsRepo(), userId);
}

export async function dispatchNotification(
  rawInput: CreateNotificationInput | unknown,
): Promise<NotificationSummary> {
  return dispatchNotificationWithRepo(getNotificationsRepo(), rawInput);
}

