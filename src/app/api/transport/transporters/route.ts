import { handleApiError, ok } from "@/lib/api-response";
import { listVerifiedTransporters } from "@/modules/transport";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lga = searchParams.get("lga") || undefined;

    const transporters = await listVerifiedTransporters(lga);
    return ok({ transporters });
  } catch (error) {
    return handleApiError(error);
  }
}

