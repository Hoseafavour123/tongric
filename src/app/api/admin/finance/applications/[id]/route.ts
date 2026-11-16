import { handleApiError, ok } from "@/lib/api-response.ts";
import { requireRole } from "@/modules/auth/guards.ts";
import { updateLoanApplicationStatus, updateLoanApplicationStatusSchema } from "@/modules/finance";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { id } = await context.params;
    const body = await request.json();
    const input = updateLoanApplicationStatusSchema.parse(body);

    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    const application = await updateLoanApplicationStatus(
      {
        userId: session.user.id,
        role: session.user.role,
        ipAddress: clientIp,
      },
      id,
      input.status,
      input.partnerNote,
    );

    return ok(application);
  } catch (error) {
    return handleApiError(error);
  }
}

