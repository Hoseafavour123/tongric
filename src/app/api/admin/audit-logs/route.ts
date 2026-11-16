import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/modules/auth/guards";
import { listAuditLogs } from "@/modules/admin";

export async function GET(request: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const url = new URL(request.url);

    const actionParam = url.searchParams.get("action");
    const actorUserIdParam = url.searchParams.get("actorUserId");
    const entityTypeParam = url.searchParams.get("entityType");
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    const data = await listAuditLogs(
      { id: session.user.id, role: session.user.role },
      {
        action: actionParam || undefined,
        actorUserId: actorUserIdParam || undefined,
        entityType: entityTypeParam || undefined,
        from: fromParam || undefined,
        to: toParam || undefined,
        page: pageParam ? Number.parseInt(pageParam, 10) : undefined,
        limit: limitParam ? Number.parseInt(limitParam, 10) : undefined,
      },
    );

    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

