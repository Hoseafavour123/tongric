import "server-only";
import { cookies } from "next/headers";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { getCurrentUser } from "./auth.service";
import type { ActiveSessionUser } from "./auth-repo";
import type { AuthUserRole } from "./schemas";
import { SESSION_COOKIE_NAME } from "./sessions";

/**
 * Resolves the authenticated user session from the active HTTP-only cookie.
 * Returns null if no valid, unexpired session exists.
 */
export async function getServerSession(): Promise<ActiveSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await getCurrentUser(token);
  } catch {
    return null;
  }
}

/**
 * Asserts that the request has an active, valid session.
 * Throws UnauthorizedError (401) if not authenticated.
 */
export async function requireAuth(): Promise<ActiveSessionUser> {
  const session = await getServerSession();
  if (!session) {
    throw new UnauthorizedError(
      "You must be logged in to access this resource.",
    );
  }
  return session;
}

/**
 * Asserts that the request has an active session with one of the permitted roles.
 * Throws UnauthorizedError (401) if not logged in, or ForbiddenError (403) if role not allowed.
 */
export async function requireRole(
  allowedRoles: readonly AuthUserRole[],
): Promise<ActiveSessionUser> {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError(
      "Your account role does not have permission to access this resource.",
    );
  }

  return session;
}

/**
 * Asserts that an operator has permissions to register a farmer on their behalf.
 * Only verified ADMIN accounts are permitted.
 */
export function assertCanAssistRegister(operator: ActiveSessionUser): void {
  if (operator.user.role !== "ADMIN") {
    throw new ForbiddenError(
      "Only platform administrators or authorized cooperative operators can perform assisted registration.",
    );
  }
}

