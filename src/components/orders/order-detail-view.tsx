"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  AlertTriangle,
  XCircle,
  PackageCheck,
  RefreshCw,
  KeyRound,
  FileText,
  Star,
} from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import {
  Alert,
  Badge,
  Button,
  buttonClasses,
  Card,
  CardContent,
  Dialog,
  Textarea,
  Input,
  FormField,
} from "@/components/ui";
import type { OrderDetailSummary, OrderStatus } from "@/modules/orders/schemas";
import type { CarrierReviewSummary } from "@/modules/transport/schemas";
import { CarrierReviewDialog } from "@/components/transport/carrier-review-dialog";
import { PRODUCE_CROP_CATALOG } from "@/modules/i18n/catalogs";

export interface OrderDetailViewProps {
  order: OrderDetailSummary;
  currentUserId: string;
  currentUserRole?: string;
  initialCarrierReview?: CarrierReviewSummary | null;
}

export function OrderDetailView({
  order: initialOrder,
  currentUserId,
  currentUserRole,
  initialCarrierReview,
}: OrderDetailViewProps) {
  const { t } = useI18n();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetailSummary>(initialOrder);
  const [carrierReview, setCarrierReview] = useState<CarrierReviewSummary | null>(
    initialCarrierReview ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Cancellation modal state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Dispute modal state
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  // Handover PIN verification dialog states
  const [showPickupPinDialog, setShowPickupPinDialog] = useState(false);
  const [pickupPinInput, setPickupPinInput] = useState("");
  const [showDeliveryPinDialog, setShowDeliveryPinDialog] = useState(false);
  const [deliveryPinInput, setDeliveryPinInput] = useState("");

  // Carrier review dialog state
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const isBuyer = currentUserId === order.buyerId;
  const isFarmer = currentUserId === order.farmerId;
  const isAdmin = currentUserRole === "ADMIN";
  const isTransporter =
    currentUserRole === "TRANSPORTER" ||
    (order.transporterId != null && currentUserId === order.transporterId);

  const otherPartyName = isBuyer ? order.farmerName : order.buyerName;
  const otherPartyPhone = isBuyer ? order.farmerPhone : order.buyerPhone;
  const otherPartyRole = isBuyer ? "Farmer (Seller)" : "Buyer (Purchaser)";

  const cropItem = PRODUCE_CROP_CATALOG.find((c) => c.code === order.cropCode);
  const cropLabel = cropItem ? t(cropItem.labelKey) : order.cropCode;

  const canCancel =
    (isBuyer || isFarmer || isAdmin) &&
    (order.status === "CONFIRMED" || order.status === "TRANSPORT_REQUESTED");

  const canDispute =
    (isBuyer || isFarmer || isAdmin) &&
    order.status !== "CANCELLED" &&
    order.status !== "DISPUTED";

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

  function getStatusTone(status: OrderStatus): "green" | "amber" | "red" | "blue" | "neutral" {
    switch (status) {
      case "COMPLETED":
      case "DELIVERED":
      case "COLLECTED":
        return "green";
      case "CONFIRMED":
      case "TRANSPORT_REQUESTED":
      case "TRANSPORT_ASSIGNED":
      case "IN_TRANSIT":
        return "blue";
      case "DISPUTED":
        return "amber";
      case "CANCELLED":
        return "red";
      default:
        return "neutral";
    }
  }

  function getNextStepAdvice(status: OrderStatus, mode: string): string {
    switch (status) {
      case "CONFIRMED":
        if (mode === "BUYER_ARRANGES_PICKUP") {
          return "Call the farmer to confirm farm-gate inspection and vehicle arrival time in Benue.";
        }
        if (mode === "FARMER_ARRANGES_DELIVERY") {
          return "The farmer is preparing produce for transport to your designated dropoff location.";
        }
        return "Carrier request registered. Verified transporters will review route requirements.";
      case "TRANSPORT_REQUESTED":
        return "Platform carrier assignment in progress. Transporters will review cargo specs.";
      case "TRANSPORT_ASSIGNED":
        return "Carrier assigned. Vehicle en route to the farm gate for produce collection.";
      case "COLLECTED":
        return "Produce inspected and collected from farm gate. Transit to destination initiated.";
      case "IN_TRANSIT":
        return "Cargo is actively in transit. Monitor corridor route arrival.";
      case "DELIVERED":
        return "Produce arrived at dropoff point. Buyer inspection and confirmation required.";
      case "COMPLETED":
        return "Trade successfully fulfilled. Direct settlement verified.";
      case "CANCELLED":
        return "Order cancelled. Listing inventory has been restored.";
      case "DISPUTED":
        return "Active dispute recorded. Tongric support officer is mediating the issue.";
      default:
        return "Coordinate directly with counterparty to complete the trade.";
    }
  }

  async function handleStatusTransition(toStatus: OrderStatus, note?: string) {
    setIsSubmitting(true);
    setActionError(null);
    setSuccessBanner(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus, note }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to update order status");
      }

      setOrder(data.data.order);
      setSuccessBanner(`Order status advanced to ${toStatus.replace(/_/g, " ")}.`);
      router.refresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error updating order");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!cancelReason.trim()) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to cancel order");
      }

      setOrder(data.data.order);
      setShowCancelDialog(false);
      setCancelReason("");
      setSuccessBanner(
        `Order cancelled. ${data.data.restoredQuantity} ${order.unitCode}s have been automatically returned to available inventory.`,
      );
      router.refresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error cancelling order");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDisputeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disputeReason }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to report dispute");
      }

      setOrder(data.data.order);
      setShowDisputeDialog(false);
      setDisputeReason("");
      setSuccessBanner("Dispute logged. Tongric platform operator has been alerted.");
      router.refresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error reporting dispute");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyPickupPin(e: React.FormEvent) {
    e.preventDefault();
    if (pickupPinInput.trim().length !== 4) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/verify-pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pickupPinInput.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to verify pickup PIN");
      }

      setOrder(data.data.order);
      setShowPickupPinDialog(false);
      setPickupPinInput("");
      setSuccessBanner("Farm-gate produce collection verified & authenticated!");
      router.refresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error verifying pickup PIN");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyDeliveryPin(e: React.FormEvent) {
    e.preventDefault();
    if (deliveryPinInput.trim().length !== 4) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/verify-delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: deliveryPinInput.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to verify delivery PIN");
      }

      setOrder(data.data.order);
      setShowDeliveryPinDialog(false);
      setDeliveryPinInput("");
      setSuccessBanner("Dropoff delivery verified & authenticated via Buyer PIN!");
      router.refresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error verifying delivery PIN");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top back navigation & Waybill Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-green-800 min-h-[44px] px-2 -ml-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Back to Orders</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href={`/orders/${order.id}/waybill`}
            className={buttonClasses({
              variant: "ghost",
              size: "sm",
              className:
                "inline-flex items-center gap-1.5 text-xs font-semibold text-green-900 border-green-300 hover:bg-green-50 min-h-[44px] px-3",
            })}
          >
            <FileText className="h-4 w-4 text-green-700" />
            <span>Dispatch Waybill</span>
          </Link>

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

      {/* Dynamic Action Alerts */}
      {actionError && (
        <Alert tone="error" title="Action Failed">
          <p className="text-xs text-red-800">{actionError}</p>
        </Alert>
      )}

      {successBanner && (
        <Alert tone="success" title="Success">
          <p className="text-xs text-green-800">{successBanner}</p>
        </Alert>
      )}

      {/* Cancelled Banner */}
      {order.status === "CANCELLED" && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3 text-red-900">
          <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-extrabold text-sm">Order Cancelled Prior to Collection</p>
            {order.cancellationReason && (
              <p className="font-semibold">Reason: {order.cancellationReason}</p>
            )}
            <p className="text-red-700">
              Produce quantity ({order.quantity} {order.unitCode}s) has been safely restored to the
              farmer&apos;s active marketplace listing.
            </p>
          </div>
        </div>
      )}

      {/* Disputed Banner */}
      {order.status === "DISPUTED" && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-3 text-amber-950">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-extrabold text-sm">Under Active Dispute Review</p>
            <p>
              A disagreement has been flagged for administrative review. Both parties will be
              contacted via registered phone to resolve terms.
            </p>
          </div>
        </div>
      )}

      {/* Completed Banner */}
      {order.status === "COMPLETED" && (
        <div className="p-4 bg-green-50 border border-green-300 rounded-lg flex items-start gap-3 text-green-950">
          <PackageCheck className="h-5 w-5 text-green-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-extrabold text-sm">Order Completed &amp; Fulfilled</p>
            <p>
              Produce delivery has been confirmed and verified. Direct settlement completed in
              accordance with Section 19 zero-custody framework.
            </p>
          </div>
        </div>
      )}

      {/* Main Order Header Card */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold bg-green-100 text-green-900 border border-green-200 px-2.5 py-1 rounded">
                  {order.orderCode}
                </span>
                <Badge tone={getStatusTone(order.status)} className="text-xs font-bold">
                  {order.status.replace(/_/g, " ")}
                </Badge>
                {order.isPerishable && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-semibold">
                    Perishable Crop
                  </span>
                )}
                {isAdmin && (
                  <Badge tone="blue" className="text-xs font-bold">
                    Admin Operator
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {order.listingTitle || `${cropLabel} Commercial Order`}
              </h1>
              <p className="text-xs text-gray-500">
                Created on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
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
                {order.quantity} {order.unitCode}s @ ₦{order.unitPrice.toLocaleString("en-US")} /{" "}
                {order.unitCode}
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
          {/* Dual Handover Authentication PIN Card */}
          {order.status !== "CANCELLED" && (
            <Card className="border border-green-300 bg-green-50/40 shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-green-200 pb-2">
                  <h2 className="text-sm font-extrabold text-green-950 uppercase tracking-wide flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-700" />
                    <span>Handover &amp; Dispatch Authentication</span>
                  </h2>
                  <Link
                    href={`/orders/${order.id}/waybill`}
                    className="text-xs font-bold text-green-800 hover:underline flex items-center gap-1"
                  >
                    <span>View Waybill</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Stage 1: Pickup PIN Card (Farmer / Admin / Carrier info) */}
                  <div
                    className={`rounded-lg border p-4 ${
                      order.pickupVerifiedAt
                        ? "border-green-300 bg-white"
                        : "border-green-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-green-900 flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-green-700" />
                        <span>Pickup PIN (Farm Gate)</span>
                      </span>
                      {order.pickupVerifiedAt ? (
                        <Badge tone="green">
                          VERIFIED
                        </Badge>
                      ) : (
                        <Badge tone="amber">
                          PENDING
                        </Badge>
                      )}
                    </div>

                    {/* PIN Display for Farmer or Admin */}
                    {(isFarmer || isAdmin) && order.pickupPin && (
                      <div className="mt-3">
                        <span className="font-mono text-2xl font-black tracking-widest text-green-950 bg-green-100/70 px-3 py-1 rounded border border-green-300 block text-center">
                          {order.pickupPin}
                        </span>
                        <p className="mt-1.5 text-[11px] text-green-900 leading-snug">
                          {order.pickupVerifiedAt ? (
                            <span className="text-green-800 font-semibold">
                              Verified on{" "}
                              {new Date(order.pickupVerifiedAt).toLocaleDateString("en-NG", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          ) : (
                            "Give this 4-digit code to the carrier upon produce inspection and loading at your farm gate."
                          )}
                        </p>
                      </div>
                    )}

                    {/* For Buyer or Carrier when PIN is hidden */}
                    {!(isFarmer || isAdmin) && (
                      <p className="mt-3 text-xs text-gray-700 leading-relaxed">
                        {order.pickupVerifiedAt ? (
                          <span className="text-green-800 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-700" />
                            <span>
                              Authenticated on{" "}
                              {new Date(order.pickupVerifiedAt).toLocaleDateString("en-NG", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </span>
                        ) : isTransporter ? (
                          "Ask the farmer for their 4-digit Pickup PIN upon produce inspection at the farm gate."
                        ) : (
                          "Awaiting carrier physical collection and farmer PIN verification at the farm gate."
                        )}
                      </p>
                    )}
                  </div>

                  {/* Stage 2: Delivery PIN Card (Buyer / Admin / Carrier info) */}
                  <div
                    className={`rounded-lg border p-4 ${
                      order.deliveryVerifiedAt
                        ? "border-green-300 bg-white"
                        : "border-green-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-green-900 flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-green-700" />
                        <span>Delivery PIN (Dropoff)</span>
                      </span>
                      {order.deliveryVerifiedAt ? (
                        <Badge tone="green">
                          VERIFIED
                        </Badge>
                      ) : (
                        <Badge tone="neutral">
                          {order.pickupVerifiedAt ? "IN TRANSIT" : "QUEUED"}
                        </Badge>
                      )}
                    </div>

                    {/* PIN Display for Buyer or Admin */}
                    {(isBuyer || isAdmin) && order.deliveryPin && (
                      <div className="mt-3">
                        <span className="font-mono text-2xl font-black tracking-widest text-green-950 bg-green-100/70 px-3 py-1 rounded border border-green-300 block text-center">
                          {order.deliveryPin}
                        </span>
                        <p className="mt-1.5 text-[11px] text-green-900 leading-snug">
                          {order.deliveryVerifiedAt ? (
                            <span className="text-green-800 font-semibold">
                              Verified on{" "}
                              {new Date(order.deliveryVerifiedAt).toLocaleDateString("en-NG", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          ) : (
                            "Give this 4-digit code to the carrier upon produce arrival and physical dropoff verification."
                          )}
                        </p>
                      </div>
                    )}

                    {/* For Farmer or Carrier when PIN is hidden */}
                    {!(isBuyer || isAdmin) && (
                      <p className="mt-3 text-xs text-gray-700 leading-relaxed">
                        {order.deliveryVerifiedAt ? (
                          <span className="text-green-800 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-700" />
                            <span>
                              Authenticated on{" "}
                              {new Date(order.deliveryVerifiedAt).toLocaleDateString("en-NG", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </span>
                        ) : isTransporter ? (
                          "Obtain the 4-digit Delivery PIN from the buyer upon successful arrival and dropoff."
                        ) : (
                          "Buyer will provide their 4-digit PIN to the driver upon cargo delivery."
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Milestone Action Bar (Dynamic depending on order status and role) */}
          {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
            <Card className="border border-green-300 bg-white shadow-sm">
              <CardContent className="p-5 space-y-3">
                <h2 className="text-sm font-extrabold text-green-950 uppercase tracking-wide flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-green-700" />
                  <span>Order Lifecycle Actions</span>
                </h2>

                <div className="flex flex-wrap gap-3 pt-1">
                  {/* Carrier PIN-Authenticated Collection Button */}
                  {!order.pickupVerifiedAt &&
                    (order.status === "CONFIRMED" ||
                      order.status === "TRANSPORT_ASSIGNED" ||
                      order.status === "TRANSPORT_REQUESTED") &&
                    (isTransporter || isAdmin) && (
                      <Button
                        variant="primary"
                        disabled={isSubmitting}
                        onClick={() => setShowPickupPinDialog(true)}
                        className="min-h-[44px] flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white"
                      >
                        <KeyRound className="h-4 w-4" />
                        <span>Verify Farm-Gate Pickup (Enter PIN)</span>
                      </Button>
                    )}

                  {/* Advance to COLLECTED for Farmer (Direct fulfillment / self-pickup) */}
                  {(order.status === "CONFIRMED" ||
                    order.status === "TRANSPORT_ASSIGNED" ||
                    order.status === "TRANSPORT_REQUESTED") &&
                    !order.pickupVerifiedAt &&
                    (isFarmer || (!isTransporter && isAdmin)) && (
                      <Button
                        variant="primary"
                        disabled={isSubmitting}
                        onClick={() =>
                          handleStatusTransition(
                            "COLLECTED",
                            "Farm-gate produce inspection completed and cargo collected.",
                          )
                        }
                        className="min-h-[44px] flex-1 min-w-[200px]"
                      >
                        Confirm Produce Collected
                      </Button>
                    )}

                  {/* Advance to IN_TRANSIT */}
                  {order.status === "COLLECTED" && (isTransporter || isFarmer || isAdmin) && (
                    <Button
                      variant="primary"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleStatusTransition(
                          "IN_TRANSIT",
                          "Cargo loaded and actively in transit across corridor.",
                        )
                      }
                      className="min-h-[44px] flex-1 min-w-[200px]"
                    >
                      Mark Cargo In Transit
                    </Button>
                  )}

                  {/* Carrier PIN-Authenticated Delivery Handover Button */}
                  {order.pickupVerifiedAt &&
                    !order.deliveryVerifiedAt &&
                    (order.status === "COLLECTED" || order.status === "IN_TRANSIT") &&
                    (isTransporter || isAdmin) && (
                      <Button
                        variant="primary"
                        disabled={isSubmitting}
                        onClick={() => setShowDeliveryPinDialog(true)}
                        className="min-h-[44px] flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white"
                      >
                        <KeyRound className="h-4 w-4" />
                        <span>Verify Delivery Handover (Enter PIN)</span>
                      </Button>
                    )}

                  {/* Advance to DELIVERED (Fallback if non-PIN or manual) */}
                  {(order.status === "COLLECTED" || order.status === "IN_TRANSIT") &&
                    !order.deliveryVerifiedAt &&
                    (isFarmer || isAdmin) && (
                      <Button
                        variant="ghost"
                        disabled={isSubmitting}
                        onClick={() =>
                          handleStatusTransition(
                            "DELIVERED",
                            "Cargo arrived at dropoff destination for buyer handover.",
                          )
                        }
                        className="min-h-[44px] flex-1 min-w-[200px]"
                      >
                        Mark Delivered at Dropoff
                      </Button>
                    )}

                  {/* Confirm COMPLETED (Buyer or Admin) */}
                  {order.status === "DELIVERED" && (isBuyer || isAdmin) && (
                    <Button
                      variant="primary"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleStatusTransition(
                          "COMPLETED",
                          "Buyer verified produce receipt in good condition. Trade concluded.",
                        )
                      }
                      className="min-h-[44px] flex-1 min-w-[200px]"
                    >
                      Confirm Received &amp; Complete Order
                    </Button>
                  )}

                  {/* Pre-Collection Cancel Button */}
                  {canCancel && (
                    <Button
                      variant="ghost"
                      disabled={isSubmitting}
                      onClick={() => setShowCancelDialog(true)}
                      className="min-h-[44px] border-red-300 text-red-700 hover:bg-red-50 hover:text-red-900"
                    >
                      Cancel Order
                    </Button>
                  )}

                  {/* Report Dispute Button */}
                  {canDispute && (
                    <Button
                      variant="ghost"
                      disabled={isSubmitting}
                      onClick={() => setShowDisputeDialog(true)}
                      className="min-h-[44px] border-amber-300 text-amber-800 hover:bg-amber-50 hover:text-amber-950"
                    >
                      Report Dispute
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
                        {order.listingLga} LGA
                        {order.listingCommunity ? `, ${order.listingCommunity}` : ""}
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

          {/* Carrier Performance Review & Ratings (When order is Delivered or Completed with a transporter) */}
          {order.transporterId &&
            (order.status === "DELIVERED" || order.status === "COMPLETED") && (
              <Card className="border border-green-200 bg-white">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-green-700" />
                      <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                        Carrier Haulage Review
                      </h2>
                    </div>
                    {carrierReview ? (
                      <Badge tone="green" className="text-xs font-bold">
                        VERIFIED REVIEW
                      </Badge>
                    ) : (
                      <Badge tone="amber" className="text-xs font-bold">
                        PENDING FEEDBACK
                      </Badge>
                    )}
                  </div>

                  {carrierReview ? (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {order.transporterName || "Assigned Transporter"}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= carrierReview.rating
                                    ? "fill-amber-400 text-amber-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-xs font-black text-gray-800 ml-1">
                              {carrierReview.rating}.0 / 5
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          {new Date(carrierReview.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Performance Indicators */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <div className="p-2.5 bg-green-50/60 rounded border border-green-100 text-xs">
                          <span className="text-[11px] text-gray-500 block">Timeliness</span>
                          <span className="font-extrabold text-green-900">
                            ★ {carrierReview.timelinessScore} / 5
                          </span>
                        </div>
                        <div className="p-2.5 bg-green-50/60 rounded border border-green-100 text-xs">
                          <span className="text-[11px] text-gray-500 block">Cargo Care</span>
                          <span className="font-extrabold text-green-900">
                            ★ {carrierReview.cargoCareScore} / 5
                          </span>
                        </div>
                        <div className="p-2.5 bg-green-50/60 rounded border border-green-100 text-xs">
                          <span className="text-[11px] text-gray-500 block">Communication</span>
                          <span className="font-extrabold text-green-900">
                            ★ {carrierReview.communicationScore} / 5
                          </span>
                        </div>
                      </div>

                      {carrierReview.comment && (
                        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-700 italic">
                          &ldquo;{carrierReview.comment}&rdquo;
                        </div>
                      )}

                      <p className="text-[11px] text-gray-500">
                        Submitted by {carrierReview.reviewerName} ({carrierReview.reviewerRole.replace(/_/g, " ")})
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600">
                        Produce transit has concluded. Provide verified feedback on{" "}
                        <strong>{order.transporterName || "the assigned carrier"}</strong> to build
                        reputation and reliability across the Benue transport corridor.
                      </p>

                      {(isBuyer || isFarmer || isAdmin) && (
                        <Button
                          variant="primary"
                          onClick={() => setShowReviewDialog(true)}
                          className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center gap-2"
                        >
                          <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                          <span>Rate Transporter Haulage</span>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
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
              {getNextStepAdvice(order.status, order.fulfillmentMode)}
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

      {/* Pre-Collection Cancel Order Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        title="Cancel Order (Pre-Collection)"
        description="Cancelling an order before produce is collected releases both parties. Listing inventory will be immediately restored."
      >
        <form onSubmit={handleCancelOrder} className="space-y-4 pt-2">
          <FormField label="Cancellation Reason" required>
            {({ id, describedBy, hasError }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                hasError={hasError}
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Unable to reach collection point, inspection disagreement..."
              />
            )}
          </FormField>

          <p className="text-xs text-gray-500 leading-normal">
            By confirming, {order.quantity} {order.unitCode}s of {cropLabel} will be returned to the
            active market listing.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCancelDialog(false)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={isSubmitting || cancelReason.trim().length < 5}
            >
              {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Report Dispute Dialog */}
      <Dialog
        open={showDisputeDialog}
        onClose={() => setShowDisputeDialog(false)}
        title="Report Order Dispute"
        description="Flag this order for Tongric support intervention. An operator will review the transaction and contact both participants."
      >
        <form onSubmit={handleDisputeOrder} className="space-y-4 pt-2">
          <FormField label="Dispute Details &amp; Concerns" required>
            {({ id, describedBy, hasError }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                hasError={hasError}
                rows={4}
                required
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe the discrepancy (e.g. quantity mismatch, quality dispute, transit delay)..."
              />
            )}
          </FormField>

          <p className="text-xs text-amber-900 leading-normal bg-amber-50 p-2.5 rounded border border-amber-200">
            Filing a dispute pauses standard fulfillment milestones while mediation occurs.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDisputeDialog(false)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || disputeReason.trim().length < 5}
              className="bg-amber-700 hover:bg-amber-800 focus:ring-amber-600 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Dispute"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Verify Pickup PIN Dialog (Farm Gate) */}
      <Dialog
        open={showPickupPinDialog}
        onClose={() => setShowPickupPinDialog(false)}
        title="Authenticate Farm-Gate Collection"
        description="Enter the 4-digit Pickup PIN provided by the farmer upon physical inspection and loading at the farm gate."
      >
        <form onSubmit={handleVerifyPickupPin} className="space-y-4 pt-2">
          <FormField label="4-Digit Pickup PIN" required>
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                hasError={hasError}
                type="text"
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]{4}"
                required
                autoFocus
                value={pickupPinInput}
                onChange={(e) => setPickupPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="e.g. 4829"
                className="text-center font-mono text-2xl tracking-widest font-black"
              />
            )}
          </FormField>

          <p className="text-xs text-green-900 bg-green-50 p-2.5 rounded border border-green-200">
            Entering the verified PIN certifies produce possession and advances the order to COLLECTED.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPickupPinDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || pickupPinInput.trim().length !== 4}
              className="bg-green-700 hover:bg-green-800 text-white"
            >
              {isSubmitting ? "Authenticating..." : "Authenticate Pickup"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Verify Delivery PIN Dialog (Dropoff) */}
      <Dialog
        open={showDeliveryPinDialog}
        onClose={() => setShowDeliveryPinDialog(false)}
        title="Authenticate Delivery Handover"
        description="Enter the 4-digit Delivery PIN provided by the buyer upon cargo arrival and dropoff verification."
      >
        <form onSubmit={handleVerifyDeliveryPin} className="space-y-4 pt-2">
          <FormField label="4-Digit Delivery PIN" required>
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                hasError={hasError}
                type="text"
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]{4}"
                required
                autoFocus
                value={deliveryPinInput}
                onChange={(e) => setDeliveryPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="e.g. 7193"
                className="text-center font-mono text-2xl tracking-widest font-black"
              />
            )}
          </FormField>

          <p className="text-xs text-green-900 bg-green-50 p-2.5 rounded border border-green-200">
            Entering the buyer&apos;s PIN confirms physical dropoff and concludes transit across the corridor.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeliveryPinDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || deliveryPinInput.trim().length !== 4}
              className="bg-green-700 hover:bg-green-800 text-white"
            >
              {isSubmitting ? "Authenticating..." : "Authenticate Delivery"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Carrier Review Dialog */}
      {showReviewDialog && order.transporterId && (
        <CarrierReviewDialog
          open={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          orderId={order.id}
          orderCode={order.orderCode}
          transporterName={order.transporterName || "Assigned Transporter"}
          onSuccess={(newReview) => {
            setCarrierReview(newReview);
            setSuccessBanner(
              "Thank you! Your verified carrier review has been recorded.",
            );
          }}
        />
      )}
    </div>
  );
}
