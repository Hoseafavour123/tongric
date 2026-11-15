import { getDb } from "@/lib/db";
import { createPrismaMarketplaceRepository } from "./marketplace-prisma-repo.ts";
import {
  createProduceListingWithRepo,
  getProduceListingWithRepo,
  listFarmerListingsWithRepo,
  listActiveListingsWithRepo,
  type MarketplaceActor,
  type MarketplaceAuditContext,
} from "./marketplace-core.ts";
import type {
  ProduceListingSummary,
} from "./schemas.ts";
import type { MarketplaceFilterOptions } from "./marketplace-repo.ts";

function getMarketplaceRepo() {
  return createPrismaMarketplaceRepository(getDb());
}

export async function createProduceListing(
  actor: MarketplaceActor,
  rawInput: unknown,
  auditContext?: MarketplaceAuditContext,
): Promise<ProduceListingSummary> {
  return createProduceListingWithRepo(
    getMarketplaceRepo(),
    actor,
    rawInput,
    auditContext,
  );
}

export async function getProduceListing(
  id: string,
): Promise<ProduceListingSummary> {
  return getProduceListingWithRepo(getMarketplaceRepo(), id);
}

export async function listFarmerListings(
  farmerId: string,
): Promise<ProduceListingSummary[]> {
  return listFarmerListingsWithRepo(getMarketplaceRepo(), farmerId);
}

export async function listActiveListings(
  filter?: MarketplaceFilterOptions,
): Promise<ProduceListingSummary[]> {
  return listActiveListingsWithRepo(getMarketplaceRepo(), filter);
}

