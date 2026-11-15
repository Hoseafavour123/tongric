import { handleApiError, ok } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { requireAuth } from "@/modules/auth/guards";
import { respondToCommercialOffer } from "@/modules/orders";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function extractClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstHop = forwarded.split(",")[0]?.trim();
    if (firstHop) {
      return firstHop.slice(0, 64);
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp ? realIp.slice(0, 64) : null;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const body = await request.json().catch(() => {
      throw new ValidationError("Invalid JSON request body.");
    });

    const ipAddress = extractClientIp(request);

    const result = await respondToCommercialOffer(
      { id: session.user.id, role: session.user.role },
      id,
      body,
      { ipAddress },
    );

    const offer = "offer" in result ? result.offer : result;
    const order = "order" in result ? result.order : undefined;
    const autoDeclinedOfferIds =
      "autoDeclinedOfferIds" in result ? result.autoDeclinedOfferIds : [];

    return ok({
      offer,
      order,
      orderId: order?.id,
      orderCode: order?.orderCode,
      autoDeclinedOfferIds,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

