import { ZodError } from "zod";
import { handleApiError, ok } from "@/lib/api-response";
import { ForbiddenError } from "@/lib/errors";
import { requireAuth } from "@/modules/auth/guards";
import {
  getTransportProfile,
  saveTransportProfile,
  type RawTransportProfileInput,
} from "@/modules/profile";

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
    const url = new URL(request.url);
    const requestedTransporterId = url.searchParams.get("transporterId");

    let targetUserId = session.user.id;
    if (requestedTransporterId) {
      if (
        session.user.role !== "ADMIN" &&
        requestedTransporterId !== session.user.id
      ) {
        throw new ForbiddenError(
          "Only administrators can inspect another transport provider's profile.",
        );
      }
      targetUserId = requestedTransporterId;
    } else if (
      session.user.role !== "TRANSPORT_PROVIDER" &&
      session.user.role !== "ADMIN"
    ) {
      throw new ForbiddenError(
        "Only registered transport providers have a transport profile.",
      );
    }

    const profile = await getTransportProfile(targetUserId);

    return ok({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(request.url);
    const requestedTransporterId = url.searchParams.get("transporterId");

    let targetUserId = session.user.id;
    if (requestedTransporterId) {
      if (
        session.user.role !== "ADMIN" &&
        requestedTransporterId !== session.user.id
      ) {
        throw new ForbiddenError(
          "Only administrators can modify another transport provider's profile.",
        );
      }
      targetUserId = requestedTransporterId;
    } else if (
      session.user.role !== "TRANSPORT_PROVIDER" &&
      session.user.role !== "ADMIN"
    ) {
      throw new ForbiddenError(
        "Only registered transport providers or administrators can create or update a transport profile.",
      );
    }

    const rawBody = (await request.json().catch(() => {
      throw new ZodError([
        {
          code: "custom",
          path: [],
          message: "Request body must be valid JSON",
        },
      ]);
    })) as RawTransportProfileInput;

    const ipAddress = extractClientIp(request);

    const profile = await saveTransportProfile(
      { id: session.user.id, role: session.user.role },
      targetUserId,
      rawBody,
      { ipAddress },
    );

    return ok({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

