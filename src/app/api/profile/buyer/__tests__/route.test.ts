import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/lib/errors";

const mockRequireAuth = vi.fn();
const mockGetBuyerProfile = vi.fn();
const mockSaveBuyerProfile = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/profile", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/profile")>();
  return {
    ...actual,
    getBuyerProfile: (...args: unknown[]) => mockGetBuyerProfile(...args),
    saveBuyerProfile: (...args: unknown[]) => mockSaveBuyerProfile(...args),
  };
});

import { GET, PUT } from "../route";

describe("GET & PUT /api/profile/buyer", () => {
  const buyerSession = {
    sessionId: "sess_1",
    user: {
      id: "usr_buyer_1",
      fullName: "Musa Danladi",
      role: "BUYER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "ha",
    },
  };

  const farmerSession = {
    sessionId: "sess_2",
    user: {
      id: "usr_farmer_1",
      fullName: "Tersoo Vembe",
      role: "FARMER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "tiv",
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

    const res = await GET(new Request("http://localhost/api/profile/buyer"));
    expect(res.status).toBe(401);
  });

  it("GET returns 403 when user is not a BUYER or ADMIN", async () => {
    mockRequireAuth.mockResolvedValueOnce(farmerSession);

    const res = await GET(new Request("http://localhost/api/profile/buyer"));
    expect(res.status).toBe(403);
  });

  it("GET returns 200 with profile summary for authenticated buyer", async () => {
    mockRequireAuth.mockResolvedValueOnce(buyerSession);
    mockGetBuyerProfile.mockResolvedValueOnce({
      id: "byr_1",
      userId: "usr_buyer_1",
      businessName: "Benue Agro Processors Ltd",
      buyerType: "PROCESSOR",
      operatingLga: "makurdi",
      primaryMarket: "Modern Market",
      cropsSourced: ["yam", "soybeans"],
      verificationStatus: "UNVERIFIED",
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    });

    const res = await GET(new Request("http://localhost/api/profile/buyer"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.profile.businessName).toBe("Benue Agro Processors Ltd");
    expect(mockGetBuyerProfile).toHaveBeenCalledWith("usr_buyer_1");
  });

  it("GET allows ADMIN to query another buyer by ?buyerId", async () => {
    mockRequireAuth.mockResolvedValueOnce(adminSession);
    mockGetBuyerProfile.mockResolvedValueOnce({
      id: "byr_2",
      userId: "usr_buyer_2",
      businessName: "Agatu Grain Wholesalers",
      buyerType: "WHOLESALER",
      operatingLga: "agatu",
      primaryMarket: null,
      cropsSourced: ["rice"],
      verificationStatus: "UNVERIFIED",
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    });

    const res = await GET(
      new Request("http://localhost/api/profile/buyer?buyerId=usr_buyer_2"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.profile.userId).toBe("usr_buyer_2");
    expect(mockGetBuyerProfile).toHaveBeenCalledWith("usr_buyer_2");
  });

  it("GET rejects non-admin querying another buyerId with 403", async () => {
    mockRequireAuth.mockResolvedValueOnce(buyerSession);

    const res = await GET(
      new Request("http://localhost/api/profile/buyer?buyerId=usr_buyer_999"),
    );
    expect(res.status).toBe(403);
  });

  it("PUT saves buyer profile for authenticated buyer", async () => {
    mockRequireAuth.mockResolvedValueOnce(buyerSession);
    mockSaveBuyerProfile.mockResolvedValueOnce({
      id: "byr_1",
      userId: "usr_buyer_1",
      businessName: "Benue Agro Processors Ltd",
      buyerType: "PROCESSOR",
      operatingLga: "makurdi",
      primaryMarket: "Modern Market",
      cropsSourced: ["yam", "soybeans"],
      verificationStatus: "UNVERIFIED",
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    });

    const body = {
      businessName: "Benue Agro Processors Ltd",
      buyerType: "PROCESSOR",
      operatingLga: "makurdi",
      primaryMarket: "Modern Market",
      cropsSourced: ["yam", "soybeans"],
    };

    const res = await PUT(
      new Request("http://localhost/api/profile/buyer", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "197.210.10.15, 10.0.0.1",
        },
        body: JSON.stringify(body),
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockSaveBuyerProfile).toHaveBeenCalledWith(
      { id: "usr_buyer_1", role: "BUYER" },
      "usr_buyer_1",
      body,
      { ipAddress: "197.210.10.15" },
    );
  });

  it("PUT returns 400 when request body is invalid", async () => {
    mockRequireAuth.mockResolvedValueOnce(buyerSession);

    const res = await PUT(
      new Request("http://localhost/api/profile/buyer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json",
      }),
    );
    expect(res.status).toBe(400);
  });
});
