import { describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";

const mockRequireAuth = vi.fn();
const mockGetFarmerProfile = vi.fn();
const mockSaveFarmerProfile = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/profile", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/profile")>();
  return {
    ...actual,
    getFarmerProfile: (...args: unknown[]) => mockGetFarmerProfile(...args),
    saveFarmerProfile: (...args: unknown[]) => mockSaveFarmerProfile(...args),
  };
});

import { GET, PUT } from "../route";

describe("GET & PUT /api/profile/farmer", () => {
  const farmerSession = {
    sessionId: "sess_1",
    user: {
      id: "usr_farmer_1",
      fullName: "Tersoo Vembe",
      role: "FARMER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "tiv",
    },
  };

  const buyerSession = {
    sessionId: "sess_2",
    user: {
      id: "usr_buyer_1",
      fullName: "Musa Danladi",
      role: "BUYER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "ha",
    },
  };

  const adminSession = {
    sessionId: "sess_3",
    user: {
      id: "usr_admin_1",
      fullName: "Makurdi Admin",
      role: "ADMIN" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    },
  };

  it("GET returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockRejectedValueOnce(
      new UnauthorizedError("You must be logged in."),
    );

    const res = await GET(new Request("http://localhost/api/profile/farmer"));
    expect(res.status).toBe(401);
  });

  it("GET returns 403 when user is not a FARMER or ADMIN", async () => {
    mockRequireAuth.mockResolvedValueOnce(buyerSession);

    const res = await GET(new Request("http://localhost/api/profile/farmer"));
    expect(res.status).toBe(403);
  });

  it("GET returns 200 with profile summary for authenticated farmer", async () => {
    mockRequireAuth.mockResolvedValueOnce(farmerSession);
    mockGetFarmerProfile.mockResolvedValueOnce({
      id: "prf_1",
      userId: "usr_farmer_1",
      state: "Benue",
      lga: "gboko",
      community: "Tse-Agber",
      primaryCrops: ["yam", "soybeans"],
      cooperativeName: null,
      farmSizeHectares: 2.0,
      verificationStatus: "UNVERIFIED",
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    });

    const res = await GET(new Request("http://localhost/api/profile/farmer"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.profile.lga).toBe("gboko");
    expect(mockGetFarmerProfile).toHaveBeenCalledWith("usr_farmer_1");
  });

  it("GET allows ADMIN to query another farmer by ?farmerId", async () => {
    mockRequireAuth.mockResolvedValueOnce(adminSession);
    mockGetFarmerProfile.mockResolvedValueOnce({
      id: "prf_2",
      userId: "usr_farmer_target",
      state: "Benue",
      lga: "katsina-ala",
      community: "Tor-Donga",
      primaryCrops: ["yam"],
      cooperativeName: null,
      farmSizeHectares: null,
      verificationStatus: "UNVERIFIED",
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    });

    const res = await GET(
      new Request("http://localhost/api/profile/farmer?farmerId=usr_farmer_target"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.profile.userId).toBe("usr_farmer_target");
    expect(mockGetFarmerProfile).toHaveBeenCalledWith("usr_farmer_target");
  });

  it("PUT returns 403 when non-farmer/non-admin attempts to update profile", async () => {
    mockRequireAuth.mockResolvedValueOnce(buyerSession);

    const res = await PUT(
      new Request("http://localhost/api/profile/farmer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(res.status).toBe(403);
  });

  it("PUT updates farmer profile and returns 200 with saved profile", async () => {
    mockRequireAuth.mockResolvedValueOnce(farmerSession);
    mockSaveFarmerProfile.mockResolvedValueOnce({
      id: "prf_1",
      userId: "usr_farmer_1",
      state: "Benue",
      lga: "gboko",
      community: "Tse-Agber",
      primaryCrops: ["yam", "soybeans"],
      cooperativeName: "Gboko Cooperative",
      farmSizeHectares: 3.5,
      verificationStatus: "UNVERIFIED",
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    });

    const res = await PUT(
      new Request("http://localhost/api/profile/farmer", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "102.89.1.5",
        },
        body: JSON.stringify({
          lga: "Gboko",
          community: "Tse-Agber",
          primaryCrops: ["yam", "soybeans"],
          cooperativeName: "Gboko Cooperative",
          farmSizeHectares: 3.5,
        }),
      }),
    );

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.profile.lga).toBe("gboko");
    expect(mockSaveFarmerProfile).toHaveBeenCalledWith(
      { id: "usr_farmer_1", role: "FARMER" },
      "usr_farmer_1",
      expect.objectContaining({ lga: "Gboko" }),
      { ipAddress: "102.89.1.5" },
    );
  });

  it("PUT returns 400 when body has invalid JSON or validation error", async () => {
    mockRequireAuth.mockResolvedValueOnce(farmerSession);

    const badJsonRes = await PUT(
      new Request("http://localhost/api/profile/farmer", {
        method: "PUT",
        body: "{bad-json",
      }),
    );
    expect(badJsonRes.status).toBe(400);

    mockRequireAuth.mockResolvedValueOnce(farmerSession);
    mockSaveFarmerProfile.mockRejectedValueOnce(
      new ForbiddenError("You do not have permission to update this profile."),
    );

    const forbiddenRes = await PUT(
      new Request("http://localhost/api/profile/farmer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lga: "gboko" }),
      }),
    );
    expect(forbiddenRes.status).toBe(403);
  });
});

