import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/lib/errors";

const mockLoginUser = vi.fn();

vi.mock("@/modules/auth/auth.service", () => ({
  loginUser: (...args: unknown[]) => mockLoginUser(...args),
}));

import { POST } from "../route";

describe("POST /api/auth/login", () => {
  it("returns 200, sets session cookie and locale cookie on valid login", async () => {
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    mockLoginUser.mockResolvedValueOnce({
      token: "a".repeat(64),
      expiresAt,
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

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "197.210.1.1",
      },
      body: JSON.stringify({
        phoneNumber: "08031234567",
        password: "secret-password",
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.user.fullName).toBe("Aondona Tersoo");
    const cookieHeader = res.headers.get("set-cookie") || "";
    expect(cookieHeader).toContain("tongric_session=");
    expect(cookieHeader).toContain("tongric_locale=tiv");
  });

  it("maps bad credentials to 401 Unauthorized", async () => {
    mockLoginUser.mockRejectedValueOnce(
      new UnauthorizedError("Invalid phone number or password."),
    );

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: "08031234567",
        password: "wrong-password",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});

