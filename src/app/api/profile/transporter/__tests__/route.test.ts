import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/lib/errors";

const mockRequireAuth = vi.fn();
const mockGetTransportProfile = vi.fn();
const mockSaveTransportProfile = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/profile", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/profile")>();
  return {
    ...actual,
    getTransportProfile: (...args: unknown[]) =>
      mockGetTransportProfile(...args),
    saveTransportProfile: (...args: unknown[]) =>
      mockSaveTransportProfile(...args),
  };
});

import { GET, PUT } from "../route";

describe("GET & PUT /api/profile/transporter", () => {
  const transporterSession = {
    sessionId: "sess_1",
    user: {
      id: "usr_trans_1",
      fullName: "Audu Ogbeh",
      role: "TRANSPORT_PROVIDER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "ido",
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

    const res = await GET(
      new Request("http://localhost/api/profile/transporter"),
    );
    expect(res.status).toBe(401);
  });

  it("GET returns 403 when user is not a TRANSPORT_PROVIDER or ADMIN", async () => {
    mockRequireAuth.mockResolvedValueOnce(farmerSession);

    const res = await GET(
      new Request("http://localhost/api/profile/transporter"),
    );
    expect(res.status).toBe(403);
  });

  it("GET returns 200 with profile summary for authenticated transport provider", async () => {
    mockRequireAuth.mockResolvedValueOnce(transporterSession);
    mockGetTransportProfile.mockResolvedValueOnce({
      id: "trn_1",
      userId: "usr_trans_1",
      operatorName: "Tersoo Haulage Services",
      vehicleTypes: ["PICKUP", "VAN"],
      maxCapacityKg: 3000,
      operatingLgas: ["gboko", "makurdi"],
      isAvailable: true,
      pricingModel: "QUOTE_ON_REQUEST",
      verificationStatus: "UNVERIFIED",
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    });

    const res = await GET(
      new Request("http://localhost/api/profile/transporter"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.profile.operatorName).toBe("Tersoo Haulage Services");
    expect(mockGetTransportProfile).toHaveBeenCalledWith("usr_trans_1");
  });

  it("GET allows ADMIN to query another transporter by ?transporterId", async () => {
    mockRequireAuth.mockResolvedValueOnce(adminSession);
    mockGetTransportProfile.mockResolvedValueOnce({
      id: "trn_2",
      userId: "usr_trans_2",
      operatorName: "Otukpo Heavy Cargo",
      vehicleTypes: ["TRUCK"],
      maxCapacityKg: 15000,
      operatingLgas: ["otukpo"],
      isAvailable: true,
      pricingModel: "FIXED_RATE_CARD",
      verificationStatus: "UNVERIFIED",
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    });

    const res = await GET(
      new Request(
        "http://localhost/api/profile/transporter?transporterId=usr_trans_2",
      ),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.profile.userId).toBe("usr_trans_2");
    expect(mockGetTransportProfile).toHaveBeenCalledWith("usr_trans_2");
  });

  it("GET rejects non-admin querying another transporterId with 403", async () => {
    mockRequireAuth.mockResolvedValueOnce(transporterSession);

    const res = await GET(
      new Request(
        "http://localhost/api/profile/transporter?transporterId=usr_trans_999",
      ),
    );
    expect(res.status).toBe(403);
  });

  it("PUT saves transport profile for authenticated transport provider", async () => {
    mockRequireAuth.mockResolvedValueOnce(transporterSession);
    mockSaveTransportProfile.mockResolvedValueOnce({
      id: "trn_1",
      userId: "usr_trans_1",
      operatorName: "Tersoo Haulage Services",
      vehicleTypes: ["PICKUP", "VAN"],
      maxCapacityKg: 3000,
      operatingLgas: ["gboko", "makurdi"],
      isAvailable: true,
      pricingModel: "QUOTE_ON_REQUEST",
      verificationStatus: "UNVERIFIED",
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    });

    const body = {
      operatorName: "Tersoo Haulage Services",
      vehicleTypes: ["PICKUP", "VAN"],
      maxCapacityKg: 3000,
      operatingLgas: ["gboko", "makurdi"],
      isAvailable: true,
      pricingModel: "QUOTE_ON_REQUEST",
    };

    const res = await PUT(
      new Request("http://localhost/api/profile/transporter", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-real-ip": "197.210.10.88",
        },
        body: JSON.stringify(body),
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockSaveTransportProfile).toHaveBeenCalledWith(
      { id: "usr_trans_1", role: "TRANSPORT_PROVIDER" },
      "usr_trans_1",
      body,
      { ipAddress: "197.210.10.88" },
    );
  });

  it("PUT returns 400 when request body is invalid", async () => {
    mockRequireAuth.mockResolvedValueOnce(transporterSession);

    const res = await PUT(
      new Request("http://localhost/api/profile/transporter", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json",
      }),
    );
    expect(res.status).toBe(400);
  });
});
