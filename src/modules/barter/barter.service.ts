import { getDb } from "@/lib/db.ts";
import { createPrismaBarterRepository } from "./barter-prisma-repo.ts";
import {
  createExchangeListingWithRepo,
  listExchangeListingsWithRepo,
  getExchangeListingWithRepo,
  createExchangeOfferWithRepo,
  acceptExchangeOfferWithRepo,
  confirmExchangeAgreementWithRepo,
  calculateBarterRatioWithCore,
  BarterActorContext,
} from "./barter-core.ts";
import {
  CreateExchangeListingInput,
  ExchangeListingFilter,
  ExchangeListingSummary,
  CreateExchangeOfferInput,
  ExchangeOfferSummary,
  ExchangeAgreementSummary,
  CalculateBarterRatioInput,
  BarterCalculationResult,
} from "./schemas.ts";

function getRepo() {
  return createPrismaBarterRepository(getDb());
}

export async function createExchangeListing(
  actor: BarterActorContext,
  input: CreateExchangeListingInput,
): Promise<ExchangeListingSummary> {
  return createExchangeListingWithRepo(getRepo(), actor, input);
}

export async function listExchangeListings(filter: ExchangeListingFilter): Promise<ExchangeListingSummary[]> {
  return listExchangeListingsWithRepo(getRepo(), filter);
}

export async function getExchangeListing(
  listingId: string,
): Promise<{ listing: ExchangeListingSummary; offers: ExchangeOfferSummary[] }> {
  return getExchangeListingWithRepo(getRepo(), listingId);
}

export async function createExchangeOffer(
  actor: BarterActorContext,
  listingId: string,
  input: CreateExchangeOfferInput,
): Promise<ExchangeOfferSummary> {
  return createExchangeOfferWithRepo(getRepo(), actor, listingId, input);
}

export async function acceptExchangeOffer(
  actor: BarterActorContext,
  offerId: string,
): Promise<ExchangeAgreementSummary> {
  return acceptExchangeOfferWithRepo(getRepo(), actor, offerId);
}

export async function confirmExchangeAgreement(
  actor: BarterActorContext,
  agreementId: string,
): Promise<ExchangeAgreementSummary> {
  return confirmExchangeAgreementWithRepo(getRepo(), actor, agreementId);
}

export async function getExchangeAgreement(
  agreementId: string,
): Promise<ExchangeAgreementSummary | null> {
  return getRepo().getAgreementById(agreementId);
}

export async function listAgreementsForFarmer(
  farmerId: string,
): Promise<ExchangeAgreementSummary[]> {
  return getRepo().listAgreementsForFarmer(farmerId);
}

export function computeBarterParity(input: CalculateBarterRatioInput): BarterCalculationResult {
  return calculateBarterRatioWithCore(input);
}

