"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  Plus,
  Search,
  MapPin,
  ChevronRight,
  Package,
  Layers,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  buttonClasses,
  Input,
  Select,
} from "@/components/ui";
import { ExchangeListingSummary } from "@/modules/barter/schemas.ts";
import { BENUE_LGAS } from "@/modules/i18n/catalogs.ts";
import { useAuth } from "@/components/auth/auth-provider.tsx";

interface BarterFeedViewProps {
  initialListings: ExchangeListingSummary[];
}

export function BarterFeedView({ initialListings }: BarterFeedViewProps) {
  const { user } = useAuth();
  const [listings, setListings] = useState<ExchangeListingSummary[]>(initialListings);
  const [search, setSearch] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFilter() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedLga) params.set("locationLga", selectedLga);
      if (selectedType) params.set("itemType", selectedType);

      const res = await fetch(`/api/barter/listings?${params.toString()}`);
      if (res.ok) {
        const body = await res.json();
        setListings(body.data ?? []);
      }
    } catch {
      // Keep existing listings on error
    } finally {
      setLoading(false);
    }
  }

  const isFarmer = user?.role === "FARMER" || user?.role === "ADMIN";

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Produce Barter Exchange
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Cash-free commodity trading and fair-ratio crop swaps across Benue farming communities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Barter calculator button hidden for now per user request */}

          {isFarmer && (
            <Link
              href="/exchange/new"
              className={buttonClasses({
                variant: "primary",
                className: "min-h-[44px] flex items-center gap-2",
              })}
            >
              <Plus className="h-4 w-4" />
              <span>Post Barter Listing</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search crops, seeds, tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                className="min-h-[44px] bg-white text-sm"
              />
            </div>

            <div>
              <Select
                value={selectedLga}
                onChange={(e) => setSelectedLga(e.target.value)}
                className="min-h-[44px] bg-white text-sm"
              >
                <option value="">All Benue LGAs</option>
                {BENUE_LGAS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.code}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex gap-2">
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="min-h-[44px] flex-1 bg-white text-sm"
              >
                <option value="">All Item Types</option>
                <option value="CROP">Harvest Produce</option>
                <option value="SEED">Seeds & Seedlings</option>
                <option value="TOOL">Farm Tools</option>
                <option value="EQUIPMENT">Equipment</option>
              </Select>

              <Button
                variant="primary"
                onClick={handleFilter}
                disabled={loading}
                className="min-h-[44px] px-4"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Available Barter Listings ({listings.length})
          </h2>
          <span className="text-xs text-gray-500">Sorted by recent post</span>
        </div>

        {listings.length === 0 ? (
          <Card className="border-dashed border-gray-300 bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
              <ArrowLeftRight className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-gray-900">No Barter Listings Found</h3>
            <p className="mt-1 text-sm text-gray-600">
              {search || selectedLga || selectedType
                ? "Try adjusting your search filters to find available commodity swaps."
                : "Be the first farmer to post what agricultural goods you have for barter!"}
            </p>
            {isFarmer && (
              <div className="mt-4">
                <Link
                  href="/exchange/new"
                  className={buttonClasses({ variant: "primary", className: "min-h-[44px]" })}
                >
                  Post First Barter Listing
                </Link>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {listings.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col justify-between border-gray-200 bg-white transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={item.status === "OPEN" ? "green" : item.status === "COMPLETED" ? "neutral" : "amber"}>
                          {item.status}
                        </Badge>
                        <Badge tone="neutral">
                          {item.offeredItemType}
                        </Badge>
                      </div>
                      <CardTitle className="text-base text-gray-900 sm:text-lg">
                        {item.offeredTitle}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      <span>{item.locationLga}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-1">
                  {/* Offered vs Desired comparison */}
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-xs">
                    <div className="space-y-1 border-r border-gray-200 pr-2">
                      <div className="font-semibold text-green-800 flex items-center gap-1">
                        <Package className="h-3.5 w-3.5 text-green-700" />
                        <span>Offering</span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        {item.offeredQty} {item.offeredUnit}
                      </p>
                      <p className="text-gray-600 line-clamp-2">
                        {item.offeredDescription}
                      </p>
                    </div>

                    <div className="space-y-1 pl-2">
                      <div className="font-semibold text-amber-800 flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-amber-700" />
                        <span>Wants In Return</span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        {item.desiredQty ? `${item.desiredQty} ${item.desiredUnit ?? ""}` : "Open to proposals"}
                      </p>
                      <p className="text-gray-600 line-clamp-2">
                        {item.desiredDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                    <span className="text-gray-600">
                      Posted by <strong>{item.ownerFarmerName}</strong>
                    </span>
                    <span className="text-gray-500">
                      {item.offersCount} {item.offersCount === 1 ? "offer" : "offers"}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed"
                  >
                    <span>View Listing &amp; Swap Offers</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

