import { getDb } from "@/lib/db";
import { createPrismaOrdersRepository } from "./orders-prisma-repo.ts";
import {
  createOfferWithRepo,
  getOfferWithRepo,
  listUserOffersWithRepo,
  respondToOfferWithRepo,
  getOrderWithRepo,
  listOrdersWithRepo,
  type OrderActor,
  type OrderAuditContext,
  type RespondOfferResult,
} from "./orders-core.ts";
import type {
  CommercialOfferSummary,
  CommercialOfferDetailSummary,
  OrderSummary,
  OrderDetailSummary,
} from "./schemas.ts";
import type { OrdersFilterOptions } from "./orders-repo.ts";

function getOrdersRepo() {
  return createPrismaOrdersRepository(getDb());
}

export async function createCommercialOffer(
  actor: OrderActor,
  rawInput: unknown,
  auditContext?: OrderAuditContext,
): Promise<CommercialOfferDetailSummary> {
  return createOfferWithRepo(getOrdersRepo(), actor, rawInput, auditContext);
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
  return respondToOfferWithRepo(getOrdersRepo(), actor, offerId, rawInput, auditContext);
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

