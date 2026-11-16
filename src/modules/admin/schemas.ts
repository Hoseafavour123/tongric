import { z } from "zod";
import type { OrderStatus } from "@/modules/orders/schemas";

export const userRoleEnum = z.enum(["FARMER", "BUYER", "TRANSPORT_PROVIDER", "ADMIN"]);
export type UserRole = z.infer<typeof userRoleEnum>;

export const accountStatusEnum = z.enum(["ACTIVE", "SUSPENDED", "LOCKED"]);
export type AccountStatus = z.infer<typeof accountStatusEnum>;

export const adminUserFilterSchema = z.object({
  role: userRoleEnum.optional(),
  status: accountStatusEnum.optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type AdminUserFilterInput = z.infer<typeof adminUserFilterSchema>;

export const updateUserStatusSchema = z.object({
  status: accountStatusEnum,
  reason: z.string().trim().min(3, "Reason is required (min 3 characters)").max(500),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

export const adminAuditLogsFilterSchema = z.object({
  action: z.string().trim().optional(),
  actorUserId: z.string().trim().optional(),
  entityType: z.string().trim().optional(),
  from: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  to: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(30),
});

export type AdminAuditLogsFilterInput = z.infer<typeof adminAuditLogsFilterSchema>;

export const resolveDisputeSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  outcome: z.enum(["RESOLVE_COMPLETED", "RESOLVE_CANCELLED"]),
  resolutionNote: z.string().trim().min(5, "Resolution note is required (min 5 characters)").max(1000),
  restoreInventory: z.boolean().optional().default(true),
});

export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;

export interface AdminUserSummary {
  id: string;
  phoneNumber: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  accountStatus: AccountStatus;
  preferredLanguageCode: string;
  createdAt: string;
  lastLoginAt: string | null;
  assistedByUserName: string | null;
  verificationStatus: string | null;
  listingsCount: number;
  ordersCount: number;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeFarmers: number;
  activeBuyers: number;
  activeTransporters: number;
  pendingVerifications: number;
  activeDisputes: number;
  totalOrders: number;
  totalAuditLogs: number;
}

export interface AuditLogSummary {
  id: string;
  actorUserId: string | null;
  actorName?: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AdminDisputeSummary {
  id: string;
  orderCode: string;
  cropCode: string;
  quantity: number;
  unitCode: string;
  totalAmount: number;
  status: OrderStatus;
  disputeReason: string | null;
  disputedAt: string | null;
  farmer: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  buyer: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  transporter: {
    id: string;
    fullName: string;
    phoneNumber: string;
  } | null;
  createdAt: string;
}
