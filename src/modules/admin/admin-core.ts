import { ForbiddenError, ValidationError } from "@/lib/errors";
import type { AdminRepository } from "./admin-repo.ts";
import {
  adminAuditLogsFilterSchema,
  adminUserFilterSchema,
  resolveDisputeSchema,
  updateUserStatusSchema,
  type AdminDashboardMetrics,
  type AdminDisputeSummary,
  type AdminUserSummary,
  type AuditLogSummary,
} from "./schemas.ts";
import type { OrderDetailSummary } from "@/modules/orders/schemas";
import { dispatchNotification } from "@/modules/notifications";
import { recordAuditLog } from "@/lib/audit";

export interface AdminActor {
  id: string;
  role: string;
}

function assertAdmin(actor: AdminActor): void {
  if (actor.role !== "ADMIN") {
    throw new ForbiddenError("Only platform administrators can perform administrative operations.");
  }
}

export async function getDashboardMetricsWithRepo(
  repo: AdminRepository,
  actor: AdminActor,
): Promise<AdminDashboardMetrics> {
  assertAdmin(actor);
  return repo.getDashboardMetrics();
}

export async function listUsersWithRepo(
  repo: AdminRepository,
  actor: AdminActor,
  rawFilter?: unknown,
): Promise<{ users: AdminUserSummary[]; totalCount: number }> {
  assertAdmin(actor);
  const filter = adminUserFilterSchema.parse(rawFilter ?? {});
  return repo.listUsers(filter);
}

export async function updateUserStatusWithRepo(
  repo: AdminRepository,
  actor: AdminActor,
  userId: string,
  rawInput: unknown,
): Promise<AdminUserSummary> {
  assertAdmin(actor);

  if (actor.id === userId) {
    throw new ValidationError("Administrators cannot change their own account status.");
  }

  const { status, reason } = updateUserStatusSchema.parse(rawInput);

  const updatedUser = await repo.updateUserStatus(userId, status, reason);

  // Record audit log
  await recordAuditLog({
    actorUserId: actor.id,
    action: "USER_ACCOUNT_STATUS_UPDATED",
    entityType: "user",
    entityId: userId,
    metadata: {
      targetUserId: userId,
      newStatus: status,
      reason,
    },
  });

  // Notify target user
  try {
    await dispatchNotification({
      userId,
      title: `Account Status Update: ${status}`,
      body: `Your Tongric account status has been updated to ${status}. Reason: ${reason}`,
      category: "SYSTEM_ALERT",
      actionUrl: "/account",
    });
  } catch (err) {
    console.warn("Failed to dispatch user status notification:", err);
  }

  return updatedUser;
}

export async function listAuditLogsWithRepo(
  repo: AdminRepository,
  actor: AdminActor,
  rawFilter?: unknown,
): Promise<{ logs: AuditLogSummary[]; totalCount: number }> {
  assertAdmin(actor);
  const filter = adminAuditLogsFilterSchema.parse(rawFilter ?? {});
  return repo.listAuditLogs(filter);
}

export async function listDisputedOrdersWithRepo(
  repo: AdminRepository,
  actor: AdminActor,
): Promise<AdminDisputeSummary[]> {
  assertAdmin(actor);
  return repo.listDisputedOrders();
}

export async function resolveDisputeWithRepo(
  repo: AdminRepository,
  actor: AdminActor,
  rawInput: unknown,
): Promise<OrderDetailSummary> {
  assertAdmin(actor);
  const input = resolveDisputeSchema.parse(rawInput);

  const resolvedOrder = await repo.resolveDispute(actor.id, input);

  // Notify farmer and buyer
  const notificationTitle = `Dispute Resolved: ${resolvedOrder.orderCode}`;
  const notificationBody = `Order ${resolvedOrder.orderCode} dispute has been resolved (${resolvedOrder.status}). Resolution Note: ${input.resolutionNote}`;

  try {
    await Promise.all([
      dispatchNotification({
        userId: resolvedOrder.farmerId,
        title: notificationTitle,
        body: notificationBody,
        category: "ORDER_STATUS",
        entityType: "order",
        entityId: resolvedOrder.id,
        actionUrl: `/orders/${resolvedOrder.id}`,
      }),
      dispatchNotification({
        userId: resolvedOrder.buyerId,
        title: notificationTitle,
        body: notificationBody,
        category: "ORDER_STATUS",
        entityType: "order",
        entityId: resolvedOrder.id,
        actionUrl: `/orders/${resolvedOrder.id}`,
      }),
      resolvedOrder.transporterId
        ? dispatchNotification({
            userId: resolvedOrder.transporterId,
            title: notificationTitle,
            body: notificationBody,
            category: "TRANSPORT_DISPATCH",
            entityType: "order",
            entityId: resolvedOrder.id,
            actionUrl: `/orders/${resolvedOrder.id}`,
          })
        : Promise.resolve(),
    ]);
  } catch (err) {
    console.warn("Failed to dispatch dispute resolution notifications:", err);
  }

  return resolvedOrder;
}

