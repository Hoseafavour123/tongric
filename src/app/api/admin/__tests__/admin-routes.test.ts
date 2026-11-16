import { describe, expect, it, vi } from "vitest";

const mockRequireRole = vi.fn();
const mockGetDashboardMetrics = vi.fn();
const mockListUsers = vi.fn();
const mockUpdateUserStatus = vi.fn();
const mockListAuditLogs = vi.fn();
const mockListDisputedOrders = vi.fn();
const mockResolveDispute = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireRole: () => mockRequireRole(),
}));

vi.mock("@/modules/admin", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/admin")>();
  return {
    ...actual,
    getDashboardMetrics: (...args: unknown[]) => mockGetDashboardMetrics(...args),
    listUsers: (...args: unknown[]) => mockListUsers(...args),
    updateUserStatus: (...args: unknown[]) => mockUpdateUserStatus(...args),
    listAuditLogs: (...args: unknown[]) => mockListAuditLogs(...args),
    listDisputedOrders: (...args: unknown[]) => mockListDisputedOrders(...args),
    resolveDispute: (...args: unknown[]) => mockResolveDispute(...args),
  };
});

import { GET as getMetricsRoute } from "../metrics/route";
import { GET as getUsersRoute } from "../users/route";
import { PATCH as patchUserStatusRoute } from "../users/[id]/status/route";
import { GET as getAuditLogsRoute } from "../audit-logs/route";
import { GET as getDisputesRoute } from "../disputes/route";
import { POST as postResolveDisputeRoute } from "../disputes/[id]/resolve/route";

describe("Admin API Routes", () => {
  const sampleAdmin = {
    sessionId: "sess_admin_1",
    user: {
      id: "usr_admin_1",
      fullName: "Super Admin",
      role: "ADMIN" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    },
  };

  describe("GET /api/admin/metrics", () => {
    it("returns 200 with platform dashboard metrics", async () => {
      mockRequireRole.mockResolvedValueOnce(sampleAdmin);
      mockGetDashboardMetrics.mockResolvedValueOnce({
        totalUsers: 50,
        activeFarmers: 20,
        activeBuyers: 15,
        activeTransporters: 10,
        pendingVerifications: 2,
        activeDisputes: 1,
        totalOrders: 30,
        totalAuditLogs: 120,
      });

      const response = await getMetricsRoute();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.metrics.totalUsers).toBe(50);
      expect(data.data.metrics.activeDisputes).toBe(1);
    });
  });

  describe("GET /api/admin/users", () => {
    it("returns 200 with users list and filters", async () => {
      mockRequireRole.mockResolvedValueOnce(sampleAdmin);
      mockListUsers.mockResolvedValueOnce({
        users: [
          {
            id: "u-1",
            fullName: "Aondona Iorfa",
            phoneNumber: "+2348011111111",
            role: "FARMER",
            accountStatus: "ACTIVE",
          },
        ],
        totalCount: 1,
      });

      const request = new Request("http://localhost/api/admin/users?role=FARMER&status=ACTIVE");
      const response = await getUsersRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.users).toHaveLength(1);
      expect(mockListUsers).toHaveBeenCalledWith(
        { id: "usr_admin_1", role: "ADMIN" },
        expect.objectContaining({ role: "FARMER", status: "ACTIVE" }),
      );
    });
  });

  describe("PATCH /api/admin/users/[id]/status", () => {
    it("returns 200 and updates account access status", async () => {
      mockRequireRole.mockResolvedValueOnce(sampleAdmin);
      mockUpdateUserStatus.mockResolvedValueOnce({
        id: "u-target",
        fullName: "Target User",
        accountStatus: "SUSPENDED",
      });

      const request = new Request("http://localhost/api/admin/users/u-target/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SUSPENDED", reason: "Fraud check" }),
      });

      const response = await patchUserStatusRoute(request, {
        params: Promise.resolve({ id: "u-target" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.user.accountStatus).toBe("SUSPENDED");
      expect(mockUpdateUserStatus).toHaveBeenCalledWith(
        { id: "usr_admin_1", role: "ADMIN" },
        "u-target",
        { status: "SUSPENDED", reason: "Fraud check" },
      );
    });
  });

  describe("GET /api/admin/audit-logs", () => {
    it("returns 200 with audit logs", async () => {
      mockRequireRole.mockResolvedValueOnce(sampleAdmin);
      mockListAuditLogs.mockResolvedValueOnce({
        logs: [
          {
            id: "log-1",
            action: "LOGIN_SUCCESS",
            entityType: "user",
            entityId: "u-1",
            createdAt: new Date().toISOString(),
          },
        ],
        totalCount: 1,
      });

      const request = new Request("http://localhost/api/admin/audit-logs?action=LOGIN_SUCCESS");
      const response = await getAuditLogsRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.logs).toHaveLength(1);
    });
  });

  describe("GET /api/admin/disputes", () => {
    it("returns 200 with active disputed orders", async () => {
      mockRequireRole.mockResolvedValueOnce(sampleAdmin);
      mockListDisputedOrders.mockResolvedValueOnce([
        {
          id: "ord-1",
          orderCode: "ORD-202611-12345",
          status: "DISPUTED",
        },
      ]);

      const response = await getDisputesRoute();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.disputes).toHaveLength(1);
    });
  });

  describe("POST /api/admin/disputes/[id]/resolve", () => {
    it("returns 200 and resolves dispute with notes", async () => {
      mockRequireRole.mockResolvedValueOnce(sampleAdmin);
      mockResolveDispute.mockResolvedValueOnce({
        id: "ord-1",
        orderCode: "ORD-202611-12345",
        status: "COMPLETED",
      });

      const request = new Request("http://localhost/api/admin/disputes/ord-1/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome: "RESOLVE_COMPLETED",
          resolutionNote: "Agreed partial delivery credit",
        }),
      });

      const response = await postResolveDisputeRoute(request, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.order.status).toBe("COMPLETED");
    });
  });
});

