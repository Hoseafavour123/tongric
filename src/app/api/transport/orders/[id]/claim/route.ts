import { handleApiError, ok } from "@/lib/api-response";
import { requireAuth } from "@/modules/auth/guards";
import { claimTransportOrder } from "@/modules/transport";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const assignment = await claimTransportOrder(
      { id: session.user.id, role: session.user.role },
      { orderId: id },
    );

    return ok({ assignment });
  } catch (error) {
    return handleApiError(error);
  }
}

