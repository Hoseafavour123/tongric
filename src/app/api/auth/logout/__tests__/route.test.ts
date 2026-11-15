import { describe, expect, it, vi } from "vitest";

const mockLogoutUser = vi.fn();
const mockCookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
  })),
}));

vi.mock("@/modules/auth/auth.service", () => ({
  logoutUser: (...args: unknown[]) => mockLogoutUser(...args),
}));

import { POST } from "../route";

describe("POST /api/auth/logout", () => {
  it("clears session cookie and calls logoutUser", async () => {
    mockCookieGet.mockReturnValueOnce({ value: "test-session-token" });
    mockLogoutUser.mockResolvedValueOnce(true);

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.loggedOut).toBe(true);
    expect(mockLogoutUser).toHaveBeenCalledWith("test-session-token");
  });
});

