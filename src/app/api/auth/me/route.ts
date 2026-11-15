import { cookies } from "next/headers";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { getCurrentUser } from "@/modules/auth/auth.service";
import {
  buildClearSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/modules/auth/sessions";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return fail("UNAUTHORIZED", "Not authenticated", 401);
    }

    const session = await getCurrentUser(token);
    if (!session) {
      const response = fail("UNAUTHORIZED", "Session expired or invalid", 401);
      response.cookies.set(
        SESSION_COOKIE_NAME,
        "",
        buildClearSessionCookieOptions(),
      );
      return response;
    }

    return ok({ user: session.user });
  } catch (error) {
    return handleApiError(error);
  }
}

