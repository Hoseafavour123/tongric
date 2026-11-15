import { describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";

const mockRequireRole = vi.fn();
const mockAssistedRegisterFarmer = vi.fn();
const mockCookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
  })),
}));

vi.mock("@/modules/auth/guards", () => ({
  requireRole: (...args: unknown[]) => mockRequireRole(...args),
}));

vi.mock("@/modules/auth/auth.service", () => ({
  assistedRegisterFarmer: (...args: unknown[]) => mockAssistedRegisterFarmer(...args),
}));

import { POST } from "../route";

describe("POST /api/admin/assisted-register", () => {
  it("returns 401 when unauthenticated", async () => {
    mockRequireRole.mockRejectedValueOnce(
      new UnauthorizedError("You must be logged in to access this resource."),
    );

    const req = new Request("http://localhost/api/admin/assisted-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not an ADMIN", async () => {
    mockRequireRole.mockRejectedValueOnce(
      new ForbiddenError("You do not have permission to access this resource."),
    );

    const req = new Request("http://localhost/api/admin/assisted-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 201 with created farmer and recovery code when invoked by ADMIN", async () => {
    const adminUser = {
      id: "admin_123",
      fullName: "Admin Operator",
      phoneNumber: "+2348039999999",
      email: "admin@tongric.ng",
      role: "ADMIN" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    };
    mockRequireRole.mockResolvedValueOnce(adminUser);

    mockCookieGet.mockReturnValueOnce({ value: "ha" });
    mockAssistedRegisterFarmer.mockResolvedValueOnce({
      user: {
        id: "farmer_456",
        fullName: "Iorwuese Tyav",
        phoneNumber: "+2348021112233",
        email: null,
        role: "FARMER",
        accountStatus: "ACTIVE",
        preferredLanguageCode: "tiv",
        createdAt: "2026-11-13T00:00:00.000Z",
      },
      recoveryCode: "TGR-77XYZ-99ABC",
      consentPolicyVersion: "2026-11-v1",
    });

    const req = new Request("http://localhost/api/admin/assisted-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "102.89.22.1",
        "user-agent": "TongricAdminWeb/1.0",
      },
      body: JSON.stringify({
        fullName: "Iorwuese Tyav",
        phoneNumber: "08021112233",
        password: "temporary-secure-pw-1",
        role: "FARMER",
        preferredLanguageCode: "tiv",
        acceptedPrivacyPolicy: true,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(json.data.recoveryCode).toBe("TGR-77XYZ-99ABC");
    expect(json.data.user.id).toBe("farmer_456");
    expect(mockRequireRole).toHaveBeenCalledWith(["ADMIN"]);
    expect(mockAssistedRegisterFarmer).toHaveBeenCalledWith(
      adminUser,
      expect.objectContaining({ phoneNumber: "08021112233" }),
      {
        cookieLocale: "ha",
        ipAddress: "102.89.22.1",
        userAgent: "TongricAdminWeb/1.0",
      },
    );
  });

  it("returns 400 when body is malformed JSON", async () => {
    mockRequireRole.mockResolvedValueOnce({
      id: "admin_123",
      role: "ADMIN",
    });

    const req = new Request("http://localhost/api/admin/assisted-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not-json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

