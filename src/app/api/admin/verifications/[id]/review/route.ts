import { ZodError } from "zod";
import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/modules/auth/guards";
import { reviewVerificationDocument } from "@/modules/profile";

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

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { id } = await props.params;

    const rawBody = (await request.json().catch(() => {
      throw new ZodError([
        {
          code: "custom",
          path: [],
          message: "Request body must be valid JSON",
        },
      ]);
    })) as { decision: unknown; reason?: unknown };

    const ipAddress = extractClientIp(request);

    const document = await reviewVerificationDocument(
      { id: session.user.id, role: session.user.role },
      id,
      rawBody,
      { ipAddress },
    );

    return ok({ document });
  } catch (error) {
    return handleApiError(error);
  }
}
