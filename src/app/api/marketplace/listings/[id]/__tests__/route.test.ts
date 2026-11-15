import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/lib/errors";

const mockGetProduceListing = vi.fn();

vi.mock("@/modules/marketplace", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/marketplace")>();
  return {
    ...actual,
    getProduceListing: (...args: unknown[]) => mockGetProduceListing(...args),
  };
});

import { GET } from "../route";

describe("GET /api/marketplace/listings/[id]", () => {
  const sampleListing = {
    id: "list-1",
    farmerId: "usr_farmer_1",
    farmerName: "Terna Iorfa",
    farmerPhone: "+2348011112233",
    farmerVerificationStatus: "VERIFIED" as const,
    cooperativeName: "Gboko Yam Producers Cooperative",
    title: "50 Bags of Yam (Grade B)",
    cropCode: "yam",
    cropCategory: "tuber",
    grade: "GRADE_B",
    quantity: 50,
    unitCode: "bag",
    estimatedWeightKg: 2500,
    pricePerUnit: 35000,
    currency: "NGN",
    minOrderQuantity: 5,
    isNegotiable: true,
    availabilityStatus: "AVAILABLE_NOW",
    harvestDate: null,
    state: "Benue",
    lga: "gboko",
    community: "Tor-Donga Settlement",
    description: "Good sound tubers",
    status: "ACTIVE",
    primaryPhotoUrl: null,
    photos: [],
    createdAt: "2026-11-14T09:00:00.000Z",
    updatedAt: "2026-11-14T09:00:00.000Z",
  };

  it("returns 200 with listing details when listing exists", async () => {
    mockGetProduceListing.mockResolvedValueOnce(sampleListing);

    const req = new Request("http://localhost:3000/api/marketplace/listings/list-1");
    const res = await GET(req, { params: Promise.resolve({ id: "list-1" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.listing.id).toBe("list-1");
    expect(json.data.listing.farmerVerificationStatus).toBe("VERIFIED");
    expect(json.data.listing.cooperativeName).toBe("Gboko Yam Producers Cooperative");
    expect(mockGetProduceListing).toHaveBeenCalledWith("list-1");
  });

  it("returns 404 when listing is not found", async () => {
    mockGetProduceListing.mockRejectedValueOnce(
      new NotFoundError("Produce listing not found."),
    );

    const req = new Request("http://localhost:3000/api/marketplace/listings/non-existent");
    const res = await GET(req, { params: Promise.resolve({ id: "non-existent" }) });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.ok).toBe(false);
  });
});

