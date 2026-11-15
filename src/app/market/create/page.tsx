import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { CreateListingView } from "@/components/marketplace/create-listing-view";
import { buttonClasses, Card, CardContent } from "@/components/ui";
import { requireAuth } from "@/modules/auth/guards";
import { getFarmerProfile } from "@/modules/profile";

export const dynamic = "force-dynamic";

export default async function CreateListingPage() {
  const session = await requireAuth().catch(() => null);

  if (!session) {
    redirect("/login?next=/market/create");
  }

  if (session.user.role !== "FARMER" && session.user.role !== "ADMIN") {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl px-4 py-12 space-y-4">
          <Card className="border border-amber-200 bg-white">
            <CardContent className="p-6 space-y-4 text-center">
              <h1 className="text-xl font-bold text-gray-900">
                Farmer Account Required
              </h1>
              <p className="text-sm text-gray-600">
                Only registered farmers and administrators can list agricultural produce for sale on Tongric.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/market"
                  className={buttonClasses({
                    variant: "primary",
                    className: "min-h-[44px]",
                  })}
                >
                  Browse Marketplace
                </Link>
                <Link
                  href="/account"
                  className={buttonClasses({
                    variant: "ghost",
                    className: "min-h-[44px]",
                  })}
                >
                  My Account
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const farmerProfile = await getFarmerProfile(session.user.id).catch(() => null);

  return (
    <AppShell>
      <CreateListingView
        defaultLga={farmerProfile?.lga ?? ""}
        defaultCommunity={farmerProfile?.community ?? ""}
      />
    </AppShell>
  );
}
