import { describe, expect, it, vi } from "vitest";
import type { AdminRepository } from "../admin-repo";
import type {
  AdminDashboardMetrics,
  AdminDisputeSummary,
  AdminUserFilterInput,
  AdminUserSummary,
  AdminAuditLogsFilterInput,
  AuditLogSummary,
  ResolveDisputeInput,
  AccountStatus,
} from "../schemas";
import {
  getDashboardMetricsWithRepo,
  listAuditLogsWithRepo,
  listDisputedOrdersWithRepo,
  listUsersWithRepo,
  resolveDisputeWithRepo,
  updateUserStatusWithRepo,
} from "../admin-core";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import type { OrderDetailSummary } from "@/modules/orders/schemas";

vi.mock("@/lib/audit", () => ({
  recordAuditLog: vi.fn().mockResolvedValue({ id: "audit-1" }),
}));

vi.mock("@/modules/notifications", () => ({
  dispatchNotification: vi.fn().mockResolvedValue({ id: "notif-1" }),
}));

function createMockAdminRepo(options?: {
  metrics?: Partial<AdminDashboardMetrics>;
  users?: AdminUserSummary[];
  logs?: AuditLogSummary[];
  disputes?: AdminDisputeSummary[];
}): AdminRepository {
  const users = [...(options?.users ?? [])];
  const logs = [...(options?.logs ?? [])];
  const disputes = [...(options?.disputes ?? [])];

  return {
    async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
      return {
        totalUsers: 100,
        activeFarmers: 50,
        activeBuyers: 30,
        activeTransporters: 20,
        pendingVerifications: 5,
        activeDisputes: 2,
        totalOrders: 40,
        totalAuditLogs: 200,
        ...options?.metrics,
      };
    },

    async listUsers(filter: AdminUserFilterInput) {
      let filtered = [...users];
      if (filter.role) {
        filtered = filtered.filter((u) => u.role === filter.role);
      }
      if (filter.status) {
        filtered = filtered.filter((u) => u.accountStatus === filter.status);
      }
      if (filter.search) {
        filtered = filtered.filter((u) => u.fullName.includes(filter.search!));
      }
      return { users: filtered, totalCount: filtered.length };
    },

    async updateUserStatus(userId: string, status: AccountStatus, reason: string): Promise<AdminUserSummary> {
      void reason;
      const index = users.findIndex((u) => u.id === userId);
      if (index === -1) {
        throw new Error("User not found");
      }
      users[index] = { ...users[index]!, accountStatus: status };
      return users[index]!;
    },

    async listAuditLogs(filter: AdminAuditLogsFilterInput) {
      void filter;
      return { logs, totalCount: logs.length };
    },

    async listDisputedOrders(): Promise<AdminDisputeSummary[]> {
      return disputes;
    },

    async resolveDispute(adminId: string, input: ResolveDisputeInput): Promise<OrderDetailSummary> {
      void adminId;
      return {
        id: input.orderId,
        orderCode: "ORD-202611-12345",
        offerId: "off-1",
        listingId: "list-1",
        cropCode: "YAM",
        quantity: 50,
        unitCode: "TUBER",
        estimatedWeightKg: 100,
        unitPrice: 500,
        currency: "NGN",
        totalAmount: 25000,
        fulfillmentMode: "TONGRIC_LOGISTICS_REQUEST",
        destinationLocation: "Makurdi Modern Market",
        proposedCollectionDate: "2026-11-20",
        status: input.outcome === "RESOLVE_COMPLETED" ? "COMPLETED" : "CANCELLED",
        paymentArrangementNote: null,
        cancellationReason: input.outcome === "RESOLVE_CANCELLED" ? input.resolutionNote : null,
        farmerId: "usr_farmer_1",
        farmerName: "Aondona Iorfa",
        farmerPhone: "+2348011111111",
        buyerId: "usr_buyer_1",
        buyerName: "Terzungwe Stores",
        buyerPhone: "+2348022222222",
        transporterId: "usr_transporter_1",
        statusEvents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
  };
}

describe("Admin Domain Core", () => {
  const adminActor = { id: "usr_admin_1", role: "ADMIN" };
  const farmerActor = { id: "usr_farmer_1", role: "FARMER" };

  it("blocks non-admin actors with ForbiddenError", async () => {
    const repo = createMockAdminRepo();
    await expect(getDashboardMetricsWithRepo(repo, farmerActor)).rejects.toThrow(ForbiddenError);
  });

  it("retrieves dashboard metrics for authorized admin", async () => {
    const repo = createMockAdminRepo();
    const metrics = await getDashboardMetricsWithRepo(repo, adminActor);
    expect(metrics.totalUsers).toBe(100);
    expect(metrics.activeDisputes).toBe(2);
  });

  it("lists participants with search and role filters", async () => {
    const repo = createMockAdminRepo({
      users: [
        {
          id: "u-1",
          fullName: "Aondona Iorfa",
          phoneNumber: "+2348011111111",
          email: null,
          role: "FARMER",
          accountStatus: "ACTIVE",
          preferredLanguageCode: "tiv",
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
          assistedByUserName: null,
          verificationStatus: "VERIFIED",
          listingsCount: 3,
          ordersCount: 2,
        },
        {
          id: "u-2",
          fullName: "Terlumun Logistics",
          phoneNumber: "+2348022222222",
          email: null,
          role: "TRANSPORT_PROVIDER",
          accountStatus: "ACTIVE",
          preferredLanguageCode: "en",
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
          assistedByUserName: null,
          verificationStatus: "VERIFIED",
          listingsCount: 0,
          ordersCount: 5,
        },
      ],
    });

    const result = await listUsersWithRepo(repo, adminActor, { role: "FARMER" });
    expect(result.users).toHaveLength(1);
    expect(result.users[0]?.fullName).toBe("Aondona Iorfa");
  });

  it("updates user status and rejects self-suspension", async () => {
    const repo = createMockAdminRepo({
      users: [
        {
          id: "u-target",
          fullName: "Target User",
          phoneNumber: "+2348033333333",
          email: null,
          role: "BUYER",
          accountStatus: "ACTIVE",
          preferredLanguageCode: "en",
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
          assistedByUserName: null,
          verificationStatus: "UNVERIFIED",
          listingsCount: 0,
          ordersCount: 0,
        },
      ],
    });

    // Attempt self-update
    await expect(
      updateUserStatusWithRepo(repo, adminActor, adminActor.id, {
        status: "SUSPENDED",
        reason: "Self lock",
      }),
    ).rejects.toThrow(ValidationError);

    // Valid target user update
    const updated = await updateUserStatusWithRepo(repo, adminActor, "u-target", {
      status: "SUSPENDED",
      reason: "Suspicious activity reported",
    });

    expect(updated.accountStatus).toBe("SUSPENDED");
  });

  it("resolves disputed order and updates status cleanly", async () => {
    const repo = createMockAdminRepo({
      disputes: [
        {
          id: "ord-1",
          orderCode: "ORD-202611-12345",
          cropCode: "YAM",
          quantity: 50,
          unitCode: "TUBER",
          totalAmount: 25000,
          status: "DISPUTED",
          disputeReason: "Cargo damaged in transit",
          disputedAt: new Date().toISOString(),
          farmer: { id: "f-1", fullName: "Farmer A", phoneNumber: "+2348011111111" },
          buyer: { id: "b-1", fullName: "Buyer B", phoneNumber: "+2348022222222" },
          transporter: null,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const disputes = await listDisputedOrdersWithRepo(repo, adminActor);
    expect(disputes).toHaveLength(1);

    const resolved = await resolveDisputeWithRepo(repo, adminActor, {
      orderId: "ord-1",
      outcome: "RESOLVE_COMPLETED",
      resolutionNote: "Buyer agreed to accept partial concession; order fulfilled.",
    });

    expect(resolved.status).toBe("COMPLETED");
  });

  it("lists immutable audit logs with repo", async () => {
    const repo = createMockAdminRepo({
      logs: [
        {
          id: "log-1",
          actorUserId: "usr_admin_1",
          actorName: "Super Admin",
          action: "USER_ACCOUNT_STATUS_UPDATED",
          entityType: "user",
          entityId: "u-target",
          metadata: { newStatus: "SUSPENDED" },
          ipAddress: "127.0.0.1",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const result = await listAuditLogsWithRepo(repo, adminActor);
    expect(result.logs).toHaveLength(1);
    expect(result.logs[0]?.action).toBe("USER_ACCOUNT_STATUS_UPDATED");
  });
});
