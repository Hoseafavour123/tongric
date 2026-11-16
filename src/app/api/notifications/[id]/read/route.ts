import { handleApiError, ok } from "@/lib/api-response";
import { requireAuth } from "@/modules/auth/guards";
import { markNotificationAsRead } from "@/modules/notifications";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const notification = await markNotificationAsRead(session.user.id, id);

    return ok({ notification });
  } catch (error) {
    return handleApiError(error);
  }
}

