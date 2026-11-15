import { describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import type { ActiveSessionUser } from "../auth-repo";
import {
  assertCanAssistRegister,
  getServerSession,
  requireAuth,
  requireRole,
} from "../guards";

const mockCookieGet = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
  })),
}));

vi.mock("../auth.service", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

describe("authorization guards", () => {
  const adminSession: ActiveSessionUser = {
    sessionId: "sess_admin",
    user: {
      id: "usr_admin",
      fullName: "Admin Operator",
      phoneNumber: "+2348030000000",
      email: "admin@tongric.com",
      role: "ADMIN",
      accountStatus: "ACTIVE",
      preferredLanguageCode: "en",
      createdAt: new Date(),
    },
  };

  const farmerSession: ActiveSessionUser = {
    sessionId: "sess_farmer",
    user: {
      id: "usr_farmer",
      fullName: "Farmer Tersoo",
      phoneNumber: "+2348031111111",
      email: null,
      role: "FARMER",
      accountStatus: "ACTIVE",
      preferredLanguageCode: "tiv",
      createdAt: new Date(),
    },
  };

  it("assertCanAssistRegister allows ADMIN operators only", () => {
    expect(() => assertCanAssistRegister(adminSession)).not.toThrow();
    expect(() => assertCanAssistRegister(farmerSession)).toThrow(ForbiddenError);
  });

  it("getServerSession returns null when cookie is absent or token lookup fails", async () => {
    mockCookieGet.mockReturnValueOnce(undefined);
    expect(await getServerSession()).toBeNull();

    mockCookieGet.mockReturnValueOnce({ value: "invalid-token" });
    mockGetCurrentUser.mockRejectedValueOnce(new UnauthorizedError("Invalid session"));
    expect(await getServerSession()).toBeNull();
  });

  it("requireAuth returns active session or throws UnauthorizedError", async () => {
    mockCookieGet.mockReturnValueOnce({ value: "valid-token" });
    mockGetCurrentUser.mockResolvedValueOnce(farmerSession);

    const session = await requireAuth();
    expect(session.user.id).toBe("usr_farmer");

    mockCookieGet.mockReturnValueOnce(undefined);
    await expect(requireAuth()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("requireRole allows permitted roles and rejects forbidden roles", async () => {
    mockCookieGet.mockReturnValueOnce({ value: "valid-token" });
    mockGetCurrentUser.mockResolvedValueOnce(farmerSession);
    const result = await requireRole(["FARMER", "BUYER"]);
    expect(result.user.role).toBe("FARMER");

    mockCookieGet.mockReturnValueOnce({ value: "valid-token" });
    mockGetCurrentUser.mockResolvedValueOnce(farmerSession);
    await expect(requireRole(["ADMIN"])).rejects.toBeInstanceOf(ForbiddenError);

    mockCookieGet.mockReturnValueOnce(undefined);
    await expect(requireRole(["FARMER"])).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
