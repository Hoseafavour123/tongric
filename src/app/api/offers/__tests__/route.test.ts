import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/lib/errors";

const mockRequireAuth = vi.fn();
const mockCreateCommercialOffer = vi.fn();
const mockListUserOffers = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/orders", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/orders")>();
  return {
    ...actual,
    createCommercialOffer: (...args: unknown[]) => mockCreateCommercialOffer(...args),
    listUserOffers: (...args: unknown[]) => mockListUserOffers(...args),
  };
});

import { GET, POST } from "../route";

describe("GET & POST /api/offers", () => {
  const buyerSession = {
    sessionId: "sess_buyer",
    user: {
      id: "usr_buyer_1",
      fullName: "Agro Commercials",
      role: "BUYER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    },
  };

  const sampleOffer = {
    id: "off-1",
    offerCode: "OFF-202611-12345",
    listingId: "list-1",
    buyerId: "usr_buyer_1",
    farmerId: "usr_farmer_1",
    status: "PENDING",
    quantity: 20,
    unitCode: "bag",
    unitPrice: 30000,
    currency: "NGN",
    totalAmount: 600000,
    fulfillmentMode: "BUYER_ARRANGES_PICKUP",
    destinationLocation: null,
    proposedCollectionDate: null,
    expiresAt: "2026-11-20T12:00:00.000Z",
    isExpired: false,
    counterRoundCount: 0,
    lastActionById: "usr_buyer_1",
    createdAt: "2026-11-15T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
  };

  describe("GET", () => {
    it("returns 200 with list of user offers", async () => {
      mockRequireAuth.mockResolvedValueOnce(buyerSession);
      mockListUserOffers.mockResolvedValueOnce([sampleOffer]);

      const req = new Request("http://localhost:3000/api/offers?role=buyer&status=PENDING");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.offers).toHaveLength(1);
      expect(json.data.totalCount).toBe(1);
    });

    it("returns 401 when unauthenticated", async () => {
      mockRequireAuth.mockRejectedValueOnce(new UnauthorizedError("Login required"));

      const req = new Request("http://localhost:3000/api/offers");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.ok).toBe(false);
    });
  });

  describe("POST", () => {
    it("returns 201 on successful offer creation", async () => {
      mockRequireAuth.mockResolvedValueOnce(buyerSession);
      mockCreateCommercialOffer.mockResolvedValueOnce(sampleOffer);

      const req = new Request("http://localhost:3000/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: "list-1",
          quantity: 20,
          unitPrice: 30000,
          fulfillmentMode: "BUYER_ARRANGES_PICKUP",
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.ok).toBe(true);
      expect(json.data.offer.id).toBe("off-1");
    });
  });
});

