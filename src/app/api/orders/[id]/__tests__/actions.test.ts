import { describe, expect, it, vi } from "vitest";
import { ForbiddenError, ValidationError } from "@/lib/errors";

const mockRequireAuth = vi.fn();
const mockUpdateOrderStatus = vi.fn();
const mockCancelOrder = vi.fn();
const mockDisputeOrder = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/orders", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/orders")>();
  return {
    ...actual,
    updateOrderStatus: (...args: unknown[]) => mockUpdateOrderStatus(...args),
    cancelOrder: (...args: unknown[]) => mockCancelOrder(...args),
    disputeOrder: (...args: unknown[]) => mockDisputeOrder(...args),
  };
});

import { POST as updateStatusPost } from "../status/route";
import { POST as cancelPost } from "../cancel/route";
import { POST as disputePost } from "../dispute/route";

describe("Order Milestone & Dispute API Routes", () => {
  const sampleUser = {
    sessionId: "sess_farmer",
    user: {
      id: "usr_farmer_1",
      fullName: "Terna Iorfa",
      role: "FARMER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    },
  };

  describe("POST /api/orders/[id]/status", () => {
    it("returns 200 with updated order on valid status transition", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleUser);
      mockUpdateOrderStatus.mockResolvedValueOnce({
        id: "ord-1",
        status: "COLLECTED",
      });

      const req = new Request("http://localhost:3000/api/orders/ord-1/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus: "COLLECTED", note: "Collected at farm gate" }),
      });

      const res = await updateStatusPost(req, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.order.status).toBe("COLLECTED");
    });

    it("returns 400 on invalid status transition", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleUser);
      mockUpdateOrderStatus.mockRejectedValueOnce(
        new ValidationError("Cannot transition order from CONFIRMED to COMPLETED"),
      );

      const req = new Request("http://localhost:3000/api/orders/ord-1/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus: "COMPLETED" }),
      });

      const res = await updateStatusPost(req, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.ok).toBe(false);
    });
  });

  describe("POST /api/orders/[id]/cancel", () => {
    it("returns 200 with cancelled order and restored quantity", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleUser);
      mockCancelOrder.mockResolvedValueOnce({
        order: { id: "ord-1", status: "CANCELLED" },
        restoredQuantity: 20,
        listingReactivated: true,
      });

      const req = new Request("http://localhost:3000/api/orders/ord-1/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Vehicle breakdown prior to pickup" }),
      });

      const res = await cancelPost(req, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.order.status).toBe("CANCELLED");
      expect(json.data.restoredQuantity).toBe(20);
    });

    it("returns 400 when cancelling after produce collection", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleUser);
      mockCancelOrder.mockRejectedValueOnce(
        new ValidationError("Orders cannot be cancelled once produce has been collected"),
      );

      const req = new Request("http://localhost:3000/api/orders/ord-1/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Late cancellation attempt" }),
      });

      const res = await cancelPost(req, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.ok).toBe(false);
    });
  });

  describe("POST /api/orders/[id]/dispute", () => {
    it("returns 200 with disputed order", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleUser);
      mockDisputeOrder.mockResolvedValueOnce({
        id: "ord-1",
        status: "DISPUTED",
      });

      const req = new Request("http://localhost:3000/api/orders/ord-1/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Quantity discrepancy on arrival" }),
      });

      const res = await disputePost(req, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.order.status).toBe("DISPUTED");
    });

    it("returns 403 when unauthorized actor attempts dispute", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleUser);
      mockDisputeOrder.mockRejectedValueOnce(
        new ForbiddenError("You are not authorized to report a dispute"),
      );

      const req = new Request("http://localhost:3000/api/orders/ord-1/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Intruder dispute" }),
      });

      const res = await disputePost(req, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.ok).toBe(false);
    });
  });
});

