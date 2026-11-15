import { describe, expect, it, vi } from "vitest";
import { ConflictError, ForbiddenError } from "@/lib/errors";

const mockRegisterUser = vi.fn();
const mockCookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
  })),
}));

vi.mock("@/modules/auth/auth.service", () => ({
  registerUser: (...args: unknown[]) => mockRegisterUser(...args),
}));

import { POST } from "../route";

describe("POST /api/auth/register", () => {
  it("returns 201, sets locale cookie, and passes cookieLocale & headers safely without client assistedByUserId", async () => {
    mockCookieGet.mockReturnValueOnce({ value: "ha" });
    mockRegisterUser.mockResolvedValueOnce({
      user: {
        id: "usr_123",
        fullName: "Musa Bello",
        phoneNumber: "+2348031234567",
        email: null,
        role: "FARMER",
        accountStatus: "ACTIVE",
        preferredLanguageCode: "tiv",
        createdAt: "2026-11-11T12:00:00.000Z",
      },
      recoveryCode: "TGR-ABCD2-EFGH3",
      consentPolicyVersion: "2026-11-v1",
    });

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "197.210.1.1, 10.0.0.1",
        "user-agent": "TongricMobileTest/1.0",
      },
      body: JSON.stringify({
        fullName: "Musa Bello",
        phoneNumber: "08031234567",
        password: "strong-password-9",
        role: "FARMER",
        preferredLanguageCode: "tiv",
        acceptedPrivacyPolicy: true,
        assistedByUserId: "spoofed-admin-id",
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(json.data.recoveryCode).toBe("TGR-ABCD2-EFGH3");
    expect(res.headers.get("set-cookie")).toContain("tongric_locale=tiv");
    expect(mockRegisterUser).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: "08031234567" }),
      {
        cookieLocale: "ha",
        ipAddress: "197.210.1.1",
        userAgent: "TongricMobileTest/1.0",
      },
    );
  });

  it("maps malformed JSON, duplicate accounts (409), and blocked ADMIN (403) cleanly", async () => {
    const badJsonRes = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: "{bad-json",
      }),
    );
    expect(badJsonRes.status).toBe(400);

    mockCookieGet.mockReturnValueOnce(undefined);
    mockRegisterUser.mockRejectedValueOnce(
      new ConflictError("An account with this Nigerian phone number already exists."),
    );
    const conflictRes = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: "08031234567" }),
      }),
    );
    expect(conflictRes.status).toBe(409);

    mockCookieGet.mockReturnValueOnce(undefined);
    mockRegisterUser.mockRejectedValueOnce(
      new ForbiddenError("Administrator accounts cannot be created through public registration."),
    );
    const forbiddenRes = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ADMIN" }),
      }),
    );
    expect(forbiddenRes.status).toBe(403);
  });
});

