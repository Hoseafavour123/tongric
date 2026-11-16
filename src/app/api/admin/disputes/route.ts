import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/modules/auth/guards";
import { listDisputedOrders } from "@/modules/admin";

export async function GET() {
  try {
    const session = await requireRole(["ADMIN"]);
    const disputes = await listDisputedOrders({
      id: session.user.id,
      role: session.user.role,
    });

    return ok({ disputes });
  } catch (error) {
    return handleApiError(error);
  }
}

