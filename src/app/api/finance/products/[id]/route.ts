import { handleApiError, ok, fail } from "@/lib/api-response.ts";
import { getFinancingProductById } from "@/modules/finance";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const product = await getFinancingProductById(id);

    if (!product) {
      return fail("NOT_FOUND", "Financing product not found", 404);
    }

    return ok(product);
  } catch (error) {
    return handleApiError(error);
  }
}

