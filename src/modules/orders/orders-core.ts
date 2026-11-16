import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import type { OrdersRepository, OrderAuditInput, OrdersFilterOptions } from "./orders-repo.ts";
import {
  createOfferSchema,
  respondOfferSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  disputeOrderSchema,
  verifyPickupPinSchema,
  verifyDeliveryPinSchema,
  type CommercialOfferSummary,
  type CommercialOfferDetailSummary,
  type OfferStatus,
  type OrderStatus,
  type OrderSummary,
  type OrderDetailSummary,
  type WaybillSummary,
} from "./schemas.ts";

export interface RespondOfferResult {
  offer: CommercialOfferDetailSummary;
  order?: OrderDetailSummary;
  autoDeclinedOfferIds?: string[];
}
import { PRODUCE_CROP_CATALOG } from "@/modules/i18n/catalogs";

export interface OrderActor {
  id: string;
  role: string;
}

export interface OrderAuditContext {
  ipAddress?: string | null;
}

function generateOfferCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `OFF-${year}${month}-${randomSuffix}`;
}

export async function createOfferWithRepo(
  repo: OrdersRepository,
  actor: OrderActor,
  rawInput: unknown,
  auditContext?: OrderAuditContext,
): Promise<CommercialOfferDetailSummary> {
  const parsed = createOfferSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ValidationError(firstIssue?.message ?? "Invalid offer details");
  }

  const input = parsed.data;

  const listing = await repo.getListingForOffer(input.listingId);
  if (!listing) {
    throw new NotFoundError("Produce listing not found");
  }

  if (listing.status !== "ACTIVE") {
    throw new ValidationError("This produce listing is no longer active");
  }

  if (actor.id === listing.farmerId) {
    throw new ForbiddenError("You cannot make a purchase offer on your own listing");
  }

  if (input.quantity < listing.minOrderQuantity) {
    throw new ValidationError(
      `Quantity must be at least ${listing.minOrderQuantity} ${listing.unitCode}s (minimum order quantity)`,
    );
  }

  if (input.quantity > listing.quantity) {
    throw new ValidationError(
      `Quantity cannot exceed available stock of ${listing.quantity} ${listing.unitCode}s`,
    );
  }

  const cropItem = PRODUCE_CROP_CATALOG.find((c) => c.code === listing.cropCode);
  const isPerishable = cropItem?.isPerishable ?? false;

  // 24 hours for perishables, 72 hours for staples
  const expiryHours = isPerishable ? 24 : 72;
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

  const totalAmount = Math.round(input.quantity * input.unitPrice * 100) / 100;
  const offerCode = generateOfferCode();

  const proposedCollectionDateObj = input.proposedCollectionDate
    ? new Date(input.proposedCollectionDate)
    : null;

  const offer = await repo.createOffer({
    ...input,
    offerCode,
    buyerId: actor.id,
    farmerId: listing.farmerId,
    unitCode: listing.unitCode,
    totalAmount,
    expiresAt,
    proposedCollectionDateObj,
  });

  const auditEntry: OrderAuditInput = {
    actorUserId: actor.id,
    action: "OFFER_INITIATED",
    entityType: "CommercialOffer",
    entityId: offer.id,
    metadata: {
      offerCode,
      listingId: listing.id,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      totalAmount,
      fulfillmentMode: input.fulfillmentMode,
      expiresAt: expiresAt.toISOString(),
      isPerishable,
    },
    ipAddress: auditContext?.ipAddress,
  };
  await repo.recordOrderAudit(auditEntry);

  return offer;
}

export async function getOfferWithRepo(
  repo: OrdersRepository,
  actor: OrderActor,
  offerId: string,
): Promise<CommercialOfferDetailSummary> {
  const offer = await repo.getOfferById(offerId);
  if (!offer) {
    throw new NotFoundError("Offer not found");
  }

  const isParty =
    actor.id === offer.buyerId ||
    actor.id === offer.farmerId ||
    actor.role === "ADMIN";

  if (!isParty) {
    throw new ForbiddenError("You do not have permission to view this offer");
  }

  return offer;
}

export async function listUserOffersWithRepo(
  repo: OrdersRepository,
  actor: OrderActor,
  filter?: OrdersFilterOptions,
): Promise<CommercialOfferSummary[]> {
  return repo.listOffersByUser(actor.id, filter);
}

