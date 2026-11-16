import { handleApiError, ok } from "@/lib/api-response.ts";
import { computeBarterParity, calculateBarterRatioSchema } from "@/modules/barter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = calculateBarterRatioSchema.parse(body);

    const result = computeBarterParity(input);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

