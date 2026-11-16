import { handleApiError, ok } from "@/lib/api-response";
import { getCarrierReviews } from "@/modules/transport";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const reviews = await getCarrierReviews(id);
    return ok({ reviews });
  } catch (error) {
    return handleApiError(error);
  }
}

