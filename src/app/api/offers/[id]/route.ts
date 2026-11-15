import { handleApiError, ok } from "@/lib/api-response";
import { requireAuth } from "@/modules/auth/guards";
import { getCommercialOffer } from "@/modules/orders";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const offer = await getCommercialOffer(
      { id: session.user.id, role: session.user.role },
      id,
    );

    return ok({ offer });
  } catch (error) {
    return handleApiError(error);
  }
}

