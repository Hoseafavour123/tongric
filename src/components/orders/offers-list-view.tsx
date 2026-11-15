"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import { Badge, Card, CardContent, EmptyState, buttonClasses } from "@/components/ui";
import type {
  CommercialOfferSummary,
  OrderSummary,
} from "@/modules/orders/schemas";

export interface OffersListViewProps {
  offers: CommercialOfferSummary[];
  orders?: OrderSummary[];
  currentUserId: string;
}

export function OffersListView({
  offers,
  orders = [],
  currentUserId,
}: OffersListViewProps) {
  const activeOffers = offers.filter(
    (o) =>
      (o.status === "PENDING" || o.status === "COUNTERED") && !o.isExpired,
  );

  const pastOffers = offers.filter(
    (o) =>
      o.status === "ACCEPTED" ||
      o.status === "DECLINED" ||
      o.status === "WITHDRAWN" ||
      o.status === "EXPIRED" ||
      o.isExpired,
  );

  const defaultTab = orders.length > 0 ? "ORDERS" : activeOffers.length > 0 ? "ACTIVE" : "ORDERS";
  const [activeTab, setActiveTab] = useState<"ORDERS" | "ACTIVE" | "PAST">(defaultTab);

  function getStatusTone(
    status: string,
  ): "green" | "neutral" | "amber" | "red" | "blue" {
    switch (status) {
      case "CONFIRMED":
      case "ACCEPTED":
      case "COMPLETED":
        return "green";
      case "COUNTERED":
        return "blue";
      case "PENDING":
        return "amber";
      case "CANCELLED":
      case "DECLINED":
      case "EXPIRED":
      case "WITHDRAWN":
      default:
        return "neutral";
    }
  }

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("ORDERS")}
          className={`min-h-[44px] px-5 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "ORDERS"
              ? "border-green-700 text-green-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Confirmed Orders ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ACTIVE")}
          className={`min-h-[44px] px-5 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "ACTIVE"
              ? "border-green-700 text-green-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Active Negotiations ({activeOffers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PAST")}
          className={`min-h-[44px] px-5 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "PAST"
              ? "border-green-700 text-green-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Past &amp; Closed ({pastOffers.length})
        </button>
      </div>

      {/* Tab: Confirmed Orders */}
      {activeTab === "ORDERS" && (
        <>
          {orders.length === 0 ? (
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-12 text-center">
                <EmptyState
                  title="No confirmed orders yet"
                  description="When an offer is accepted by both buyer and farmer, it transitions to a confirmed order with locked terms and direct settlement."
                  action={
                    <Link
                      href="/market"
                      className={buttonClasses({
                        variant: "primary",
                        className: "min-h-[44px] mt-4",
                      })}
                    >
                      Browse Produce Market
                    </Link>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((item) => {
                const isBuyer = currentUserId === item.buyerId;
                const otherPartyName = isBuyer ? item.farmerName : item.buyerName;

                return (
                  <Link
                    key={item.id}
                    href={`/orders/${item.id}`}
                    className="group block focus:outline-none focus:ring-2 focus:ring-green-600 rounded-lg"
                  >
                    <Card className="border border-gray-200 bg-white overflow-hidden hover:border-green-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
                      <CardContent className="p-5 space-y-3">
                        {/* Top: Code & Status */}
                        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                          <span className="font-mono text-xs font-bold bg-green-50 text-green-900 border border-green-200 px-2 py-0.5 rounded">
                            {item.orderCode}
                          </span>

                          <Badge
                            tone={getStatusTone(item.status)}
                            className="text-xs font-bold"
                          >
                            {item.status.replace(/_/g, " ")}
                          </Badge>
                        </div>

                        {/* Title & Counterparty */}
                        <div>
                          <h3 className="font-extrabold text-base text-gray-900 group-hover:text-green-800 transition-colors line-clamp-1">
                            {item.listingTitle || "Confirmed Commercial Order"}
                          </h3>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {isBuyer ? "Farmer" : "Buyer"}:{" "}
                            <strong>{otherPartyName || "Participant"}</strong>
                          </p>
                        </div>

                        {/* Financial agreed value */}
                        <div className="flex items-baseline justify-between pt-1">
                          <div>
                            <span className="text-xs text-gray-500 block">Agreed Total</span>
                            <span className="text-xl font-extrabold text-green-900">
                              ₦{item.totalAmount.toLocaleString("en-US")}
                            </span>
                          </div>

                          <div className="text-right text-xs text-gray-600">
                            <span>
                              <strong>
                                {item.quantity} {item.unitCode}s
                              </strong>
                            </span>
                            <span className="block text-gray-500">
                              @ ₦{item.unitPrice.toLocaleString("en-US")} / {item.unitCode}
                            </span>
                          </div>
                        </div>

                        {/* Bottom: Fulfillment & CTA */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Truck className="h-3.5 w-3.5 text-gray-400" />
                            <span>{item.fulfillmentMode.replace(/_/g, " ")}</span>
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-green-800 group-hover:underline">
                            <span>View Contract</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Tab: Active Negotiations & Past Offers */}
      {(activeTab === "ACTIVE" || activeTab === "PAST") && (
        <>
          {(activeTab === "ACTIVE" ? activeOffers : pastOffers).length === 0 ? (
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-12 text-center">
                <EmptyState
                  title={
                    activeTab === "ACTIVE"
                      ? "No active purchase negotiations"
                      : "No past offers found"
                  }
                  description={
                    activeTab === "ACTIVE"
                      ? "Explore available crops in the produce market to initiate purchase proposals with Benue farmers."
                      : "Completed, accepted, or expired offers will appear here for your records."
                  }
                  action={
                    activeTab === "ACTIVE" ? (
                      <Link
                        href="/market"
                        className={buttonClasses({
                          variant: "primary",
                          className: "min-h-[44px] mt-4",
                        })}
                      >
                        Browse Produce Market
                      </Link>
                    ) : undefined
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(activeTab === "ACTIVE" ? activeOffers : pastOffers).map((item) => {
                const isBuyer = currentUserId === item.buyerId;
                const otherPartyName = isBuyer ? item.farmerName : item.buyerName;
                const isAwaitingMyAction =
                  (item.status === "PENDING" || item.status === "COUNTERED") &&
                  !item.isExpired &&
                  item.lastActionById !== currentUserId;

                return (
                  <Link
                    key={item.id}
                    href={`/orders/offers/${item.id}`}
                    className="group block focus:outline-none focus:ring-2 focus:ring-green-600 rounded-lg"
                  >
                    <Card className="border border-gray-200 bg-white overflow-hidden hover:border-green-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
                      <CardContent className="p-5 space-y-3">
                        {/* Top Row: Code & Status */}
                        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                          <span className="font-mono text-xs font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                            {item.offerCode}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {isAwaitingMyAction && (
                              <span className="text-[10px] bg-green-100 text-green-900 font-bold px-1.5 py-0.5 rounded border border-green-200">
                                Your Action Needed
                              </span>
                            )}
                            <Badge
                              tone={getStatusTone(item.status)}
                              className="text-xs font-bold"
                            >
                              {item.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </div>

                        {/* Middle: Title & Parties */}
                        <div>
                          <h3 className="font-extrabold text-base text-gray-900 group-hover:text-green-800 transition-colors line-clamp-1">
                            {item.listingTitle || "Produce Offer"}
                          </h3>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {isBuyer ? "Farmer" : "Buyer"}:{" "}
                            <strong>{otherPartyName || "Participant"}</strong>
                          </p>
                        </div>

                        {/* Pricing & Quantity Metrics */}
                        <div className="flex items-baseline justify-between pt-1">
                          <div>
                            <span className="text-xs text-gray-500 block">Offer Total</span>
                            <span className="text-xl font-extrabold text-green-900">
                              ₦{item.totalAmount.toLocaleString("en-US")}
                            </span>
                          </div>

                          <div className="text-right text-xs text-gray-600">
                            <span>
                              <strong>
                                {item.quantity} {item.unitCode}s
                              </strong>
                            </span>
                            <span className="block text-gray-500">
                              @ ₦{item.unitPrice.toLocaleString("en-US")} / {item.unitCode}
                            </span>
                          </div>
                        </div>

                        {/* Bottom row: Fulfillment & Expiry */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                          <span>{item.fulfillmentMode.replace(/_/g, " ")}</span>
                          <span className="flex items-center gap-1 font-semibold text-green-800 group-hover:underline">
                            <span>View Negotiation</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
