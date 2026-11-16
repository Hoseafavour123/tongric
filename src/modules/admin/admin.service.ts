import { getDb } from "@/lib/db";
import { createPrismaAdminRepository } from "./admin-prisma-repo.ts";
import {
  getDashboardMetricsWithRepo,
  listUsersWithRepo,
  updateUserStatusWithRepo,
  listAuditLogsWithRepo,
  listDisputedOrdersWithRepo,
  resolveDisputeWithRepo,
  type AdminActor,
} from "./admin-core.ts";
import type {
  AdminDashboardMetrics,
  AdminDisputeSummary,
  AdminUserSummary,
  AuditLogSummary,
} from "./schemas.ts";
import type { OrderDetailSummary } from "@/modules/orders/schemas";

function getAdminRepo() {
  return createPrismaAdminRepository(getDb());
}

export async function getDashboardMetrics(actor: AdminActor): Promise<AdminDashboardMetrics> {
  return getDashboardMetricsWithRepo(getAdminRepo(), actor);
}

export async function listUsers(
  actor: AdminActor,
  rawFilter?: unknown,
): Promise<{ users: AdminUserSummary[]; totalCount: number }> {
  return listUsersWithRepo(getAdminRepo(), actor, rawFilter);
}

export async function updateUserStatus(
  actor: AdminActor,
  userId: string,
  rawInput: unknown,
): Promise<AdminUserSummary> {
  return updateUserStatusWithRepo(getAdminRepo(), actor, userId, rawInput);
}

export async function listAuditLogs(
  actor: AdminActor,
  rawFilter?: unknown,
): Promise<{ logs: AuditLogSummary[]; totalCount: number }> {
  return listAuditLogsWithRepo(getAdminRepo(), actor, rawFilter);
}

export async function listDisputedOrders(actor: AdminActor): Promise<AdminDisputeSummary[]> {
  return listDisputedOrdersWithRepo(getAdminRepo(), actor);
}

export async function resolveDispute(
  actor: AdminActor,
  rawInput: unknown,
): Promise<OrderDetailSummary> {
  return resolveDisputeWithRepo(getAdminRepo(), actor, rawInput);
}

