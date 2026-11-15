import { handleApiError, ok } from "@/lib/api-response";
import { requireAuth } from "@/modules/auth/guards";
import { listUserOrders, orderStatusEnum } from "@/modules/orders";

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(request.url);

    const roleParam = url.searchParams.get("role");
    const statusParam = url.searchParams.get("status");

    const role =
      roleParam === "buyer" || roleParam === "farmer"
        ? (roleParam as "buyer" | "farmer")
        : undefined;

    const parsedStatus = orderStatusEnum.safeParse(statusParam);
    const status = parsedStatus.success ? parsedStatus.data : undefined;

    const orders = await listUserOrders(
      { id: session.user.id, role: session.user.role },
      { role, status },
    );

    return ok({ orders });
  } catch (error) {
    return handleApiError(error);
  }
}

