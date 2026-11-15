import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/lib/errors";

const mockRequireAuth = vi.fn();
const mockGetCommercialOffer = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/orders", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/orders")>();
  return {
    ...actual,
    getCommercialOffer: (...args: unknown[]) => mockGetCommercialOffer(...args),
  };
});

import { GET } from "../route";

describe("GET /api/offers/[id]", () => {
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
    totalAmount: 600000,
    messages: [],
  };

  it("returns 200 with offer detail", async () => {
    mockRequireAuth.mockResolvedValueOnce(buyerSession);
    mockGetCommercialOffer.mockResolvedValueOnce(sampleOffer);

    const req = new Request("http://localhost:3000/api/offers/off-1");
    const res = await GET(req, { params: Promise.resolve({ id: "off-1" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.offer.id).toBe("off-1");
  });

  it("returns 404 when offer is not found", async () => {
    mockRequireAuth.mockResolvedValueOnce(buyerSession);
    mockGetCommercialOffer.mockRejectedValueOnce(new NotFoundError("Offer not found"));

    const req = new Request("http://localhost:3000/api/offers/non-existent");
    const res = await GET(req, { params: Promise.resolve({ id: "non-existent" }) });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.ok).toBe(false);
  });
});

