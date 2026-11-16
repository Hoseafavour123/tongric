import { handleApiError, ok } from "@/lib/api-response";
import { requireAuth } from "@/modules/auth/guards";
import { getWaybill } from "@/modules/orders";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const waybill = await getWaybill(
      { id: session.user.id, role: session.user.role },
      id,
    );

    return ok({ waybill });
  } catch (error) {
    return handleApiError(error);
  }
}
