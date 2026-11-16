import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, EmptyState, buttonClasses } from "@/components/ui";
import { getServerSession } from "@/modules/auth/guards";
import { getCommercialOffer } from "@/modules/orders";
import { OfferThreadView } from "@/components/orders/offer-thread-view";

export const dynamic = "force-dynamic";

interface OfferDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OfferDetailPage({ params }: OfferDetailPageProps) {
  const session = await getServerSession().catch(() => null);
  if (!session) {
    redirect("/login?returnUrl=/orders");
  }

  const { id } = await params;

  let offer = null;
  try {
    offer = await getCommercialOffer(
      { id: session.user.id, role: session.user.role },
      id,
    );
  } catch {
    offer = null;
  }

  if (!offer) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-12 text-center">
            <EmptyState
              title="Offer not found or access denied"
              description="This purchase offer does not exist or you do not have permission to view this negotiation thread."
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <OfferThreadView
        offer={offer}
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
      />
    </div>
  );
}

