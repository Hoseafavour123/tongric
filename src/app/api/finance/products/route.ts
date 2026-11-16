import { handleApiError, ok } from "@/lib/api-response.ts";
import { listActiveFinancingProducts } from "@/modules/finance";

export async function GET() {
  try {
    const products = await listActiveFinancingProducts();
    return ok(products);
  } catch (error) {
    return handleApiError(error);
  }
}

