import { getDb } from "@/lib/db";
import { createPrismaOrdersRepository } from "./orders-prisma-repo.ts";
import {
  createOfferWithRepo,
  getOfferWithRepo,
  listUserOffersWithRepo,
  respondToOfferWithRepo,
  getOrderWithRepo,
  listOrdersWithRepo,
  updateOrderStatusWithRepo,
  cancelOrderWithRepo,
  disputeOrderWithRepo,
  verifyPickupPinWithRepo,
  verifyDeliveryPinWithRepo,
  getWaybillWithRepo,
  type OrderActor,
  type OrderAuditContext,
  type RespondOfferResult,
} from "./orders-core.ts";
import type {
  CommercialOfferSummary,
  CommercialOfferDetailSummary,
  OrderSummary,
  OrderDetailSummary,
  WaybillSummary,
} from "./schemas.ts";
import type { OrdersFilterOptions } from "./orders-repo.ts";
import { dispatchNotification, type NotificationCategory } from "@/modules/notifications";

function getOrdersRepo() {
  return createPrismaOrdersRepository(getDb());
}

async function safeNotify(payload: {
  userId: string;
  title: string;
  body: string;
  category: NotificationCategory;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
}) {
  try {
    await dispatchNotification(payload);
  } catch (err) {
    console.warn("Failed to dispatch notification:", err);
  }
}

export async function createCommercialOffer(
  actor: OrderActor,
  rawInput: unknown,
  auditContext?: OrderAuditContext,
): Promise<CommercialOfferDetailSummary> {
  const offer = await createOfferWithRepo(getOrdersRepo(), actor, rawInput, auditContext);

  if (offer.farmerId) {
    await safeNotify({
      userId: offer.farmerId,
      title: `New Offer: ${offer.offerCode}`,
      body: `You received an offer of ₦${offer.unitPrice.toLocaleString("en-NG")} per unit for ${offer.listingTitle || "produce"}.`,
      category: "OFFER_ACTIVITY",
      entityType: "offer",
      entityId: offer.id,
      actionUrl: `/orders/offers/${offer.id}`,
    });
  }

  return offer;
}

export async function getCommercialOffer(
  actor: OrderActor,
  offerId: string,
): Promise<CommercialOfferDetailSummary> {
  return getOfferWithRepo(getOrdersRepo(), actor, offerId);
}

export async function listUserOffers(
  actor: OrderActor,
  filter?: OrdersFilterOptions,
): Promise<CommercialOfferSummary[]> {
  return listUserOffersWithRepo(getOrdersRepo(), actor, filter);
}

export async function respondToCommercialOffer(
  actor: OrderActor,
  offerId: string,
  rawInput: unknown,
  auditContext?: OrderAuditContext,
): Promise<RespondOfferResult> {
  const result = await respondToOfferWithRepo(getOrdersRepo(), actor, offerId, rawInput, auditContext);

  const recipientId =
    actor.id === result.offer.farmerId ? result.offer.buyerId : result.offer.farmerId;

  if (recipientId) {
    let messageBody = `Offer ${result.offer.offerCode} was updated.`;
    if (result.offer.status === "ACCEPTED") {
      messageBody = `Offer ${result.offer.offerCode} was accepted! An order has been created.`;
    } else if (result.offer.status === "COUNTERED") {
      messageBody = `Offer ${result.offer.offerCode} received a counter-offer of ₦${result.offer.unitPrice.toLocaleString("en-NG")} per unit.`;
    } else if (result.offer.status === "DECLINED") {
      messageBody = `Offer ${result.offer.offerCode} was declined.`;
    }

    await safeNotify({
      userId: recipientId,
      title: `Offer ${result.offer.offerCode}: ${result.offer.status}`,
      body: messageBody,
      category: "OFFER_ACTIVITY",
      entityType: result.order ? "order" : "offer",
      entityId: result.order ? result.order.id : result.offer.id,
      actionUrl: result.order ? `/orders/${result.order.id}` : `/orders/offers/${result.offer.id}`,
    });
  }

  return result;
}

export async function getOrder(
  actor: OrderActor,
  orderId: string,
): Promise<OrderDetailSummary> {
  return getOrderWithRepo(getOrdersRepo(), actor, orderId);
}

export async function listUserOrders(
  actor: OrderActor,
  filter?: OrdersFilterOptions,
): Promise<OrderSummary[]> {
  return listOrdersWithRepo(getOrdersRepo(), actor, filter);
}

export async function updateOrderStatus(
  actor: OrderActor,
  orderId: string,
  rawInput: unknown,
): Promise<OrderDetailSummary> {
  const order = await updateOrderStatusWithRepo(getOrdersRepo(), actor, orderId, rawInput);

  if (order.status === "COMPLETED") {
    if (order.farmerId) {
      await safeNotify({
        userId: order.farmerId,
        title: `Order Completed: ${order.orderCode}`,
        body: `Order ${order.orderCode} has been marked as fully completed.`,
        category: "ORDER_STATUS",
        entityType: "order",
        entityId: order.id,
        actionUrl: `/orders/${order.id}`,
      });
    }
    if (order.transporterId) {
      await safeNotify({
        userId: order.transporterId,
        title: `Delivery Completed: ${order.orderCode}`,
        body: `Haulage assignment for order ${order.orderCode} is complete.`,
        category: "ORDER_STATUS",
        entityType: "order",
        entityId: order.id,
        actionUrl: `/transport`,
      });
    }
  }

  return order;
}

export async function cancelOrder(
  actor: OrderActor,
  orderId: string,
  rawInput: unknown,
): Promise<{
  order: OrderDetailSummary;
  restoredQuantity: number;
  listingReactivated: boolean;
}> {
  return cancelOrderWithRepo(getOrdersRepo(), actor, orderId, rawInput);
}

export async function disputeOrder(
  actor: OrderActor,
  orderId: string,
  rawInput: unknown,
): Promise<OrderDetailSummary> {
  return disputeOrderWithRepo(getOrdersRepo(), actor, orderId, rawInput);
}

export async function verifyPickupPin(
  actor: OrderActor,
  orderId: string,
  rawInput: unknown,
): Promise<OrderDetailSummary> {
  const order = await verifyPickupPinWithRepo(getOrdersRepo(), actor, orderId, rawInput);

  if (order.buyerId) {
    await safeNotify({
      userId: order.buyerId,
      title: `Pickup Verified: ${order.orderCode}`,
      body: `Produce for order ${order.orderCode} has been picked up from the farm.`,
      category: "ORDER_STATUS",
      entityType: "order",
      entityId: order.id,
      actionUrl: `/orders/${order.id}`,
    });
  }

  return order;
}

export async function verifyDeliveryPin(
  actor: OrderActor,
  orderId: string,
  rawInput: unknown,
): Promise<OrderDetailSummary> {
  const order = await verifyDeliveryPinWithRepo(getOrdersRepo(), actor, orderId, rawInput);

  if (order.farmerId) {
    await safeNotify({
      userId: order.farmerId,
      title: `Delivery Confirmed: ${order.orderCode}`,
      body: `Buyer has confirmed delivery receipt for order ${order.orderCode}.`,
      category: "ORDER_STATUS",
      entityType: "order",
      entityId: order.id,
      actionUrl: `/orders/${order.id}`,
    });
  }

  return order;
}

export async function getWaybill(
  actor: OrderActor,
  orderId: string,
): Promise<WaybillSummary> {
  return getWaybillWithRepo(getOrdersRepo(), actor, orderId);
}
