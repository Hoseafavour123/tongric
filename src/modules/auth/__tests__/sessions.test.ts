import { describe, expect, it } from "vitest";
import {
  buildClearSessionCookieOptions,
  buildSessionCookieOptions,
  generateSessionToken,
  hashSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_DAYS,
} from "../sessions";

describe("sessions crypto & cookie options", () => {
  it("generates 64-character high-entropy hex session tokens", () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
    expect(/^[0-9a-f]{64}$/.test(token1)).toBe(true);
  });

  it("hashes session tokens deterministically with SHA-256", () => {
    const token = generateSessionToken();
    const hash1 = hashSessionToken(token);
    const hash2 = hashSessionToken(token);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(token);
  });

  it("builds secure, HTTP-only cookie options", () => {
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    const options = buildSessionCookieOptions(expiresAt, true);

    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.secure).toBe(true);
    expect(options.path).toBe("/");
    expect(options.expires).toEqual(expiresAt);
  });

  it("builds clear cookie options with maxAge 0", () => {
    const options = buildClearSessionCookieOptions(false);

    expect(options.httpOnly).toBe(true);
    expect(options.maxAge).toBe(0);
    expect(options.path).toBe("/");
  });

  it("configures standard 30-day session lifetime and cookie name", () => {
    expect(SESSION_COOKIE_NAME).toBe("tongric_session");
    expect(SESSION_TTL_DAYS).toBe(30);
  });
});

