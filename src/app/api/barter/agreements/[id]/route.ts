import { handleApiError, ok, fail } from "@/lib/api-response.ts";
import { requireAuth } from "@/modules/auth/guards.ts";
import { getExchangeAgreement } from "@/modules/barter";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAuth();
    const { id } = await context.params;

    const agreement = await getExchangeAgreement(id);
    if (!agreement) {
      return fail("NOT_FOUND", "Exchange agreement not found", 404);
    }

    return ok(agreement);
  } catch (error) {
    return handleApiError(error);
  }
}

