import { handleApiError, ok } from "@/lib/api-response";
import { requireAuth } from "@/modules/auth/guards";
import { getOrder } from "@/modules/orders";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const order = await getOrder(
      { id: session.user.id, role: session.user.role },
      id,
    );

    return ok({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

