import { describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";

const mockRequireAuth = vi.fn();
const mockCreateProduceListing = vi.fn();
const mockListActiveListings = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/marketplace", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/marketplace")>();
  return {
    ...actual,
    createProduceListing: (...args: unknown[]) => mockCreateProduceListing(...args),
    listActiveListings: (...args: unknown[]) => mockListActiveListings(...args),
  };
});

import { GET, POST } from "../route";

describe("GET & POST /api/marketplace/listings", () => {
  const farmerSession = {
    sessionId: "sess_farmer",
    user: {
      id: "usr_farmer_1",
      fullName: "Terna Iorfa",
      role: "FARMER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    },
  };

  const sampleListing = {
    id: "list-1",
    farmerId: "usr_farmer_1",
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

  describe("GET", () => {
    it("returns 200 with active listings and filters", async () => {
      mockListActiveListings.mockResolvedValueOnce([sampleListing]);

      const req = new Request("http://localhost:3000/api/marketplace/listings?cropCode=yam&lga=gboko&grade=GRADE_B&availability=AVAILABLE_NOW&sort=price_asc");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.data.listings).toHaveLength(1);
      expect(json.data.totalCount).toBe(1);
      expect(mockListActiveListings).toHaveBeenCalledWith({
        cropCode: "yam",
        lga: "gboko",
        grade: "GRADE_B",
        availabilityStatus: "AVAILABLE_NOW",
        sortBy: "price_asc",
      });
    });
  });

  describe("POST", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockRequireAuth.mockRejectedValueOnce(new UnauthorizedError("You must be logged in."));

      const req = new Request("http://localhost:3000/api/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropCode: "yam" }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.ok).toBe(false);
    });

    it("returns 403 when unauthorized actor attempts to publish listing", async () => {
      mockRequireAuth.mockResolvedValueOnce({
        sessionId: "sess_buyer",
        user: { id: "usr_buyer", role: "BUYER" },
      });
      mockCreateProduceListing.mockRejectedValueOnce(
        new ForbiddenError("Only registered farmers and administrators can publish produce listings."),
      );

      const req = new Request("http://localhost:3000/api/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropCode: "yam" }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.ok).toBe(false);
      expect(json.error.message).toContain("Only registered farmers");
    });

    it("returns 201 with created listing when valid payload is submitted", async () => {
      mockRequireAuth.mockResolvedValueOnce(farmerSession);
      mockCreateProduceListing.mockResolvedValueOnce(sampleListing);

      const validPayload = {
        cropCode: "yam",
        grade: "GRADE_B",
        quantity: 50,
        unitCode: "bag",
        pricePerUnit: 35000,
        currency: "NGN",
        minOrderQuantity: 5,
        isNegotiable: true,
        availabilityStatus: "AVAILABLE_NOW",
        state: "Benue",
        lga: "gboko",
        community: "Tor-Donga Settlement",
        description: "Good sound tubers",
        photos: [],
      };

      const req = new Request("http://localhost:3000/api/marketplace/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.0.1",
        },
        body: JSON.stringify(validPayload),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.ok).toBe(true);
      expect(json.data.listing).toMatchObject({
        id: "list-1",
        cropCode: "yam",
        quantity: 50,
      });
      expect(mockCreateProduceListing).toHaveBeenCalledWith(
        { id: "usr_farmer_1", role: "FARMER" },
        validPayload,
        { ipAddress: "10.0.0.1" },
      );
    });
  });
});
