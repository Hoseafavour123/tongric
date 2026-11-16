import { describe, expect, it, vi, beforeEach } from "vitest";

const mockRequireAuth = vi.fn();
const mockListExchangeListings = vi.fn();
const mockCreateExchangeListing = vi.fn();
const mockGetExchangeListing = vi.fn();
const mockCreateExchangeOffer = vi.fn();
const mockComputeBarterParity = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/barter", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/barter")>();
  return {
    ...actual,
    listExchangeListings: (...args: unknown[]) => mockListExchangeListings(...args),
    createExchangeListing: (...args: unknown[]) => mockCreateExchangeListing(...args),
    getExchangeListing: (...args: unknown[]) => mockGetExchangeListing(...args),
    createExchangeOffer: (...args: unknown[]) => mockCreateExchangeOffer(...args),
    computeBarterParity: (...args: unknown[]) => mockComputeBarterParity(...args),
  };
});

import { GET as getListingsRoute, POST as postListingsRoute } from "../listings/route.ts";
import { GET as getListingDetailRoute } from "../listings/[id]/route.ts";
import { POST as postOfferRoute } from "../listings/[id]/offers/route.ts";
import { POST as postCalculateRoute } from "../calculate/route.ts";

describe("Barter API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/barter/listings returns list of barter listings", async () => {
    mockListExchangeListings.mockResolvedValueOnce([
      { id: "list-1", offeredTitle: "White Yam", status: "OPEN" },
    ]);

    const req = new Request("http://localhost/api/barter/listings?locationLga=Makurdi");
    const res = await getListingsRoute(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(mockListExchangeListings).toHaveBeenCalledWith(
      expect.objectContaining({ locationLga: "Makurdi" }),
    );
  });

  it("POST /api/barter/listings creates new barter listing", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      sessionId: "s1",
      user: { id: "farmer-1", role: "FARMER" },
    });

    mockCreateExchangeListing.mockResolvedValueOnce({
      id: "list-1",
      offeredTitle: "White Yam",
      status: "OPEN",
    });

    const req = new Request("http://localhost/api/barter/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offeredItemType: "CROP",
        offeredTitle: "50 Tubers of White Yam",
        offeredDescription: "Stored dry in barn",
        offeredQty: 50,
        offeredUnit: "unit",
        desiredDescription: "2 bags of soybeans",
        locationLga: "Makurdi",
      }),
    });

    const res = await postListingsRoute(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.id).toBe("list-1");
  });

  it("GET /api/barter/listings/[id] returns listing detail", async () => {
    mockGetExchangeListing.mockResolvedValueOnce({
      listing: { id: "list-1", offeredTitle: "White Yam" },
      offers: [],
    });

    const req = new Request("http://localhost/api/barter/listings/list-1");
    const res = await getListingDetailRoute(req, {
      params: Promise.resolve({ id: "list-1" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.listing.id).toBe("list-1");
  });

  it("POST /api/barter/listings/[id]/offers proposes exchange offer", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      sessionId: "s1",
      user: { id: "farmer-2", role: "FARMER" },
    });

    mockCreateExchangeOffer.mockResolvedValueOnce({
      id: "offer-1",
      listingId: "list-1",
      proposerFarmerId: "farmer-2",
      offeredItemDescription: "Yellow maize",
      offeredQty: 3,
      offeredUnit: "bag",
      status: "PENDING",
    });

    const req = new Request("http://localhost/api/barter/listings/list-1/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offeredItemDescription: "Yellow maize",
        offeredQty: 3,
        offeredUnit: "bag",
      }),
    });

    const res = await postOfferRoute(req, {
      params: Promise.resolve({ id: "list-1" }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.id).toBe("offer-1");
  });

  it("POST /api/barter/calculate computes parity", async () => {
    mockComputeBarterParity.mockReturnValueOnce({
      offeredCropCode: "yam",
      suggestedCounterpartQuantity: 1.3,
      fairValueEquivalenceNote: "Test parity note",
    });

    const req = new Request("http://localhost/api/barter/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offeredCropCode: "yam",
        offeredQuantity: 50,
        offeredUnitCode: "unit",
        requestedCropCode: "soybeans",
        requestedUnitCode: "bag",
      }),
    });

    const res = await postCalculateRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.suggestedCounterpartQuantity).toBe(1.3);
  });
});

