import { createHash, randomBytes } from "node:crypto";

export const SESSION_COOKIE_NAME = "tongric_session" as const;
export const SESSION_TTL_DAYS = 30;
export const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

/**
 * Generates a high-entropy 32-byte cryptographic random hex token (64 hex characters).
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hashes a session token with SHA-256 for secure database lookup.
 * Plaintext tokens are only held by the user in their HTTP-only cookie.
 */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Builds HTTP-only, secure, SameSite=Lax cookie options for session persistence.
 */
export function buildSessionCookieOptions(
  expiresAt: Date,
  isProduction = process.env.NODE_ENV === "production",
) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    expires: expiresAt,
  };
}

/**
 * Options to clear the session cookie on logout or invalid session.
 */
export function buildClearSessionCookieOptions(
  isProduction = process.env.NODE_ENV === "production",
) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: 0,
  };
}

