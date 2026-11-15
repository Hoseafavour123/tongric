import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/modules/auth/guards";
import {
  listPendingVerifications,
  type VerificationStatus,
} from "@/modules/profile";

export async function GET(request: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const url = new URL(request.url);

    const statusParam = url.searchParams.get("status") as VerificationStatus | null;
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const items = await listPendingVerifications(
      { id: session.user.id, role: session.user.role },
      {
        status: statusParam || undefined,
        limit: Number.isFinite(limit) ? limit : undefined,
      },
    );

    return ok({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