export async function respondToOfferWithRepo(
  repo: OrdersRepository,
  actor: OrderActor,
  offerId: string,
  rawInput: unknown,
  auditContext?: OrderAuditContext,
): Promise<RespondOfferResult> {
  const parsed = respondOfferSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ValidationError(firstIssue?.message ?? "Invalid offer response");
  }

  const input = parsed.data;

  const offer = await repo.getOfferById(offerId);
  if (!offer) {
    throw new NotFoundError("Offer not found");
  }

  const isParty =
    actor.id === offer.buyerId ||
    actor.id === offer.farmerId ||
    actor.role === "ADMIN";

  if (!isParty) {
    throw new ForbiddenError("You do not have permission to respond to this offer");
  }

  if (offer.isExpired) {
    throw new ValidationError("This offer has expired and can no longer be updated");
  }

  if (
    offer.status === "ACCEPTED" ||
    offer.status === "DECLINED" ||
    offer.status === "WITHDRAWN" ||
    offer.status === "EXPIRED"
  ) {
    throw new ValidationError(`This offer is already finalized (${offer.status})`);
  }

  const isProposer = actor.id === offer.lastActionById;

  let newStatus: OfferStatus;
  let incrementCounterRound = false;
  let newQuantity: number | undefined;
  let newUnitPrice: number | undefined;
  let newTotalAmount: number | undefined;

  switch (input.action) {
    case "WITHDRAW": {
      if (!isProposer && actor.role !== "ADMIN") {
        throw new ForbiddenError("Only the party who made the current proposal can withdraw it");
      }
      newStatus = "WITHDRAWN";
      break;
    }

    case "ACCEPT": {
      if (isProposer && actor.role !== "ADMIN") {
        throw new ForbiddenError(
          "You cannot accept your own proposal. Awaiting response from other party.",
        );
      }
      newStatus = "ACCEPTED";
      break;
    }

    case "DECLINE": {
      if (isProposer && actor.role !== "ADMIN") {
        throw new ForbiddenError(
          "You cannot decline your own proposal. You can withdraw it instead.",
        );
      }
      newStatus = "DECLINED";
      break;
    }

    case "COUNTER": {
      if (isProposer && actor.role !== "ADMIN") {
        throw new ForbiddenError(
          "You cannot counter your own proposal. Awaiting response from other party.",
        );
      }

      if (offer.counterRoundCount >= 3) {
        throw new ValidationError(
          "Maximum counter-offer rounds (3) reached. Please accept or decline the offer.",
        );
      }

      newQuantity = input.proposedQuantity ?? offer.quantity;
      newUnitPrice = input.proposedUnitPrice ?? offer.unitPrice;

      if (newQuantity < offer.listingMinOrderQuantity) {
        throw new ValidationError(
          `Counter quantity cannot be lower than the minimum order quantity (${offer.listingMinOrderQuantity})`,
        );
      }

      if (newQuantity > offer.listingQuantity) {
        throw new ValidationError(
          `Counter quantity cannot exceed available stock (${offer.listingQuantity})`,
        );
      }

      newTotalAmount = Math.round(newQuantity * newUnitPrice * 100) / 100;
      newStatus = "COUNTERED";
      incrementCounterRound = true;
      break;
    }
  }

  if (input.action === "ACCEPT") {
    const { order, autoDeclinedOfferIds } = await repo.createOrderFromAcceptedOffer(
      offer.id,
      actor.id,
    );

    const freshOffer = (await repo.getOfferById(offer.id)) ?? {
      ...offer,
      status: "ACCEPTED" as OfferStatus,
    };

    return {
      offer: freshOffer,
      order,
      autoDeclinedOfferIds,
    };
  }

  const updatedOffer = await repo.respondToOffer(offer.id, {
    ...input,
    actorUserId: actor.id,
    actorRole: actor.role,
    newStatus,
    newQuantity,
    newUnitPrice,
    newTotalAmount,
    incrementCounterRound,
  });

  const auditEntry: OrderAuditInput = {
    actorUserId: actor.id,
    action: `OFFER_${input.action}`,
    entityType: "CommercialOffer",
    entityId: offer.id,
    metadata: {
      offerCode: offer.offerCode,
      action: input.action,
      newStatus,
      newQuantity,
      newUnitPrice,
      newTotalAmount,
      counterRoundCount: updatedOffer.counterRoundCount,
    },
    ipAddress: auditContext?.ipAddress,
  };
  await repo.recordOrderAudit(auditEntry);

  return { offer: updatedOffer };
}

export async function getOrderWithRepo(
  repo: OrdersRepository,
  actor: OrderActor,
  orderId: string,
): Promise<OrderDetailSummary> {
  const order = await repo.getOrderById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (
    actor.role !== "ADMIN" &&
    actor.id !== order.farmerId &&
    actor.id !== order.buyerId
  ) {
    throw new ForbiddenError("You do not have permission to view this order");
  }

  return order;
}

