import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  Badge,
  buttonClasses,
  Card,
  CardContent,
  EmptyState,
} from "@/components/ui";
import { Plus, MapPin, Calendar, Scale } from "lucide-react";
import { listActiveListings } from "@/modules/marketplace";
import { getServerSession } from "@/modules/auth/guards";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const [session, listings] = await Promise.all([
    getServerSession().catch(() => null),
    listActiveListings().catch(() => []),
  ]);

  const isFarmerOrAdmin =
    session?.user.role === "FARMER" || session?.user.role === "ADMIN";

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Marketplace Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Produce Market
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Direct agricultural produce from verified Benue farmers and cooperatives.
            </p>
          </div>

          {isFarmerOrAdmin && (
            <Link
              href="/market/create"
              className={buttonClasses({
                variant: "primary",
                className: "min-h-[44px] px-5 flex items-center gap-2 self-start sm:self-auto",
              })}
            >
              <Plus className="h-5 w-5" />
              <span>Sell Produce</span>
            </Link>
          )}
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-12 text-center">
              <EmptyState
                title="No produce listings available"
                description="Check back soon or list your harvest to start selling to verified commercial buyers."
                action={
                  isFarmerOrAdmin ? (
                    <Link
                      href="/market/create"
                      className={buttonClasses({
                        variant: "primary",
                        className: "min-h-[44px] mt-4",
                      })}
                    >
                      List Your Harvest
                    </Link>
                  ) : undefined
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => {
              const primaryPhoto =
                item.primaryPhotoUrl ||
                item.photos.find((p) => p.isPrimary)?.publicUrl ||
                item.photos[0]?.publicUrl;

              return (
                <Card
                  key={item.id}
                  className="border border-gray-200 bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  {/* Photo or placeholder */}
                  <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {primaryPhoto ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={primaryPhoto}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-500">
                        {item.cropCode.toUpperCase()}
                      </span>
                    )}

                    {/* Grade Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge
                        tone={
                          item.grade === "GRADE_A"
                            ? "green"
                            : item.grade === "GRADE_B"
                              ? "neutral"
                              : "amber"
                        }
                        className="text-xs font-semibold shadow-xs bg-white/95"
                      >
                        {item.grade.replace("_", " ")}
                      </Badge>
                    </div>

                    {/* Availability Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium shadow-xs ${
                          item.availabilityStatus === "AVAILABLE_NOW"
                            ? "bg-green-100 text-green-900 border border-green-200"
                            : "bg-amber-100 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {item.availabilityStatus === "AVAILABLE_NOW"
                          ? "Available Now"
                          : "Upcoming Harvest"}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h2 className="font-bold text-base text-gray-900 line-clamp-1">
                        {item.title}
                      </h2>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-green-800">
                          ₦{item.pricePerUnit.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-600 font-medium">
                          per {item.unitCode}
                        </span>
                        {item.isNegotiable && (
                          <span className="text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded font-medium border border-green-200">
                            Negotiable
                          </span>
                        )}
                      </div>

                      {/* Quantity & Weight */}
                      <div className="flex items-center gap-4 text-xs text-gray-700 pt-1">
                        <span>
                          Qty: <strong>{item.quantity} {item.unitCode}s</strong>
                        </span>
                        {item.estimatedWeightKg > 0 && (
                          <span className="flex items-center gap-1">
                            <Scale className="h-3.5 w-3.5 text-gray-500" />
                            ~{item.estimatedWeightKg.toLocaleString()} kg
                          </span>
                        )}
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 pt-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                        <span className="truncate">
                          {item.community}, {item.lga} LGA, Benue
                        </span>
                      </div>

                      {/* Harvest Date if upcoming */}
                      {item.availabilityStatus === "UPCOMING_HARVEST" && item.harvestDate && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 p-1.5 rounded">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>Ready around: {item.harvestDate}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                      <span>Seller: {item.farmerName || "Verified Farmer"}</span>
                      <span>Min: {item.minOrderQuantity} {item.unitCode}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
