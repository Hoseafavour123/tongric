import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, EmptyState, buttonClasses } from "@/components/ui";
import { getProduceListing } from "@/modules/marketplace";
import { getServerSession } from "@/modules/auth/guards";
import { ListingDetailView } from "@/components/marketplace/listing-detail-view";

export const dynamic = "force-dynamic";

interface MarketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketDetailPage({ params }: MarketDetailPageProps) {
  const { id } = await params;

  const [session, listing] = await Promise.all([
    getServerSession().catch(() => null),
    getProduceListing(id).catch(() => null),
  ]);

  if (!listing) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-12">
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-12 text-center">
              <EmptyState
                title="Produce listing not found"
                description="This listing may have been sold out, paused, or removed by the farmer."
                action={
                  <Link
                    href="/market"
                    className={buttonClasses({
                      variant: "primary",
                      className: "min-h-[44px] mt-4",
                    })}
                  >
                    Back to Marketplace
                  </Link>
                }
              />
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <ListingDetailView
          listing={listing}
          currentUserId={session?.user.id}
          currentUserRole={session?.user.role}
        />
      </div>
    </AppShell>
  );
}

