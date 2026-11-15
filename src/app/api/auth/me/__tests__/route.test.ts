import { describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockCookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
  })),
}));

vi.mock("@/modules/auth/auth.service", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

import { GET } from "../route";

describe("GET /api/auth/me", () => {
  it("returns 200 with user summary when authenticated", async () => {
    mockCookieGet.mockReturnValueOnce({ value: "valid-token" });
    mockGetCurrentUser.mockResolvedValueOnce({
      sessionId: "sess_1",
      user: {
        id: "usr_1",
        fullName: "Aondona Tersoo",
        phoneNumber: "+2348031234567",
        email: null,
        role: "FARMER",
        accountStatus: "ACTIVE",
        preferredLanguageCode: "tiv",
      },
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.user.fullName).toBe("Aondona Tersoo");
  });

  it("returns 401 when unauthenticated", async () => {
    mockCookieGet.mockReturnValueOnce(undefined);

    const res = await GET();
    expect(res.status).toBe(401);
  });
});