export async function listOrdersWithRepo(
  repo: OrdersRepository,
  actor: OrderActor,
  filter?: OrdersFilterOptions,
): Promise<OrderSummary[]> {
  return repo.listOrdersByUser(actor.id, filter);
}

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CONFIRMED: ["TRANSPORT_REQUESTED", "COLLECTED", "CANCELLED", "DISPUTED"],
  TRANSPORT_REQUESTED: ["TRANSPORT_ASSIGNED", "COLLECTED", "CANCELLED", "DISPUTED"],
  TRANSPORT_ASSIGNED: ["COLLECTED", "DISPUTED"],
  COLLECTED: ["IN_TRANSIT", "DELIVERED", "DISPUTED"],
  IN_TRANSIT: ["DELIVERED", "DISPUTED"],
  DELIVERED: ["COMPLETED", "DISPUTED"],
  COMPLETED: ["DISPUTED"],
  CANCELLED: [],
  DISPUTED: [
    "CONFIRMED",
    "TRANSPORT_REQUESTED",
    "TRANSPORT_ASSIGNED",
    "COLLECTED",
    "IN_TRANSIT",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
  ],
};

export async function updateOrderStatusWithRepo(
  repo: OrdersRepository,
  actor: OrderActor,
  orderId: string,
  rawInput: unknown,
): Promise<OrderDetailSummary> {
  const parsed = updateOrderStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ValidationError(firstIssue?.message ?? "Invalid status update details");
  }

  const order = await repo.getOrderById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const isAdmin = actor.role === "ADMIN";
  const isParty = actor.id === order.buyerId || actor.id === order.farmerId;
  const isTransporter = actor.role === "TRANSPORTER";

  if (!isAdmin && !isParty && !isTransporter) {
    throw new ForbiddenError("You are not authorized to update this order");
  }

  const { toStatus, note } = parsed.data;

  if (order.status === toStatus) {
    throw new ValidationError(`Order is already in status ${toStatus}`);
  }

  if (order.status === "CANCELLED") {
    throw new ValidationError("Cancelled orders cannot undergo status transitions");
  }

  if (order.status === "COMPLETED" && toStatus !== "DISPUTED") {
    throw new ValidationError("Completed orders cannot undergo status transitions");
  }

  if (order.status === "DISPUTED" && !isAdmin) {
    throw new ForbiddenError("Only administrators can resolve a disputed order");
  }

  const allowedNext = ALLOWED_STATUS_TRANSITIONS[order.status] ?? [];
  if (!isAdmin && !allowedNext.includes(toStatus)) {
    throw new ValidationError(
      `Cannot transition order from ${order.status} to ${toStatus}`,
    );
  }

  if (toStatus === "COMPLETED" && actor.id !== order.buyerId && !isAdmin) {
    throw new ForbiddenError(
      "Only the buyer or an administrator can confirm delivery and mark order completed",
    );
  }

  return repo.updateOrderStatus(orderId, toStatus, actor.id, note);
}

export async function cancelOrderWithRepo(
  repo: OrdersRepository,
  actor: OrderActor,
  orderId: string,
  rawInput: unknown,
): Promise<{
  order: OrderDetailSummary;
  restoredQuantity: number;
  listingReactivated: boolean;
}> {
  const parsed = cancelOrderSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ValidationError(firstIssue?.message ?? "Invalid cancellation details");
  }

  const order = await repo.getOrderById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const isAdmin = actor.role === "ADMIN";
  const isParty = actor.id === order.buyerId || actor.id === order.farmerId;

  if (!isAdmin && !isParty) {
    throw new ForbiddenError("You are not authorized to cancel this order");
  }

  if (order.status === "CANCELLED") {
    throw new ValidationError("Order is already cancelled");
  }

  if (order.status === "COMPLETED") {
    throw new ValidationError(
      "Completed orders cannot be cancelled. Please contact support or report a dispute.",
    );
  }

  if (order.status === "DISPUTED" && !isAdmin) {
    throw new ForbiddenError(
      "Only administrators can cancel an order under active dispute",
    );
  }

  // Pre-collection cancellation restriction: once produce is collected, transit is active
  if (
    order.status === "COLLECTED" ||
    order.status === "IN_TRANSIT" ||
    order.status === "DELIVERED"
  ) {
    throw new ValidationError(
      "Orders cannot be cancelled once produce has been collected or dispatched. Please report a dispute instead.",
    );
  }

  return repo.cancelOrder(orderId, parsed.data.reason, actor.id);
}

