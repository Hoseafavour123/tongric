import Link from "next/link";
import {
  Badge,
  buttonClasses,
  Card,
  CardContent,
  EmptyState,
} from "@/components/ui";
import { Plus, MapPin, Calendar, Scale, ShieldCheck } from "lucide-react";
import {
  listActiveListings,
  produceGradeEnum,
  availabilityStatusEnum,
  type ProduceGrade,
  type AvailabilityStatus,
  type ListingSortOption,
} from "@/modules/marketplace";
import { getServerSession } from "@/modules/auth/guards";
import { ProduceFilterBar } from "@/components/marketplace/produce-filter-bar";
import { LowDataImage } from "@/components/ui/low-data-image";

export const dynamic = "force-dynamic";

interface MarketPageProps {
  searchParams: Promise<{
    crop?: string;
    lga?: string;
    grade?: string;
    availability?: string;
    sort?: string;
  }>;
}

export default async function MarketPage({ searchParams }: MarketPageProps) {
  const resolvedParams = await searchParams;

  const cropCode = resolvedParams.crop || undefined;
  const lga = resolvedParams.lga || undefined;

  let grade: ProduceGrade | undefined;
  if (resolvedParams.grade) {
    const parsed = produceGradeEnum.safeParse(resolvedParams.grade);
    if (parsed.success) grade = parsed.data;
  }

  let availabilityStatus: AvailabilityStatus | undefined;
  if (resolvedParams.availability) {
    const parsed = availabilityStatusEnum.safeParse(resolvedParams.availability);
    if (parsed.success) availabilityStatus = parsed.data;
  }

  const sortBy = (resolvedParams.sort as ListingSortOption) || "newest";

  const [session, listings] = await Promise.all([
    getServerSession().catch(() => null),
    listActiveListings({
      cropCode,
      lga,
      grade,
      availabilityStatus,
      sortBy,
    }).catch(() => []),
  ]);

  const isFarmerOrAdmin =
    session?.user.role === "FARMER" || session?.user.role === "ADMIN";

  const hasActiveFilters = Boolean(
    cropCode || lga || grade || availabilityStatus || (sortBy && sortBy !== "newest"),
  );

  return (
    <div className="space-y-6">
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

        {/* Structured Filter Bar */}
        <ProduceFilterBar
          initialFilters={{
            crop: cropCode,
            lga,
            grade,
            availability: availabilityStatus,
            sort: sortBy,
          }}
        />

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs font-semibold text-gray-600 px-1">
          <span>
            Showing <strong>{listings.length}</strong> produce{" "}
            {listings.length === 1 ? "listing" : "listings"}
            {hasActiveFilters ? " matching your filters" : ""}
          </span>
          {hasActiveFilters && (
            <Link
              href="/market"
              className="text-green-800 hover:text-green-900 underline"
            >
              Clear filters
            </Link>
          )}
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-12 text-center">
              <EmptyState
                title={
                  hasActiveFilters
                    ? "No produce listings match your filters"
                    : "No produce listings available"
                }
                description={
                  hasActiveFilters
                    ? "Try adjusting your crop category, LGA location, or quality grade filters."
                    : "Check back soon or list your harvest to start selling to verified commercial buyers."
                }
                action={
                  hasActiveFilters ? (
                    <Link
                      href="/market"
                      className={buttonClasses({
                        variant: "secondary",
                        className: "min-h-[44px] mt-4",
                      })}
                    >
                      Reset All Filters
                    </Link>
                  ) : isFarmerOrAdmin ? (
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

              const isVerified = item.farmerVerificationStatus === "VERIFIED";

              return (
                <Link
                  key={item.id}
                  href={`/market/${item.id}`}
                  className="group block focus:outline-none focus:ring-2 focus:ring-green-600 rounded-lg"
                >
                  <Card className="border border-gray-200 bg-white overflow-hidden flex flex-col h-full group-hover:border-green-600 group-hover:shadow-md transition-all">
                    {/* Photo or placeholder */}
                    <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {primaryPhoto ? (
                        <LowDataImage
                          src={primaryPhoto}
                          alt={item.title}
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover group-hover:scale-102 transition-transform duration-200"
                        />
                      ) : (
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                          {item.cropCode}
                        </span>
                      )}

                      {/* Grade Badge */}
                      <div className="absolute top-2 left-2 pointer-events-none">
                        <Badge
                          tone={
                            item.grade === "GRADE_A"
                              ? "green"
                              : item.grade === "GRADE_B"
                                ? "neutral"
                                : "amber"
                          }
                          className="text-xs font-bold shadow-xs bg-white/95"
                        >
                          {item.grade.replace("_", " ")}
                        </Badge>
                      </div>

                      {/* Availability Badge */}
                      <div className="absolute top-2 right-2 pointer-events-none">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold shadow-xs ${
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
                        <h2 className="font-bold text-base text-gray-900 line-clamp-1 group-hover:text-green-800 transition-colors">
                          {item.title}
                        </h2>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-extrabold text-green-800">
                            ₦{item.pricePerUnit.toLocaleString("en-US")}
                          </span>
                          <span className="text-xs text-gray-600 font-semibold">
                            per {item.unitCode}
                          </span>
                          {item.isNegotiable && (
                            <span className="text-[11px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded font-medium border border-green-200">
                              Negotiable
                            </span>
                          )}
                        </div>

                        {/* Quantity & Weight */}
                        <div className="flex items-center gap-4 text-xs text-gray-700 pt-1">
                          <span>
                            Qty: <strong>{item.quantity.toLocaleString("en-US")} {item.unitCode}s</strong>
                          </span>
                          {item.estimatedWeightKg > 0 && (
                            <span className="flex items-center gap-1">
                              <Scale className="h-3.5 w-3.5 text-gray-500" />
                              ~{item.estimatedWeightKg.toLocaleString("en-US")} kg
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
                        {item.availabilityStatus === "UPCOMING_HARVEST" &&
                          item.harvestDate && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 p-1.5 rounded">
                              <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                              <span>Ready around: {item.harvestDate}</span>
                            </div>
                          )}
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[120px]">
                            {item.farmerName || "Farmer"}
                          </span>
                          {isVerified && (
                            <span title="Verified Farmer" className="inline-flex">
                              <ShieldCheck
                                className="h-3.5 w-3.5 text-green-700 shrink-0"
                                aria-hidden="true"
                              />
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-gray-500">
                          MOQ: {item.minOrderQuantity} {item.unitCode}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
  );
}
