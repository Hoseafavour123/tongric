import { ZodError } from "zod";
import { handleApiError, ok } from "@/lib/api-response";
import { ForbiddenError } from "@/lib/errors";
import { requireAuth } from "@/modules/auth/guards";
import {
  getFarmerProfile,
  saveFarmerProfile,
  type RawFarmerProfileInput,
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
    const requestedFarmerId = url.searchParams.get("farmerId");

    let targetUserId = session.user.id;
    if (requestedFarmerId) {
      if (session.user.role !== "ADMIN" && requestedFarmerId !== session.user.id) {
        throw new ForbiddenError(
          "Only administrators can inspect another farmer's profile.",
        );
      }
      targetUserId = requestedFarmerId;
    } else if (session.user.role !== "FARMER" && session.user.role !== "ADMIN") {
      throw new ForbiddenError("Only registered farmers have a farm profile.");
    }

    const profile = await getFarmerProfile(targetUserId);

    return ok({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(request.url);
    const requestedFarmerId = url.searchParams.get("farmerId");

    let targetUserId = session.user.id;
    if (requestedFarmerId) {
      if (session.user.role !== "ADMIN" && requestedFarmerId !== session.user.id) {
        throw new ForbiddenError(
          "Only administrators can modify another farmer's profile.",
        );
      }
      targetUserId = requestedFarmerId;
    } else if (session.user.role !== "FARMER" && session.user.role !== "ADMIN") {
      throw new ForbiddenError(
        "Only registered farmers or administrators can create or update a farm profile.",
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
    })) as RawFarmerProfileInput;

    const ipAddress = extractClientIp(request);

    const profile = await saveFarmerProfile(
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

