"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  ShieldCheck,
  MapPin,
  Scale,
  Calendar,
  Check,
  Building2,
  Tag,
} from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Badge, buttonClasses, Card, CardContent } from "@/components/ui";
import { LowDataImage } from "@/components/ui/low-data-image";
import type { ProduceListingSummary } from "@/modules/marketplace";
import { PRODUCE_CROP_CATALOG } from "@/modules/i18n/catalogs";
import { CreateOfferDialog } from "@/components/orders/create-offer-dialog";
import { getCropVisual } from "@/lib/crop-visuals";

export interface ListingDetailViewProps {
  listing: ProduceListingSummary;
  currentUserId?: string | null;
  currentUserRole?: string | null;
}

export function ListingDetailView({
  listing,
  currentUserId,
  currentUserRole,
}: ListingDetailViewProps) {
  const { t } = useI18n();

  const allPhotos =
    listing.photos && listing.photos.length > 0
      ? listing.photos
      : listing.primaryPhotoUrl
        ? [{ id: "primary", publicUrl: listing.primaryPhotoUrl, isPrimary: true }]
        : [];

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showEnquiryDialog, setShowEnquiryDialog] = useState(false);

  const activePhoto = allPhotos[selectedPhotoIndex] ?? null;

  const cropItem = PRODUCE_CROP_CATALOG.find((c) => c.code === listing.cropCode);
  const isPerishable = cropItem?.isPerishable ?? false;

  const isOwnerOrAdmin = Boolean(
    (currentUserId && currentUserId === listing.farmerId) ||
      currentUserRole === "ADMIN",
  );

  const isVerified = listing.farmerVerificationStatus === "VERIFIED";

  return (
    <div className="space-y-6">
      {/* Back to Marketplace Breadcrumb */}
      <div>
        <Link
          href="/market"
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-900 transition-colors min-h-[44px] py-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("marketplace.detail.backToMarket")}</span>
        </Link>
      </div>

      {/* Main Grid: Left Photos, Right Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="w-full aspect-4/3 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative flex items-center justify-center">
            {activePhoto ? (
              <LowDataImage
                src={activePhoto.publicUrl}
                alt={listing.title}
                className="w-full h-full"
                imgClassName="w-full h-full object-cover"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={getCropVisual(listing.cropCode).localPath}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  const visual = getCropVisual(listing.cropCode);
                  if (target.src.endsWith(".jpg") || target.src.endsWith(".png")) {
                    target.src = visual.remoteFallback;
                  } else {
                    target.src = visual.svgFallback;
                  }
                }}
              />
            )}

            {/* Quality Grade Overlay */}
            <div className="absolute top-3 left-3">
              <Badge
                tone={
                  listing.grade === "GRADE_A"
                    ? "green"
                    : listing.grade === "GRADE_B"
                      ? "neutral"
                      : "amber"
                }
                className="text-xs font-bold shadow-xs bg-white/95"
              >
                {listing.grade.replace("_", " ")}
              </Badge>
            </div>

            {/* Availability Overlay */}
            <div className="absolute top-3 right-3">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold shadow-xs ${
                  listing.availabilityStatus === "AVAILABLE_NOW"
                    ? "bg-green-100 text-green-900 border border-green-200"
                    : "bg-amber-100 text-amber-900 border border-amber-200"
                }`}
              >
                {listing.availabilityStatus === "AVAILABLE_NOW"
                  ? "Available Now"
                  : "Upcoming Harvest"}
              </span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {allPhotos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {allPhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative h-16 w-16 shrink-0 rounded-md overflow-hidden border-2 transition-all min-h-[44px] min-w-[44px] ${
                    selectedPhotoIndex === idx
                      ? "border-green-700 ring-2 ring-green-600/30"
                      : "border-gray-200 hover:border-gray-300 opacity-80"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.publicUrl}
                    alt={`${listing.title} thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Quick Notice on Inspection */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-gray-800">
              <Check className="h-4 w-4 text-green-700 shrink-0" />
              <span>Inspection & Collection</span>
            </div>
            <p>
              Buyers or authorized logistics partners may inspect produce in{" "}
              <strong>{listing.lga} LGA</strong> prior to loading and collection.
            </p>
          </div>
        </div>

        {/* Right Column: Specifications & Commercial Action (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Title & Tags */}
          <div className="space-y-2 border-b border-gray-200 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {isPerishable && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  {t("marketplace.detail.perishable")}
                </span>
              )}
              <span className="text-xs text-gray-500 font-medium">
                Crop ID: {listing.cropCode}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {listing.title}
            </h1>

            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-green-700 shrink-0" />
              <span>
                {listing.community}, <strong>{listing.lga} LGA</strong>, Benue State
              </span>
            </div>
          </div>

          {/* Price & Weight Commercial Card */}
          <Card className="border border-green-200 bg-green-50/40">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-green-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Unit Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-green-800">
                      ₦{listing.pricePerUnit.toLocaleString("en-US")}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      per {listing.unitCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    tone={listing.isNegotiable ? "green" : "neutral"}
                    className="text-xs font-bold"
                  >
                    {listing.isNegotiable
                      ? t("marketplace.listing.negotiable")
                      : t("marketplace.listing.fixed")}
                  </Badge>
                </div>
              </div>

              {/* Commercial Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1 text-sm">
                <div>
                  <span className="text-xs text-gray-600 block">Total Quantity</span>
                  <span className="font-extrabold text-gray-900 text-base">
                    {listing.quantity.toLocaleString("en-US")} {listing.unitCode}s
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-600 block">Minimum Order (MOQ)</span>
                  <span className="font-extrabold text-gray-900 text-base">
                    {listing.minOrderQuantity} {listing.unitCode}s
                  </span>
                </div>

                {listing.estimatedWeightKg > 0 && (
                  <div>
                    <span className="text-xs text-gray-600 block flex items-center gap-1">
                      <Scale className="h-3.5 w-3.5 text-gray-500" />
                      Est. Total Weight
                    </span>
                    <span className="font-extrabold text-gray-900 text-base">
                      ~{listing.estimatedWeightKg.toLocaleString("en-US")} kg
                    </span>
                  </div>
                )}
              </div>

              {/* Harvest Schedule Note if upcoming */}
              {listing.availabilityStatus === "UPCOMING_HARVEST" &&
                listing.harvestDate && (
                  <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-100/70 p-2.5 rounded-md border border-amber-200">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>
                      <strong>Harvest Date:</strong> Scheduled for collection around{" "}
                      <strong>{listing.harvestDate}</strong>.
                    </span>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Farmer & Origin Card */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-5 space-y-3">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                {t("marketplace.detail.sellerInfo")}
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-gray-900">
                      {listing.farmerName || "Benue Agricultural Farmer"}
                    </span>
                    {isVerified ? (
                      <Badge tone="green" className="text-xs flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>{t("marketplace.detail.verifiedSeller")}</span>
                      </Badge>
                    ) : (
                      <Badge tone="amber" className="text-xs">
                        {t("marketplace.detail.unverifiedSeller")}
                      </Badge>
                    )}
                  </div>

                  {listing.cooperativeName && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Building2 className="h-3.5 w-3.5 text-gray-500" />
                      <span>
                        {t("marketplace.detail.cooperative")}:{" "}
                        <strong>{listing.cooperativeName}</strong>
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Operating in {listing.lga} LGA, Benue State
                  </div>
                </div>

                {/* Direct Phone Number display */}
                {listing.farmerPhone && (
                  <div className="text-xs bg-gray-50 p-2 rounded border border-gray-200 sm:text-right">
                    <span className="text-gray-500 block">Contact Phone:</span>
                    <span className="font-mono font-bold text-gray-900">
                      {listing.farmerPhone}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description & Harvest Details */}
          {listing.description && (
            <div className="space-y-2">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                Quality & Batch Notes
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {listing.description}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 space-y-3">
            {isOwnerOrAdmin ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-green-900">
                  <Check className="h-4 w-4" />
                  <span>This is your produce listing</span>
                </div>
                <p className="text-xs text-green-800">
                  You are actively selling this produce on the Tongric marketplace.
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Primary CTA: Make Offer / Start Purchase */}
                <button
                  type="button"
                  onClick={() => setShowEnquiryDialog(true)}
                  className={buttonClasses({
                    variant: "primary",
                    className:
                      "min-h-[48px] px-6 text-base font-bold flex-1 flex items-center justify-center gap-2",
                  })}
                >
                  <Tag className="h-5 w-5" />
                  <span>{t("marketplace.detail.makeOffer")}</span>
                </button>

                {/* Secondary CTA: Direct Phone Call */}
                {listing.farmerPhone && (
                  <a
                    href={`tel:${listing.farmerPhone}`}
                    className={buttonClasses({
                      variant: "secondary",
                      className:
                        "min-h-[48px] px-6 text-base font-bold flex items-center justify-center gap-2 border-gray-300",
                    })}
                  >
                    <Phone className="h-5 w-5 text-green-700" />
                    <span>{t("marketplace.detail.callFarmer")}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Commercial Purchase Offer Dialog */}
      <CreateOfferDialog
        listing={listing}
        isOpen={showEnquiryDialog}
        onClose={() => setShowEnquiryDialog(false)}
      />
    </div>
  );
}
