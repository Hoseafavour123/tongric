import { handleApiError, ok } from "@/lib/api-response";
import { requireAuth } from "@/modules/auth/guards";
import { listUserNotifications } from "@/modules/notifications";

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(request.url);

    const unreadOnlyParam = url.searchParams.get("unreadOnly");
    const limitParam = url.searchParams.get("limit");

    const unreadOnly = unreadOnlyParam === "true" || unreadOnlyParam === "1";
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

    const data = await listUserNotifications(session.user.id, {
      unreadOnly,
      limit,
    });

    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

