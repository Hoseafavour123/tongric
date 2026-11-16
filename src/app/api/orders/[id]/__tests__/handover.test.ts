import { describe, expect, it, vi } from "vitest";
import { ForbiddenError, ValidationError } from "@/lib/errors";

const mockRequireAuth = vi.fn();
const mockVerifyPickupPin = vi.fn();
const mockVerifyDeliveryPin = vi.fn();
const mockGetWaybill = vi.fn();
const mockGetOrderReview = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/orders", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/orders")>();
  return {
    ...actual,
    verifyPickupPin: (...args: unknown[]) => mockVerifyPickupPin(...args),
    verifyDeliveryPin: (...args: unknown[]) => mockVerifyDeliveryPin(...args),
    getWaybill: (...args: unknown[]) => mockGetWaybill(...args),
  };
});

vi.mock("@/modules/transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/transport")>();
  return {
    ...actual,
    getOrderReview: (...args: unknown[]) => mockGetOrderReview(...args),
  };
});

import { POST as verifyPickupPost } from "../verify-pickup/route";
import { POST as verifyDeliveryPost } from "../verify-delivery/route";
import { GET as waybillGet } from "../waybill/route";
import { GET as reviewGet } from "../review/route";

describe("Order Handover & Waybill API Routes", () => {
  const sampleCarrier = {
    sessionId: "sess_carrier",
    user: {
      id: "usr_carrier_1",
      fullName: "Benue Express Haulage",
      role: "TRANSPORTER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    },
  };

  describe("POST /api/orders/[id]/verify-pickup", () => {
    it("returns 200 on successful pickup PIN verification", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleCarrier);
      mockVerifyPickupPin.mockResolvedValueOnce({
        id: "ord-1",
        status: "COLLECTED",
        pickupVerifiedAt: new Date().toISOString(),
      });

      const req = new Request("http://localhost:3000/api/orders/ord-1/verify-pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: "4829" }),
      });

      const res = await verifyPickupPost(req, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.order.status).toBe("COLLECTED");
      expect(mockVerifyPickupPin).toHaveBeenCalledWith(
        { id: "usr_carrier_1", role: "TRANSPORTER" },
        "ord-1",
        { pin: "4829" },
      );
    });

    it("returns 400 when invalid PIN is provided", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleCarrier);
      mockVerifyPickupPin.mockRejectedValueOnce(
        new ValidationError("Invalid pickup verification PIN"),
      );

      const req = new Request("http://localhost:3000/api/orders/ord-1/verify-pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: "0000" }),
      });

      const res = await verifyPickupPost(req, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.ok).toBe(false);
      expect(json.error.message).toContain("Invalid pickup verification PIN");
    });
  });

  describe("POST /api/orders/[id]/verify-delivery", () => {
    it("returns 200 on successful delivery PIN verification", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleCarrier);
      mockVerifyDeliveryPin.mockResolvedValueOnce({
        id: "ord-1",
        status: "DELIVERED",
        deliveryVerifiedAt: new Date().toISOString(),
      });

      const req = new Request("http://localhost:3000/api/orders/ord-1/verify-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: "7193" }),
      });

      const res = await verifyDeliveryPost(req, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.order.status).toBe("DELIVERED");
    });
  });

  describe("GET /api/orders/[id]/waybill", () => {
    it("returns 200 with waybill data", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleCarrier);
      mockGetWaybill.mockResolvedValueOnce({
        waybillNumber: "WB-202611-73921",
        orderId: "ord-1",
        orderCode: "ORD-202611-73921",
        cropCode: "yam",
        quantity: 20,
        unitCode: "bag",
        estimatedWeightKg: 1000,
        totalAmount: 600000,
        currency: "NGN",
        corridorRoute: "Gboko ⇄ Makurdi",
        farmerName: "Terna Iorfa",
        buyerName: "Agro Commercials Ltd",
        status: "TRANSPORT_ASSIGNED",
      });

      const req = new Request("http://localhost:3000/api/orders/ord-1/waybill", {
        method: "GET",
      });

      const res = await waybillGet(req, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.waybill.waybillNumber).toBe("WB-202611-73921");
    });

    it("returns 403 when user is not authorized to view waybill", async () => {
      mockRequireAuth.mockResolvedValueOnce({
        sessionId: "sess_unauth",
        user: {
          id: "usr_unrelated",
          fullName: "Stranger",
          role: "BUYER" as const,
          accountStatus: "ACTIVE" as const,
          preferredLanguageCode: "en",
        },
      });
      mockGetWaybill.mockRejectedValueOnce(
        new ForbiddenError("You are not authorized to access this dispatch waybill"),
      );

      const req = new Request("http://localhost:3000/api/orders/ord-1/waybill", {
        method: "GET",
      });

      const res = await waybillGet(req, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.ok).toBe(false);
    });
  });

  describe("GET /api/orders/[id]/review", () => {
    it("returns 200 with review if present", async () => {
      mockRequireAuth.mockResolvedValueOnce({
        sessionId: "sess_buyer",
        user: { id: "usr_buyer_1", role: "BUYER" },
      });
      mockGetOrderReview.mockResolvedValueOnce({
        id: "rev-1",
        rating: 5,
        comment: "Fast delivery",
      });

      const req = new Request("http://localhost:3000/api/orders/ord-1/review", {
        method: "GET",
      });

      const res = await reviewGet(req, {
        params: Promise.resolve({ id: "ord-1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.review.rating).toBe(5);
    });
  });
});
