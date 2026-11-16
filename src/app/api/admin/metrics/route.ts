import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/modules/auth/guards";
import { getDashboardMetrics } from "@/modules/admin";

export async function GET() {
  try {
    const session = await requireRole(["ADMIN"]);
    const metrics = await getDashboardMetrics({
      id: session.user.id,
      role: session.user.role,
    });

    return ok({ metrics });
  } catch (error) {
    return handleApiError(error);
  }
}

