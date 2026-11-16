import { handleApiError, ok, created } from "@/lib/api-response.ts";
import { requireRole } from "@/modules/auth/guards.ts";
import { getAllFinancingProducts, createFinancingProduct, createFinancingProductSchema } from "@/modules/finance";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const products = await getAllFinancingProducts();
    return ok(products);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const input = createFinancingProductSchema.parse(body);

    const product = await createFinancingProduct(input);
    return created(product);
  } catch (error) {
    return handleApiError(error);
  }
}

