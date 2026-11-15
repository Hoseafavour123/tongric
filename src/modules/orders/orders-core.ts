import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import type { OrdersRepository, OrderAuditInput, OrdersFilterOptions } from "./orders-repo.ts";
import {
  createOfferSchema,
  respondOfferSchema,
  type CommercialOfferSummary,
  type CommercialOfferDetailSummary,
  type OfferStatus,
  type OrderSummary,
  type OrderDetailSummary,
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


