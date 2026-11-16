import { redirect } from "next/navigation";
import { getServerSession } from "@/modules/auth/guards";
import { listUserOffers, listUserOrders } from "@/modules/orders";
import { OffersListView } from "@/components/orders/offers-list-view";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession().catch(() => null);
  if (!session) {
    redirect("/login?returnUrl=/orders");
  }

  const [offers, orders] = await Promise.all([
    listUserOffers({ id: session.user.id, role: session.user.role }).catch(
      () => [],
    ),
    listUserOrders({ id: session.user.id, role: session.user.role }).catch(
      () => [],
    ),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Orders &amp; Negotiations
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Track confirmed commercial orders, active proposals, and agreed trade terms.
        </p>
      </div>

      <OffersListView
        offers={offers}
        orders={orders}
        currentUserId={session.user.id}
      />
    </div>
  );
}