export async function disputeOrderWithRepo(
  repo: OrdersRepository,
  actor: OrderActor,
  orderId: string,
  rawInput: unknown,
): Promise<OrderDetailSummary> {
  const parsed = disputeOrderSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ValidationError(firstIssue?.message ?? "Invalid dispute details");
  }

  const order = await repo.getOrderById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const isAdmin = actor.role === "ADMIN";
  const isParty = actor.id === order.buyerId || actor.id === order.farmerId;

  if (!isAdmin && !isParty) {
    throw new ForbiddenError("You are not authorized to report a dispute on this order");
  }

  if (order.status === "DISPUTED") {
    throw new ValidationError("This order is already under active dispute review");
  }

  if (order.status === "CANCELLED") {
    throw new ValidationError("Cancelled orders cannot be disputed");
  }

  return repo.disputeOrder(orderId, parsed.data.reason, actor.id);
}

export async function verifyPickupPinWithRepo(
  repo: OrdersRepository,
  actor: OrderActor,
  orderId: string,
  rawInput: unknown,
): Promise<OrderDetailSummary> {
  const parsed = verifyPickupPinSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ValidationError(firstIssue?.message ?? "Invalid pickup PIN format");
  }

  const order = await repo.getOrderById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const isAdmin = actor.role === "ADMIN";
  const isAuthorizedCarrierOrBuyer = order.transporterId
    ? actor.id === order.transporterId
    : actor.id === order.buyerId;

  if (!isAdmin && !isAuthorizedCarrierOrBuyer) {
    throw new ForbiddenError(
      "Only the assigned carrier or authorized collection party can verify farm-gate pickup",
    );
  }

  if (order.status === "CANCELLED") {
    throw new ValidationError("Cannot verify pickup for a cancelled order");
  }

  if (order.status === "DISPUTED") {
    throw new ValidationError("Cannot verify pickup while order is in active dispute review");
  }

  if (
    order.pickupVerifiedAt ||
    order.status === "COLLECTED" ||
    order.status === "IN_TRANSIT" ||
    order.status === "DELIVERED" ||
    order.status === "COMPLETED"
  ) {
    throw new ValidationError("Produce collection has already been verified for this order");
  }

  return repo.verifyPickupPin(orderId, parsed.data.pin, actor.id);
}

export async function verifyDeliveryPinWithRepo(
  repo: OrdersRepository,
  actor: OrderActor,
  orderId: string,
  rawInput: unknown,
): Promise<OrderDetailSummary> {
  const parsed = verifyDeliveryPinSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ValidationError(firstIssue?.message ?? "Invalid delivery PIN format");
  }

  const order = await repo.getOrderById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const isAdmin = actor.role === "ADMIN";
  const isAuthorizedCarrierOrFarmer = order.transporterId
    ? actor.id === order.transporterId
    : actor.id === order.farmerId;

  if (!isAdmin && !isAuthorizedCarrierOrFarmer) {
    throw new ForbiddenError(
      "Only the assigned carrier or delivering party can verify dropoff handover",
    );
  }

  if (order.status === "CANCELLED") {
    throw new ValidationError("Cannot verify delivery for a cancelled order");
  }

  if (order.status === "DISPUTED") {
    throw new ValidationError("Cannot verify delivery while order is in active dispute review");
  }

  if (
    order.deliveryVerifiedAt ||
    order.status === "DELIVERED" ||
    order.status === "COMPLETED"
  ) {
    throw new ValidationError("Delivery handover has already been verified for this order");
  }

  if (!order.pickupVerifiedAt && order.status !== "COLLECTED" && order.status !== "IN_TRANSIT") {
    throw new ValidationError(
      "Produce must be verified as collected from the farm gate before delivery handover can be verified",
    );
  }

  return repo.verifyDeliveryPin(orderId, parsed.data.pin, actor.id);
}

export async function getWaybillWithRepo(
  repo: OrdersRepository,
  actor: OrderActor,
  orderId: string,
): Promise<WaybillSummary> {
  const order = await repo.getOrderById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const isAdmin = actor.role === "ADMIN";
  const isParty =
    actor.id === order.farmerId ||
    actor.id === order.buyerId ||
    (order.transporterId != null && actor.id === order.transporterId);

  if (!isAdmin && !isParty) {
    throw new ForbiddenError("You are not authorized to access this dispatch waybill");
  }

  const waybill = await repo.getWaybillByOrderId(orderId);
  if (!waybill) {
    throw new NotFoundError("Dispatch waybill not found");
  }

  return waybill;
}




