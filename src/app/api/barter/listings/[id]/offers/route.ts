import { handleApiError, created } from "@/lib/api-response.ts";
import { requireAuth } from "@/modules/auth/guards.ts";
import { createExchangeOffer, createExchangeOfferSchema } from "@/modules/barter";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id: listingId } = await context.params;
    const body = await request.json();
    const input = createExchangeOfferSchema.parse(body);

    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    const offer = await createExchangeOffer(
      {
        userId: session.user.id,
        role: session.user.role,
        ipAddress: clientIp,
      },
      listingId,
      input,
    );

    return created(offer);
  } catch (error) {
    return handleApiError(error);
  }
}

