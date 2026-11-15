import { handleApiError, ok } from "@/lib/api-response";
import { requireAuth } from "@/modules/auth/guards";
import { listFarmerListings } from "@/modules/marketplace";

export async function GET() {
  try {
    const session = await requireAuth();
    const listings = await listFarmerListings(session.user.id);
    return ok({ listings });
  } catch (error) {
    return handleApiError(error);
  }
}

