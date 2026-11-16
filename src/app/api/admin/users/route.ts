import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/modules/auth/guards";
import { listUsers } from "@/modules/admin";

export async function GET(request: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const url = new URL(request.url);

    const roleParam = url.searchParams.get("role");
    const statusParam = url.searchParams.get("status");
    const searchParam = url.searchParams.get("search");
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    const data = await listUsers(
      { id: session.user.id, role: session.user.role },
      {
        role: roleParam || undefined,
        status: statusParam || undefined,
        search: searchParam || undefined,
        page: pageParam ? Number.parseInt(pageParam, 10) : undefined,
        limit: limitParam ? Number.parseInt(limitParam, 10) : undefined,
      },
    );

    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

