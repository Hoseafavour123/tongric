import { handleApiError, ok } from "@/lib/api-response";
import { getDb } from "@/lib/db";
import { ValidationError } from "@/lib/errors";
import { requireAuth } from "@/modules/auth/guards";
import type { UserRole } from "@prisma/client";

const VALID_ROLES = new Set(["FARMER", "BUYER", "TRANSPORT_PROVIDER", "ADMIN"]);

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const requestedRole = body.role as string;

    if (!requestedRole || !VALID_ROLES.has(requestedRole)) {
      throw new ValidationError(
        "Invalid role. Must be FARMER, BUYER, TRANSPORT_PROVIDER, or ADMIN.",
      );
    }

    const prisma = getDb();
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { role: requestedRole as UserRole },
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        fullName: true,
        role: true,
        accountStatus: true,
        preferredLanguageCode: true,
      },
    });

    return ok({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

