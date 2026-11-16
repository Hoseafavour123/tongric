import { handleApiError, ok, fail } from "@/lib/api-response.ts";
import { requireAuth } from "@/modules/auth/guards.ts";
import { getLoanApplicationById } from "@/modules/finance";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;

    const application = await getLoanApplicationById(id);
    if (!application) {
      return fail("NOT_FOUND", "Loan application not found", 404);
    }

    if (application.farmerId !== session.user.id && session.user.role !== "ADMIN") {
      return fail("FORBIDDEN", "You are not authorized to view this loan application", 403);
    }

    return ok(application);
  } catch (error) {
    return handleApiError(error);
  }
}

