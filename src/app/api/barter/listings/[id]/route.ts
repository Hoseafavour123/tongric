import { handleApiError, ok, fail } from "@/lib/api-response.ts";
import { getExchangeListing } from "@/modules/barter";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await getExchangeListing(id);

    if (!data.listing) {
      return fail("NOT_FOUND", "Exchange listing not found", 404);
    }

    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

