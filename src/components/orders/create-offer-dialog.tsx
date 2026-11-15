"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Scale,
  X,
} from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Alert, Button, Card, CardContent } from "@/components/ui";
import { resilientFetch } from "@/lib/resilient-fetch";
import type { ProduceListingSummary } from "@/modules/marketplace";
import type { CommercialOfferDetailSummary, FulfillmentMode } from "@/modules/orders/schemas";
import { PRODUCE_CROP_CATALOG, estimateWeightKg } from "@/modules/i18n/catalogs";

export interface CreateOfferDialogProps {
  listing: ProduceListingSummary;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (offer: CommercialOfferDetailSummary) => void;
}

export function CreateOfferDialog({
  listing,
  isOpen,
  onClose,
  onSuccess,
}: CreateOfferDialogProps) {
  const router = useRouter();
  const { t } = useI18n();

  const [quantity, setQuantity] = useState<number>(listing.minOrderQuantity || 1);
  const [unitPrice, setUnitPrice] = useState<number>(listing.pricePerUnit);
  const [fulfillmentMode, setFulfillmentMode] =
    useState<FulfillmentMode>("BUYER_ARRANGES_PICKUP");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [proposedCollectionDate, setProposedCollectionDate] = useState("");
  const [note, setNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const cropItem = PRODUCE_CROP_CATALOG.find((c) => c.code === listing.cropCode);
  const isPerishable = cropItem?.isPerishable ?? false;

  const totalAmount = Math.max(0, quantity) * Math.max(0, unitPrice);
  const estimatedWeight = estimateWeightKg(quantity, listing.unitCode);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (quantity < listing.minOrderQuantity) {
      setErrorMessage(
        `Quantity cannot be less than the minimum order quantity of ${listing.minOrderQuantity} ${listing.unitCode}s`,
      );
      return;
    }

    if (quantity > listing.quantity) {
      setErrorMessage(
        `Quantity cannot exceed available stock of ${listing.quantity} ${listing.unitCode}s`,
      );
      return;
    }

    if (unitPrice <= 0) {
      setErrorMessage("Proposed unit price must be greater than ₦0");
      return;
    }

    if (
      (fulfillmentMode === "FARMER_ARRANGES_DELIVERY" ||
        fulfillmentMode === "TONGRIC_LOGISTICS_REQUEST") &&
      !destinationLocation.trim()
    ) {
      setErrorMessage("Please specify the delivery / destination location");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      listingId: listing.id,
      quantity,
      unitPrice,
      fulfillmentMode,
      destinationLocation: destinationLocation.trim() || null,
      proposedCollectionDate: proposedCollectionDate || null,
      note: note.trim() || null,
    };

    const res = await resilientFetch<{ offer: CommercialOfferDetailSummary }>(
      "/api/offers",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    setIsSubmitting(false);

    if (!res.ok) {
      setErrorMessage(res.error.message || "Failed to submit purchase offer");
      return;
    }

    onClose();
    if (onSuccess) {
      onSuccess(res.data.offer);
    } else {
      router.push(`/orders/offers/${res.data.offer.id}`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-offer-title"
        className="bg-white rounded-lg max-w-lg w-full p-6 space-y-5 border border-gray-200 shadow-xl my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 id="create-offer-title" className="text-xl font-extrabold text-gray-900">
              {t("orders.offer.title")}
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Propose purchase terms for <strong>{listing.title}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center text-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <Alert tone="error" title="Submission Error">
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Quantity & Unit Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="offer-qty" className="font-semibold text-gray-700 block">
                Quantity ({listing.unitCode}s)
              </label>
              <input
                id="offer-qty"
                type="number"
                min={listing.minOrderQuantity}
                max={listing.quantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="min-h-[44px] w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <span className="text-[11px] text-gray-500 block">
                Min: {listing.minOrderQuantity} | Available: {listing.quantity}
              </span>
            </div>

            <div className="space-y-1">
              <label htmlFor="offer-price" className="font-semibold text-gray-700 block">
                Proposed Unit Price (₦)
              </label>
              <input
                id="offer-price"
                type="number"
                min="1"
                step="100"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                required
                className="min-h-[44px] w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <span className="text-[11px] text-gray-500 block">
                Listing Price: ₦{listing.pricePerUnit.toLocaleString("en-US")}
                {listing.isNegotiable ? " (Negotiable)" : " (Fixed)"}
              </span>
            </div>
          </div>

          {/* Financial Value Summary Card */}
          <Card className="border border-green-200 bg-green-50/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase">
                  {t("orders.offer.totalAmount")}
                </span>
                <span className="text-2xl font-extrabold text-green-900">
                  ₦{totalAmount.toLocaleString("en-US")}
                </span>
              </div>
              {estimatedWeight !== null && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 pt-1 border-t border-green-200/60">
                  <Scale className="h-3.5 w-3.5 text-gray-500" />
                  <span>
                    Est. batch weight: ~{estimatedWeight.toLocaleString("en-US")} kg
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fulfillment & Logistics Radios */}
          <div className="space-y-2">
            <span className="font-semibold text-gray-700 block">
              {t("orders.offer.fulfillment")}
            </span>

            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-600 cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="fulfillmentMode"
                  value="BUYER_ARRANGES_PICKUP"
                  checked={fulfillmentMode === "BUYER_ARRANGES_PICKUP"}
                  onChange={() => setFulfillmentMode("BUYER_ARRANGES_PICKUP")}
                  className="mt-1 text-green-700 focus:ring-green-600 h-4 w-4"
                />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 block">
                    Farm-gate Collection (Buyer picks up)
                  </span>
                  <span className="text-gray-600">
                    Buyer arranges own vehicle to {listing.community}, {listing.lga} LGA.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-600 cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="fulfillmentMode"
                  value="FARMER_ARRANGES_DELIVERY"
                  checked={fulfillmentMode === "FARMER_ARRANGES_DELIVERY"}
                  onChange={() => setFulfillmentMode("FARMER_ARRANGES_DELIVERY")}
                  className="mt-1 text-green-700 focus:ring-green-600 h-4 w-4"
                />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 block">
                    Farmer Arranges Delivery
                  </span>
                  <span className="text-gray-600">
                    Farmer coordinates delivery to buyer&apos;s specified destination.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-600 cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="fulfillmentMode"
                  value="TONGRIC_LOGISTICS_REQUEST"
                  checked={fulfillmentMode === "TONGRIC_LOGISTICS_REQUEST"}
                  onChange={() => setFulfillmentMode("TONGRIC_LOGISTICS_REQUEST")}
                  className="mt-1 text-green-700 focus:ring-green-600 h-4 w-4"
                />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 block">
                    Request Tongric Logistics Carrier
                  </span>
                  <span className="text-gray-600">
                    Request competitive quotes from verified Benue transport providers.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Destination if delivery or platform carrier requested */}
          {fulfillmentMode !== "BUYER_ARRANGES_PICKUP" && (
            <div className="space-y-1">
              <label
                htmlFor="destination-loc"
                className="font-semibold text-gray-700 block"
              >
                {t("orders.offer.destination")}
              </label>
              <input
                id="destination-loc"
                type="text"
                placeholder="e.g. Makurdi Modern Market or Warehouse Address"
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                required
                className="min-h-[44px] w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          )}

          {/* Collection Date */}
          <div className="space-y-1">
            <label
              htmlFor="collection-date"
              className="font-semibold text-gray-700 block"
            >
              {t("orders.offer.collectionDate")}
            </label>
            <input
              id="collection-date"
              type="date"
              value={proposedCollectionDate}
              onChange={(e) => setProposedCollectionDate(e.target.value)}
              className="min-h-[44px] w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Optional Message */}
          <div className="space-y-1">
            <label htmlFor="offer-note" className="font-semibold text-gray-700 block">
              {t("orders.offer.note")}
            </label>
            <textarea
              id="offer-note"
              rows={2}
              placeholder="e.g. Can load on Saturday morning; payment on inspection."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
            />
          </div>

          {/* Expiration Banner */}
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900">
            <Clock className="h-4 w-4 shrink-0 text-amber-700" />
            <span>
              {isPerishable
                ? "This offer expires in 24 hours (perishable produce) if not accepted."
                : "This offer expires in 72 hours (staple crop) if not accepted."}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[44px]"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="min-h-[44px] px-6"
            >
              {isSubmitting ? "Submitting..." : t("orders.offer.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
