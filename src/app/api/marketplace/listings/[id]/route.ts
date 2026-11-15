import { handleApiError, ok } from "@/lib/api-response";
import { getProduceListing } from "@/modules/marketplace";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const listing = await getProduceListing(id);
    return ok({ listing });
  } catch (error) {
    return handleApiError(error);
  }
}

