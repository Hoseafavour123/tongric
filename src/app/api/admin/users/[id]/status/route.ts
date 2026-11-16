import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/modules/auth/guards";
import { updateUserStatus } from "@/modules/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();

    const user = await updateUserStatus(
      { id: session.user.id, role: session.user.role },
      id,
      body,
    );

    return ok({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

