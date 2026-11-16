import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, EmptyState, buttonClasses } from "@/components/ui";
import { getServerSession } from "@/modules/auth/guards";
import { getOrder } from "@/modules/orders";
import { getOrderReview } from "@/modules/transport";
import { OrderDetailView } from "@/components/orders/order-detail-view";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getServerSession().catch(() => null);
  if (!session) {
    redirect("/login?returnUrl=/orders");
  }

  const { id } = await params;

  let order = null;
  try {
    order = await getOrder(
      { id: session.user.id, role: session.user.role },
      id,
    );
  } catch {
    order = null;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-12 text-center">
            <EmptyState
              title="Order not found or access denied"
              description="This confirmed order does not exist or you do not have permission to view this transaction contract."
              action={
                <Link
                  href="/orders"
                  className={buttonClasses({
                    variant: "primary",
                    className: "min-h-[44px] mt-4",
                  })}
                >
                  Back to Orders
                </Link>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  let initialCarrierReview = null;
  if (
    order.transporterId &&
    (order.status === "DELIVERED" || order.status === "COMPLETED")
  ) {
    try {
      initialCarrierReview = await getOrderReview(
        { id: session.user.id, role: session.user.role },
        id,
      );
    } catch {
      initialCarrierReview = null;
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <OrderDetailView
        order={order}
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
        initialCarrierReview={initialCarrierReview}
      />
    </div>
  );
}

