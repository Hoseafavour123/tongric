import { handleApiError, ok } from "@/lib/api-response";
import { requireAuth } from "@/modules/auth/guards";
import { markAllNotificationsAsRead } from "@/modules/notifications";

export async function POST(request: Request) {
  try {
    void request;
    const session = await requireAuth();

    const result = await markAllNotificationsAsRead(session.user.id);

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
