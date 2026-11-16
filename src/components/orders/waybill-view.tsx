"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Truck,
  MapPin,
  Package,
  Phone,
  FileText,
  Clock,
} from "lucide-react";
import { Button, buttonClasses, Badge } from "@/components/ui";
import type { WaybillSummary } from "@/modules/orders/schemas";

export interface WaybillViewProps {
  waybill: WaybillSummary;
}

export function WaybillView({ waybill }: WaybillViewProps) {
  const cropName =
    waybill.cropCode.charAt(0).toUpperCase() + waybill.cropCode.slice(1);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formattedDate = new Date(waybill.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Top navigation & action header (Hidden in print) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href={`/orders/${waybill.orderId}`}
          className={buttonClasses({
            variant: "ghost",
            size: "md",
            className: "inline-flex items-center gap-2",
          })}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Order</span>
        </Link>

        <Button
          onClick={handlePrint}
          variant="primary"
          size="md"
          className="inline-flex items-center gap-2"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          <span>Print / Save Waybill</span>
        </Button>
      </div>

      {/* Printable Waybill Document Card */}
      <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm print:border-none print:p-0 print:shadow-none sm:p-8">
        {/* Document Header */}
        <div className="border-b-2 border-green-800 pb-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-700 text-white font-bold text-lg">
                  T
                </span>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                    TONGRIC AGRICULTURAL LOGISTICS
                  </h1>
                  <p className="text-xs text-gray-700 font-medium">
                    Benue State Food Basket Transit Network &bull; Decentralized Haulage
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block rounded-md bg-green-50 px-3 py-1 font-mono text-sm font-bold text-green-800 border border-green-200">
                {waybill.waybillNumber}
              </span>
              <p className="mt-1 text-xs text-gray-700">
                Order Ref: <span className="font-semibold text-gray-900">{waybill.orderCode}</span>
              </p>
              <p className="text-xs text-gray-700">
                Issued: {formattedDate}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-4 py-2 border border-gray-200">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-green-700" aria-hidden="true" />
              <span className="text-xs font-semibold text-gray-800">
                Corridor: {waybill.corridorRoute || "Direct Agricultural Transit"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700">Transit Status:</span>
              <Badge tone="green" className="font-semibold">
                {(waybill.status || "IN_TRANSIT").replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
        </div>

        {/* 3-Column Logistics Parties Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 border-b border-gray-200 pb-6 md:grid-cols-3">
          {/* 1. Consignor (Farmer) */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-800">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Consignor (Originating Farmer)</span>
            </div>
            <p className="mt-2 text-sm font-bold text-gray-900">
              {waybill.farmerName}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-700">
              <Phone className="h-3 w-3 text-gray-700" aria-hidden="true" />
              <span>{waybill.farmerPhone || "Not specified"}</span>
            </p>
            <div className="mt-2 text-xs text-gray-700">
              <span className="font-semibold text-gray-800">Farm Gate:</span>{" "}
              {waybill.pickupLga} LGA
              {waybill.pickupCommunity ? `, ${waybill.pickupCommunity}` : ""}
            </div>
          </div>

          {/* 2. Authorized Carrier */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-800">
              <Truck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Authorized Haulage Carrier</span>
            </div>
            <p className="mt-2 text-sm font-bold text-gray-900">
              {waybill.transporterName || "Verified Transporter Fleet"}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-700">
              <Phone className="h-3 w-3 text-gray-700" aria-hidden="true" />
              <span>{waybill.transporterPhone || "Carrier dispatch assigned"}</span>
            </p>
            <div className="mt-2 text-xs text-gray-700">
              <span className="font-semibold text-gray-800">Freight Fee:</span>{" "}
              {waybill.estimatedFreightFee != null
                ? `₦${waybill.estimatedFreightFee.toLocaleString("en-US")}`
                : "Included / Direct Arrangement"}
            </div>
          </div>

          {/* 3. Consignee (Buyer) */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-800">
              <Package className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Consignee (Receiving Buyer)</span>
            </div>
            <p className="mt-2 text-sm font-bold text-gray-900">
              {waybill.buyerName}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-700">
              <Phone className="h-3 w-3 text-gray-700" aria-hidden="true" />
              <span>{waybill.buyerPhone || "Not specified"}</span>
            </p>
            <div className="mt-2 text-xs text-gray-700">
              <span className="font-semibold text-gray-800">Dropoff:</span>{" "}
              {waybill.destinationLocation || `${waybill.pickupLga} Hub`}
            </div>
          </div>
        </div>

        {/* Cargo Produce Manifest Table */}
        <div className="mt-6 border-b border-gray-200 pb-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900">
            <FileText className="h-4 w-4 text-green-700" aria-hidden="true" />
            <span>Cargo Manifest & Produce Lot</span>
          </h2>

          <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-700 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-3">Crop / Produce</th>
                  <th scope="col" className="px-4 py-3 text-center">Lot Quantity</th>
                  <th scope="col" className="px-4 py-3 text-center">Unit</th>
                  <th scope="col" className="px-4 py-3 text-right">Est. Weight</th>
                  <th scope="col" className="px-4 py-3 text-right">Declared Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="px-4 py-3.5 font-bold text-gray-900">
                    {cropName}
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-gray-800">
                    {waybill.quantity.toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-3.5 text-center text-gray-700 capitalize">
                    {waybill.unitCode}s
                  </td>
                  <td className="px-4 py-3.5 text-right text-gray-800 font-medium">
                    {waybill.estimatedWeightKg >= 1000
                      ? `${(waybill.estimatedWeightKg / 1000).toFixed(2)} MT (${waybill.estimatedWeightKg.toLocaleString("en-US")} kg)`
                      : `${waybill.estimatedWeightKg.toLocaleString("en-US")} kg`}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-green-800">
                    ₦{waybill.totalAmount.toLocaleString("en-US")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Handover Verification Stamps (Dual PIN Authentication) */}
        <div className="mt-6 border-b border-gray-200 pb-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900">
            <ShieldCheck className="h-4 w-4 text-green-700" aria-hidden="true" />
            <span>Dual Cryptographic Handover Authentication</span>
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Stage 1: Pickup Verification */}
            <div
              className={`rounded-lg border p-4 ${
                waybill.pickupVerifiedAt
                  ? "border-green-300 bg-green-50/60"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Stage 1: Farm-Gate Collection
                </span>
                {waybill.pickupVerifiedAt ? (
                  <span className="inline-flex items-center gap-1 rounded bg-green-700 px-2 py-0.5 text-[11px] font-bold text-white">
                    <CheckCircle2 className="h-3 w-3" />
                    AUTHENTICATED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-yellow-100 px-2 py-0.5 text-[11px] font-bold text-yellow-800">
                    <Clock className="h-3 w-3" />
                    PENDING COLLECTION
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-700">
                {waybill.pickupVerifiedAt ? (
                  <>
                    Authenticated via Farmer 4-digit Pickup PIN on{" "}
                    <span className="font-semibold text-gray-900">
                      {new Date(waybill.pickupVerifiedAt).toLocaleString("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </>
                ) : (
                  "Awaiting driver physical arrival and Farmer Pickup PIN entry at the farm gate."
                )}
              </p>
            </div>

            {/* Stage 2: Delivery Verification */}
            <div
              className={`rounded-lg border p-4 ${
                waybill.deliveryVerifiedAt
                  ? "border-green-300 bg-green-50/60"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Stage 2: Buyer Dropoff Handover
                </span>
                {waybill.deliveryVerifiedAt ? (
                  <span className="inline-flex items-center gap-1 rounded bg-green-700 px-2 py-0.5 text-[11px] font-bold text-white">
                    <CheckCircle2 className="h-3 w-3" />
                    AUTHENTICATED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-gray-200 px-2 py-0.5 text-[11px] font-bold text-gray-700">
                    <Clock className="h-3 w-3" />
                    AWAITING DROPOFF
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-700">
                {waybill.deliveryVerifiedAt ? (
                  <>
                    Authenticated via Buyer 4-digit Delivery PIN on{" "}
                    <span className="font-semibold text-gray-900">
                      {new Date(waybill.deliveryVerifiedAt).toLocaleString("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </>
                ) : (
                  "Awaiting cargo arrival at destination and Buyer Delivery PIN release upon produce inspection."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Section 19 Direct Settlement Legal Notice */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4 border border-gray-200 text-xs text-gray-700 leading-relaxed">
          <p className="font-bold text-gray-900 uppercase tracking-wide">
            Section 19 Platform Non-Custody Notice
          </p>
          <p className="mt-1">
            This digital dispatch waybill acts as a physical haulage manifest and delivery authentication document.
            All agricultural trade transactions on Tongric operate on a direct settlement model between Buyer and Farmer.
            Tongric coordinates logistics routing, carrier matching, and dual PIN verification without receiving, holding,
            or escrowing buyer purchase funds or carrier freight remuneration.
          </p>
        </div>

        {/* Signatures / Physical Verification Block for Paper Printout */}
        <div className="mt-8 hidden pt-4 print:grid grid-cols-3 gap-6 text-center text-xs text-gray-700 border-t border-gray-300">
          <div>
            <div className="mx-auto mb-1 h-12 w-36 border-b border-gray-400"></div>
            <p className="font-semibold text-gray-800">Farmer / Dispatch Gate</p>
            <p className="text-[10px] text-gray-500">Sign &amp; Date</p>
          </div>
          <div>
            <div className="mx-auto mb-1 h-12 w-36 border-b border-gray-400"></div>
            <p className="font-semibold text-gray-800">Assigned Driver / Carrier</p>
            <p className="text-[10px] text-gray-500">Sign &amp; Date</p>
          </div>
          <div>
            <div className="mx-auto mb-1 h-12 w-36 border-b border-gray-400"></div>
            <p className="font-semibold text-gray-800">Receiving Buyer / Agent</p>
            <p className="text-[10px] text-gray-500">Sign &amp; Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}
