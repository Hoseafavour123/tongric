import { ZodError } from "zod";
import { handleApiError, ok } from "@/lib/api-response";
import { ForbiddenError } from "@/lib/errors";
import { requireAuth } from "@/modules/auth/guards";
import {
  getBuyerProfile,
  saveBuyerProfile,
  type RawBuyerProfileInput,
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
    const requestedBuyerId = url.searchParams.get("buyerId");

    let targetUserId = session.user.id;
    if (requestedBuyerId) {
      if (session.user.role !== "ADMIN" && requestedBuyerId !== session.user.id) {
        throw new ForbiddenError(
          "Only administrators can inspect another buyer's profile.",
        );
      }
      targetUserId = requestedBuyerId;
    } else if (session.user.role !== "BUYER" && session.user.role !== "ADMIN") {
      throw new ForbiddenError("Only registered buyers have a buyer profile.");
    }

    const profile = await getBuyerProfile(targetUserId);

    return ok({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(request.url);
    const requestedBuyerId = url.searchParams.get("buyerId");

    let targetUserId = session.user.id;
    if (requestedBuyerId) {
      if (session.user.role !== "ADMIN" && requestedBuyerId !== session.user.id) {
        throw new ForbiddenError(
          "Only administrators can modify another buyer's profile.",
        );
      }
      targetUserId = requestedBuyerId;
    } else if (session.user.role !== "BUYER" && session.user.role !== "ADMIN") {
      throw new ForbiddenError(
        "Only registered buyers or administrators can create or update a buyer profile.",
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
    })) as RawBuyerProfileInput;

    const ipAddress = extractClientIp(request);

    const profile = await saveBuyerProfile(
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

