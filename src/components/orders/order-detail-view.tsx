"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Phone,
  ShieldCheck,
  MapPin,
  Calendar,
  Scale,
  Truck,
  ExternalLink,
} from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Alert, Badge, buttonClasses, Card, CardContent } from "@/components/ui";
import type { OrderDetailSummary } from "@/modules/orders/schemas";
import { PRODUCE_CROP_CATALOG } from "@/modules/i18n/catalogs";

export interface OrderDetailViewProps {
  order: OrderDetailSummary;
  currentUserId: string;
  currentUserRole?: string;
}

export function OrderDetailView({
  order,
  currentUserId,
  currentUserRole,
}: OrderDetailViewProps) {
  const { t } = useI18n();

  const isBuyer = currentUserId === order.buyerId;
  const otherPartyName = isBuyer ? order.farmerName : order.buyerName;
  const otherPartyPhone = isBuyer ? order.farmerPhone : order.buyerPhone;
  const otherPartyRole = isBuyer ? "Farmer (Seller)" : "Buyer (Purchaser)";

  const cropItem = PRODUCE_CROP_CATALOG.find((c) => c.code === order.cropCode);
  const cropLabel = cropItem ? t(cropItem.labelKey) : order.cropCode;

  function getFulfillmentLabel(mode: string): string {
    switch (mode) {
      case "BUYER_ARRANGES_PICKUP":
        return "Farm-gate Collection (Buyer Pickup)";
      case "FARMER_ARRANGES_DELIVERY":
        return "Farmer Arranges Delivery";
      case "TONGRIC_LOGISTICS_REQUEST":
        return "Tongric Logistics Carrier Request";
      default:
        return mode.replace(/_/g, " ");
    }
  }

  function getNextStepAdvice(mode: string): string {
    switch (mode) {
      case "BUYER_ARRANGES_PICKUP":
        return "Call the farmer to confirm the farm-gate inspection and vehicle arrival time in Benue.";
      case "FARMER_ARRANGES_DELIVERY":
        return "The farmer will arrange transportation to your specified dropoff location.";
      case "TONGRIC_LOGISTICS_REQUEST":
        return "Carrier quote request is registered. Verified transporters will review route requirements.";
      default:
        return "Coordinate directly with counterparty to complete the trade.";
    }
  }

  return (
    <div className="space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-green-800 min-h-[44px] px-2 -ml-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Back to Orders</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/orders/offers/${order.offerId}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-green-800 hover:underline min-h-[44px] px-2"
          >
            <span>View Offer Thread</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <Link
            href={`/market/${order.listingId}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-green-800 hover:underline min-h-[44px] px-2"
          >
            <span>View Produce Listing</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Order Header Card */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold bg-green-100 text-green-900 border border-green-200 px-2.5 py-1 rounded">
                  {order.orderCode}
                </span>
                <Badge tone="green" className="text-xs font-bold">
                  {order.status}
                </Badge>
                {order.isPerishable && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-semibold">
                    Perishable Crop
                  </span>
                )}
                {currentUserRole === "ADMIN" && (
                  <Badge tone="blue" className="text-xs font-bold">
                    Admin Observer
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {order.listingTitle || `${cropLabel} Commercial Order`}
              </h1>
              <p className="text-xs text-gray-500">
                Created on {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Agreed Financial Value */}
            <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
              <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">
                Agreed Total Value
              </span>
              <span className="text-3xl font-black text-green-900 block">
                ₦{order.totalAmount.toLocaleString("en-US")}
              </span>
              <span className="text-xs text-gray-600 block">
                {order.quantity} {order.unitCode}s @ ₦{order.unitPrice.toLocaleString("en-US")} / {order.unitCode}
              </span>
            </div>
          </div>

          {/* Section 19 Direct Settlement Disclosure Callout */}
          <Alert
            tone="info"
            title="Direct Settlement Disclosure (Section 19)"
            className="border-green-200 bg-green-50/60"
          >
            <div className="flex items-start gap-2.5 text-xs text-green-950 mt-1">
              <ShieldCheck className="h-4 w-4 text-green-700 shrink-0 mt-0.5" />
              <span>
                Payment is settled directly between Buyer and Farmer upon physical produce inspection
                at the collection point. Tongric provides commercial terms locking and coordination, but
                holds zero customer funds and operates no escrow in Release 1.
              </span>
            </div>
          </Alert>
        </CardContent>
      </Card>

      {/* Grid: Details & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Commercial & Logistics Specs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Commercial Specifications Card */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
                Agreed Commercial Terms
              </h2>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-500 block">Produce Crop</span>
                  <span className="font-extrabold text-gray-900">{cropLabel}</span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block">Quantity &amp; Packaging</span>
                  <span className="font-extrabold text-gray-900">
                    {order.quantity} {order.unitCode}s
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block">Agreed Unit Price</span>
                  <span className="font-bold text-gray-900">
                    ₦{order.unitPrice.toLocaleString("en-US")} / {order.unitCode}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block">Estimated Weight</span>
                  <span className="font-bold text-gray-900 flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-gray-400" />
                    <span>~{order.estimatedWeightKg.toLocaleString("en-US")} kg</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fulfillment & Logistics Card */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-2">
                <Truck className="h-4 w-4 text-green-700" />
                <span>Logistics &amp; Delivery Method</span>
              </h2>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-gray-500 block">Fulfillment Responsibility</span>
                  <span className="font-bold text-gray-900">
                    {getFulfillmentLabel(order.fulfillmentMode)}
                  </span>
                </div>

                {order.destinationLocation && (
                  <div className="flex items-start gap-2 pt-1 border-t border-gray-100">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-gray-500 block">Destination / Dropoff</span>
                      <span className="font-semibold text-gray-900">{order.destinationLocation}</span>
                    </div>
                  </div>
                )}

                {order.listingLga && (
                  <div className="flex items-start gap-2 pt-1 border-t border-gray-100">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-gray-500 block">Farm Location</span>
                      <span className="font-semibold text-gray-900">
                        {order.listingLga} LGA{order.listingCommunity ? `, ${order.listingCommunity}` : ""}
                      </span>
                    </div>
                  </div>
                )}

                {order.proposedCollectionDate && (
                  <div className="flex items-start gap-2 pt-1 border-t border-gray-100">
                    <Calendar className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-gray-500 block">Agreed Date</span>
                      <span className="font-bold text-gray-900">{order.proposedCollectionDate}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Counterparty Contact Card */}
          <div className="p-5 bg-white border border-gray-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-gray-500 block">{otherPartyRole}</span>
              <span className="text-base font-extrabold text-gray-900">
                {otherPartyName || "Participant"}
              </span>
              {otherPartyPhone && (
                <span className="text-xs text-gray-600 block mt-0.5 font-mono">
                  {otherPartyPhone}
                </span>
              )}
            </div>

            {otherPartyPhone && (
              <a
                href={`tel:${otherPartyPhone}`}
                className={buttonClasses({
                  variant: "primary",
                  className: "min-h-[44px] px-5 inline-flex items-center gap-2 shrink-0 justify-center",
                })}
              >
                <Phone className="h-4 w-4" />
                <span>Call {isBuyer ? "Farmer" : "Buyer"}</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Milestones & Next Step Advice (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Next Action Box */}
          <div className="p-5 bg-green-50/70 border border-green-200 rounded-lg space-y-2">
            <h3 className="text-sm font-extrabold text-green-950 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-700 shrink-0" />
              <span>Next Operational Step</span>
            </h3>
            <p className="text-xs text-green-900 leading-relaxed">
              {getNextStepAdvice(order.fulfillmentMode)}
            </p>
          </div>

          {/* Timeline & Milestones Stepper */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
                Order Timeline
              </h2>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-green-600">
                {order.statusEvents.map((evt) => (
                  <div key={evt.id} className="relative space-y-1 text-xs">
                    <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-green-700 border-2 border-white shadow-sm" />
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-extrabold text-gray-900 uppercase">
                        {evt.toStatus.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(evt.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {evt.note && <p className="text-gray-700">{evt.note}</p>}
                    {evt.changedByName && (
                      <p className="text-[11px] text-gray-500">Actor: {evt.changedByName}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
