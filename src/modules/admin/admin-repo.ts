import type {
  AdminDashboardMetrics,
  AdminDisputeSummary,
  AdminUserFilterInput,
  AdminUserSummary,
  AdminAuditLogsFilterInput,
  AuditLogSummary,
  ResolveDisputeInput,
  AccountStatus,
} from "./schemas.ts";
import type { OrderDetailSummary } from "@/modules/orders/schemas";

export interface AdminRepository {
  getDashboardMetrics(): Promise<AdminDashboardMetrics>;
  listUsers(filter: AdminUserFilterInput): Promise<{ users: AdminUserSummary[]; totalCount: number }>;
  updateUserStatus(userId: string, status: AccountStatus, reason: string): Promise<AdminUserSummary>;
  listAuditLogs(filter: AdminAuditLogsFilterInput): Promise<{ logs: AuditLogSummary[]; totalCount: number }>;
  listDisputedOrders(): Promise<AdminDisputeSummary[]>;
  resolveDispute(adminId: string, input: ResolveDisputeInput): Promise<OrderDetailSummary>;
}
