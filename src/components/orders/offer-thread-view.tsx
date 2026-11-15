"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Phone,
} from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Alert, Badge, Button, Card, CardContent } from "@/components/ui";
import { resilientFetch } from "@/lib/resilient-fetch";
import type { CommercialOfferDetailSummary } from "@/modules/orders/schemas";

export interface OfferThreadViewProps {
  offer: CommercialOfferDetailSummary;
  currentUserId: string;
  currentUserRole: string;
}

export function OfferThreadView({
  offer: initialOffer,
  currentUserId,
  currentUserRole,
}: OfferThreadViewProps) {
  const router = useRouter();
  const { t } = useI18n();

  const [offer, setOffer] = useState<CommercialOfferDetailSummary>(initialOffer);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterQty, setCounterQty] = useState(offer.quantity);
  const [counterPrice, setCounterPrice] = useState(offer.unitPrice);
  const [counterNote, setCounterNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isProposer = currentUserId === offer.lastActionById;
  const isBuyer = currentUserId === offer.buyerId;

  const otherPartyName = isBuyer ? offer.farmerName : offer.buyerName;
  const otherPartyPhone = isBuyer ? offer.farmerPhone : offer.buyerPhone;

  const isActionable =
    (offer.status === "PENDING" || offer.status === "COUNTERED") &&
    !offer.isExpired;

  async function handleRespond(
    action: "ACCEPT" | "DECLINE" | "WITHDRAW" | "COUNTER",
  ) {
    setErrorMessage(null);
    setIsSubmitting(true);

    const payload: {
      action: string;
      proposedQuantity?: number;
      proposedUnitPrice?: number;
      note?: string;
    } = { action };

    if (action === "COUNTER") {
      payload.proposedQuantity = counterQty;
      payload.proposedUnitPrice = counterPrice;
      payload.note = counterNote.trim() || undefined;
    }

    const res = await resilientFetch<{
      offer: CommercialOfferDetailSummary;
      orderId?: string;
    }>(
      `/api/offers/${offer.id}/respond`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    setIsSubmitting(false);

    if (!res.ok) {
      setErrorMessage(res.error.message || `Failed to ${action.toLowerCase()} offer`);
      return;
    }

    if (action === "ACCEPT" && res.data.orderId) {
      router.push(`/orders/${res.data.orderId}`);
      return;
    }

    setOffer(res.data.offer);
    setShowCounterModal(false);
    router.refresh();
  }

  function getStatusTone(status: string): "green" | "neutral" | "amber" | "red" | "blue" {
    switch (status) {
      case "ACCEPTED":
        return "green";
      case "COUNTERED":
        return "blue";
      case "PENDING":
        return "amber";
      case "DECLINED":
      case "EXPIRED":
      case "WITHDRAWN":
      default:
        return "neutral";
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-900 transition-colors min-h-[44px] py-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
              {offer.offerCode}
            </span>
            <Badge tone={getStatusTone(offer.status)} className="text-xs font-bold">
              {offer.status.replace("_", " ")}
            </Badge>
            {offer.isPerishable && (
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

          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">
            {offer.listingTitle || "Commercial Produce Offer"}
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Negotiation between <strong>{offer.buyerName}</strong> (Buyer) and{" "}
            <strong>{offer.farmerName}</strong> (Farmer)
          </p>
        </div>

        {/* Counter Round Badge */}
        <div className="text-right self-start sm:self-auto">
          <span className="text-xs text-gray-500 block">Negotiation Round</span>
          <span className="text-sm font-extrabold text-gray-800">
            {offer.counterRoundCount} / 3 rounds used
          </span>
        </div>
      </div>

      {errorMessage && (
        <Alert tone="error" title="Action Failed">
          {errorMessage}
        </Alert>
      )}

      {/* Expiration or Final State Banner */}
      {offer.status === "ACCEPTED" ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-900">
          <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0" />
          <div>
            <span className="font-bold text-sm block">Offer Terms Agreed!</span>
            <span className="text-xs text-green-800">
              Contract terms are locked. Direct payment and pickup/delivery may now
              proceed.
            </span>
          </div>
        </div>
      ) : offer.isExpired ? (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3 text-gray-700">
          <Clock className="h-5 w-5 text-gray-500 shrink-0" />
          <div>
            <span className="font-bold text-sm block">Offer Expired</span>
            <span className="text-xs text-gray-600">
              The response window has elapsed. You can initiate a fresh offer on the
              marketplace.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-900">
          <Clock className="h-4 w-4 text-amber-700 shrink-0" />
          <span>
            Response window open. Expires around{" "}
            <strong>{new Date(offer.expiresAt).toLocaleString("en-US")}</strong>.
          </span>
        </div>
      )}

      {/* Two Column Layout: Terms & Action vs Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Terms Summary & Action Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-green-200 bg-green-50/40">
            <CardContent className="p-5 space-y-4">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide block border-b border-green-100 pb-2">
                Current Proposed Terms
              </span>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-600 block">Unit Price</span>
                  <span className="text-2xl font-extrabold text-green-900">
                    ₦{offer.unitPrice.toLocaleString("en-US")}
                  </span>
                  <span className="text-xs text-gray-600"> per {offer.unitCode}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-600 block">Total Offer Value</span>
                  <span className="text-2xl font-extrabold text-green-900">
                    ₦{offer.totalAmount.toLocaleString("en-US")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-green-100">
                <div>
                  <span className="text-gray-500 block">Quantity</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {offer.quantity.toLocaleString("en-US")} {offer.unitCode}s
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 block">Fulfillment</span>
                  <span className="font-bold text-gray-900">
                    {offer.fulfillmentMode.replace(/_/g, " ")}
                  </span>
                </div>

                {offer.destinationLocation && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block">Destination</span>
                    <span className="font-semibold text-gray-900">
                      {offer.destinationLocation}
                    </span>
                  </div>
                )}

                {offer.proposedCollectionDate && (
                  <div>
                    <span className="text-gray-500 block">Proposed Date</span>
                    <span className="font-bold text-gray-900">
                      {offer.proposedCollectionDate}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Other Party Card */}
          {otherPartyPhone && (
            <div className="p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block">
                  {isBuyer ? "Farmer" : "Buyer"}:
                </span>
                <span className="font-bold text-sm text-gray-900">
                  {otherPartyName}
                </span>
              </div>
              <a
                href={`tel:${otherPartyPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-xs font-semibold text-gray-800 min-h-[44px]"
              >
                <Phone className="h-3.5 w-3.5 text-green-700" />
                <span>Call {otherPartyPhone}</span>
              </a>
            </div>
          )}

          {/* Action CTAs for Parties */}
          {isActionable && (
            <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-3 shadow-2xs">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wide block">
                Negotiation Actions
              </span>

              {isProposer ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    You submitted the current terms. Awaiting response from{" "}
                    <strong>{otherPartyName}</strong>.
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRespond("WITHDRAW")}
                    disabled={isSubmitting}
                    className="min-h-[44px] w-full text-amber-800 hover:bg-amber-50"
                  >
                    Withdraw My Offer
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => handleRespond("ACCEPT")}
                    disabled={isSubmitting}
                    className="min-h-[44px] w-full flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t("orders.offer.accept")}</span>
                  </Button>

                  {offer.counterRoundCount < 3 ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowCounterModal(true)}
                      disabled={isSubmitting}
                      className="min-h-[44px] w-full flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>{t("orders.offer.counter")}</span>
                    </Button>
                  ) : (
                    <div className="p-2 text-xs bg-amber-50 text-amber-900 rounded border border-amber-200 text-center font-medium">
                      Maximum 3 counter rounds reached. Please accept or decline.
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRespond("DECLINE")}
                    disabled={isSubmitting}
                    className="min-h-[44px] w-full text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>{t("orders.offer.decline")}</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Negotiation History Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-4">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
              Negotiation Trail
            </h2>

            <div className="space-y-4">
              {offer.messages.map((msg) => {
                const isMsgSender = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg border text-sm space-y-2 ${
                      isMsgSender
                        ? "bg-green-50/50 border-green-200 ml-2"
                        : "bg-gray-50 border-gray-200 mr-2"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-gray-600 border-b border-gray-200/60 pb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <span>{msg.senderName || "Participant"}</span>
                        <span className="text-[11px] font-normal text-gray-500">
                          ({msg.senderRole || "Member"})
                        </span>
                      </div>
                      <span>{new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        tone={
                          msg.action === "ACCEPT"
                            ? "green"
                            : msg.action === "DECLINE"
                              ? "red"
                              : msg.action === "COUNTER"
                                ? "blue"
                                : "neutral"
                        }
                        className="text-xs font-bold"
                      >
                        {msg.action === "INITIATE"
                          ? "Initial Offer"
                          : msg.action === "COUNTER"
                            ? "Counter-Proposal"
                            : msg.action}
                      </Badge>

                      {msg.proposedUnitPrice !== null && (
                        <span className="text-xs font-bold text-gray-900">
                          ₦{msg.proposedUnitPrice.toLocaleString("en-US")} / {offer.unitCode}
                        </span>
                      )}

                      {msg.proposedQuantity !== null && (
                        <span className="text-xs text-gray-600">
                          Qty: <strong>{msg.proposedQuantity} {offer.unitCode}s</strong>
                        </span>
                      )}
                    </div>

                    {msg.note && (
                      <p className="text-xs text-gray-700 whitespace-pre-line pt-1">
                        &ldquo;{msg.note}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Counter-Offer Modal */}
      {showCounterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="counter-dialog-title"
            className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-gray-200 shadow-xl"
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-2">
              <h3 id="counter-dialog-title" className="text-lg font-bold text-gray-900">
                Propose Counter-Offer
              </h3>
              <button
                type="button"
                onClick={() => setShowCounterModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <label htmlFor="counter-qty" className="font-semibold text-gray-700 block text-xs">
                  Counter Quantity ({offer.unitCode}s)
                </label>
                <input
                  id="counter-qty"
                  type="number"
                  min={offer.listingMinOrderQuantity}
                  max={offer.listingQuantity}
                  value={counterQty}
                  onChange={(e) => setCounterQty(Number(e.target.value))}
                  className="min-h-[44px] w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="counter-price" className="font-semibold text-gray-700 block text-xs">
                  Counter Unit Price (₦)
                </label>
                <input
                  id="counter-price"
                  type="number"
                  min="1"
                  step="100"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value))}
                  className="min-h-[44px] w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs flex justify-between">
                <span className="text-gray-600">Calculated Counter Total:</span>
                <span className="font-extrabold text-green-900 text-sm">
                  ₦{(counterQty * counterPrice).toLocaleString("en-US")}
                </span>
              </div>

              <div className="space-y-1">
                <label htmlFor="counter-note-input" className="font-semibold text-gray-700 block text-xs">
                  Note to {otherPartyName} (Optional)
                </label>
                <textarea
                  id="counter-note-input"
                  rows={2}
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder="e.g. Best price considering packaging cost."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCounterModal(false)}
                  disabled={isSubmitting}
                  className="min-h-[44px]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleRespond("COUNTER")}
                  disabled={isSubmitting}
                  className="min-h-[44px] px-6"
                >
                  {isSubmitting ? "Submitting..." : "Send Counter-Offer"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
