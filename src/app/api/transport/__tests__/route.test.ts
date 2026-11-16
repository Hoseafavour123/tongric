import { describe, expect, it, vi } from "vitest";

const mockRequireAuth = vi.fn();
const mockListOpenTransportRequests = vi.fn();
const mockClaimTransportOrder = vi.fn();
const mockListVerifiedTransporters = vi.fn();
const mockSubmitCarrierReview = vi.fn();
const mockGetCarrierReviews = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/transport")>();
  return {
    ...actual,
    listOpenTransportRequests: (...args: unknown[]) =>
      mockListOpenTransportRequests(...args),
    claimTransportOrder: (...args: unknown[]) => mockClaimTransportOrder(...args),
    listVerifiedTransporters: (...args: unknown[]) =>
      mockListVerifiedTransporters(...args),
    submitCarrierReview: (...args: unknown[]) => mockSubmitCarrierReview(...args),
    getCarrierReviews: (...args: unknown[]) => mockGetCarrierReviews(...args),
  };
});

import { GET as getRequests } from "../requests/route";
import { POST as postClaim } from "../orders/[id]/claim/route";
import { GET as getCorridorsRoute } from "../corridors/route";
import { GET as getTransportersRoute } from "../transporters/route";
import { POST as postReview } from "../reviews/route";
import { GET as getTransporterReviewsRoute } from "../transporters/[id]/reviews/route";

describe("Transport API Routes", () => {
  const sampleTransporter = {
    sessionId: "sess_transporter",
    user: {
      id: "usr_transporter_1",
      fullName: "Terlumun Logistics",
      role: "TRANSPORT_PROVIDER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    },
  };

  describe("GET /api/transport/requests", () => {
    it("returns 200 with list of open transport requests", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleTransporter);
      mockListOpenTransportRequests.mockResolvedValueOnce([
        { id: "ord-1", orderCode: "ORD-202611-12345" },
      ]);

      const res = await getRequests();
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.requests.length).toBe(1);
    });
  });

  describe("POST /api/transport/orders/[id]/claim", () => {
    it("returns 200 with assignment when claim succeeds", async () => {
      mockRequireAuth.mockResolvedValueOnce(sampleTransporter);
      mockClaimTransportOrder.mockResolvedValueOnce({
        id: "ord-1",
        status: "TRANSPORT_ASSIGNED",
        transporterId: "usr_transporter_1",
      });

      const req = new Request("http://localhost:3000/api/transport/orders/ord-1/claim", {
        method: "POST",
      });

      const res = await postClaim(req, { params: Promise.resolve({ id: "ord-1" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.assignment.status).toBe("TRANSPORT_ASSIGNED");
    });
  });

  describe("GET /api/transport/corridors", () => {
    it("returns 200 with list of Benue corridors", async () => {
      const res = await getCorridorsRoute();
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.corridors.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("GET /api/transport/transporters", () => {
    it("returns 200 with verified transporters", async () => {
      mockListVerifiedTransporters.mockResolvedValueOnce([
        { id: "p-1", operatorName: "Gboko Fleet" },
      ]);

      const req = new Request("http://localhost:3000/api/transport/transporters?lga=Gboko");
      const res = await getTransportersRoute(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.transporters.length).toBe(1);
    });
  });

  describe("POST /api/transport/reviews", () => {
    it("returns 201 with created carrier review", async () => {
      mockRequireAuth.mockResolvedValueOnce({
        sessionId: "sess_buyer",
        user: { id: "usr_buyer_1", role: "COMMERCIAL_BUYER" },
      });
      mockSubmitCarrierReview.mockResolvedValueOnce({
        id: "rev-1",
        orderId: "ord-1",
        rating: 5,
        timelinessScore: 5,
        cargoCareScore: 5,
        communicationScore: 5,
        comment: "Excellent handling!",
      });

      const req = new Request("http://localhost:3000/api/transport/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ord-1",
          rating: 5,
          comment: "Excellent handling!",
        }),
      });

      const res = await postReview(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.ok).toBe(true);
      expect(json.data.review.rating).toBe(5);
    });
  });

  describe("GET /api/transport/transporters/[id]/reviews", () => {
    it("returns 200 with list of carrier reviews", async () => {
      mockGetCarrierReviews.mockResolvedValueOnce([
        { id: "rev-1", rating: 5, comment: "Punctual" },
      ]);

      const req = new Request("http://localhost:3000/api/transport/transporters/usr_transporter_1/reviews");
      const res = await getTransporterReviewsRoute(req, {
        params: Promise.resolve({ id: "usr_transporter_1" }),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.reviews.length).toBe(1);
    });
  });
});

