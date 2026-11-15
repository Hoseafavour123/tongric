import { cookies } from "next/headers";
import { handleApiError, ok } from "@/lib/api-response";
import { logoutUser } from "@/modules/auth/auth.service";
import {
  buildClearSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/modules/auth/sessions";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await logoutUser(token);
    }

    const response = ok({ loggedOut: true });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      "",
      buildClearSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

