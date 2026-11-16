import { handleApiError, ok } from "@/lib/api-response.ts";
import { requireAuth } from "@/modules/auth/guards.ts";
import { getFarmerCreditEligibility } from "@/modules/finance";

export async function GET() {
  try {
    const session = await requireAuth();
    const eligibility = await getFarmerCreditEligibility(session.user.id);
    return ok(eligibility);
  } catch (error) {
    return handleApiError(error);
  }
}

