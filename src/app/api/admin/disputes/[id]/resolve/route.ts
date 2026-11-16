import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/modules/auth/guards";
import { resolveDispute } from "@/modules/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();

    const order = await resolveDispute(
      { id: session.user.id, role: session.user.role },
      { ...body, orderId: id },
    );

    return ok({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

