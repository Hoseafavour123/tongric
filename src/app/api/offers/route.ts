import { handleApiError, ok } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { requireAuth } from "@/modules/auth/guards";
import {
  createCommercialOffer,
  listUserOffers,
} from "@/modules/orders";

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

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const roleParam = searchParams.get("role");
    const statusParam = searchParams.get("status");

    const role =
      roleParam === "buyer" || roleParam === "farmer" ? roleParam : undefined;

    const offers = await listUserOffers(
      { id: session.user.id, role: session.user.role },
      { role, status: statusParam ?? undefined },
    );

    return ok({ offers, totalCount: offers.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();

    const body = await request.json().catch(() => {
      throw new ValidationError("Invalid JSON request body.");
    });

    const ipAddress = extractClientIp(request);

    const offer = await createCommercialOffer(
      { id: session.user.id, role: session.user.role },
      body,
      { ipAddress },
    );

    return ok({ offer }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

