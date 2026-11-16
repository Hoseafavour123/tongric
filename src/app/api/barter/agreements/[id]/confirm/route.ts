import { handleApiError, ok } from "@/lib/api-response.ts";
import { requireAuth } from "@/modules/auth/guards.ts";
import { confirmExchangeAgreement } from "@/modules/barter";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id: agreementId } = await context.params;

    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    const agreement = await confirmExchangeAgreement(
      {
        userId: session.user.id,
        role: session.user.role,
        ipAddress: clientIp,
      },
      agreementId,
    );

    return ok(agreement);
  } catch (error) {
    return handleApiError(error);
  }
}

