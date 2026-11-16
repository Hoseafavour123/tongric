import { handleApiError, ok } from "@/lib/api-response";
import { requireAuth } from "@/modules/auth/guards";
import { getOrderReview } from "@/modules/transport";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const review = await getOrderReview(
      { id: session.user.id, role: session.user.role },
      id,
    );

    return ok({ review });
  } catch (error) {
    return handleApiError(error);
  }
}

