import { handleApiError, ok } from "@/lib/api-response";
import { requireAuth } from "@/modules/auth/guards";
import { listOpenTransportRequests } from "@/modules/transport";

export async function GET() {
  try {
    await requireAuth();
    const requests = await listOpenTransportRequests();
    return ok({ requests });
  } catch (error) {
    return handleApiError(error);
  }
}

