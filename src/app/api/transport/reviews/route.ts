import { created, handleApiError } from "@/lib/api-response";
import { requireAuth } from "@/modules/auth/guards";
import { submitCarrierReview } from "@/modules/transport";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const review = await submitCarrierReview(
      { id: session.user.id, role: session.user.role },
      body,
    );

    return created({ review });
  } catch (error) {
    return handleApiError(error);
  }
}
