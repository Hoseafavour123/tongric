import { handleApiError, ok } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { requireAuth } from "@/modules/auth/guards";
import { verifyPickupPin } from "@/modules/orders";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const body = await request.json().catch(() => {
      throw new ValidationError("Invalid JSON request body.");
    });

    const order = await verifyPickupPin(
      { id: session.user.id, role: session.user.role },
      id,
      body,
    );

    return ok({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
