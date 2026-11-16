import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors.ts";
import { recordAuditLog } from "@/lib/audit.ts";
import { dispatchNotification } from "@/modules/notifications/notifications.service.ts";
import { BarterRepository } from "./barter-repo.ts";
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
import { calculateBarterRatio } from "./barter-calculator.ts";

export interface BarterActorContext {
  userId: string;
  role: string;
  ipAddress?: string | null;
}

export async function createExchangeListingWithRepo(
  repo: BarterRepository,
  actor: BarterActorContext,
  input: CreateExchangeListingInput,
): Promise<ExchangeListingSummary> {
  if (actor.role !== "FARMER" && actor.role !== "ADMIN") {
    throw new ForbiddenError("Only registered farmers and administrators can create produce barter listings");
  }

  const listing = await repo.createListing(actor.userId, input);

  await recordAuditLog({
    actorUserId: actor.userId,
    action: "BARTER_LISTING_CREATED",
    entityType: "EXCHANGE_LISTING",
    entityId: listing.id,
    metadata: {
      offeredItemType: input.offeredItemType,
      offeredTitle: input.offeredTitle,
      locationLga: input.locationLga,
    },
    ipAddress: actor.ipAddress ?? undefined,
  });

  return listing;
}

export async function listExchangeListingsWithRepo(
  repo: BarterRepository,
  filter: ExchangeListingFilter,
): Promise<ExchangeListingSummary[]> {
  return repo.listListings(filter);
}

export async function getExchangeListingWithRepo(
  repo: BarterRepository,
  listingId: string,
): Promise<{ listing: ExchangeListingSummary; offers: ExchangeOfferSummary[] }> {
  const listing = await repo.getListingById(listingId);
  if (!listing) {
    throw new NotFoundError("Exchange listing not found");
  }

  const offers = await repo.listOffersForListing(listingId);
  return { listing, offers };
}

export async function createExchangeOfferWithRepo(
  repo: BarterRepository,
  actor: BarterActorContext,
  listingId: string,
  input: CreateExchangeOfferInput,
): Promise<ExchangeOfferSummary> {
  if (actor.role !== "FARMER" && actor.role !== "ADMIN") {
    throw new ForbiddenError("Only registered farmers can submit barter swap offers");
  }

  const listing = await repo.getListingById(listingId);
  if (!listing) {
    throw new NotFoundError("Exchange listing not found");
  }

  if (listing.ownerFarmerId === actor.userId && actor.role !== "ADMIN") {
    throw new ValidationError("You cannot propose a barter offer on your own listing");
  }

  if (listing.status !== "OPEN") {
    throw new ValidationError(`Cannot propose barter offer on a listing with status ${listing.status}`);
  }

  const offer = await repo.createOffer(listingId, actor.userId, input);

  await recordAuditLog({
    actorUserId: actor.userId,
    action: "BARTER_OFFER_PROPOSED",
    entityType: "EXCHANGE_OFFER",
    entityId: offer.id,
    metadata: {
      listingId,
      offeredItemDescription: input.offeredItemDescription,
      offeredQty: input.offeredQty,
    },
    ipAddress: actor.ipAddress ?? undefined,
  });

  // Notify listing owner
  await dispatchNotification({
    userId: listing.ownerFarmerId,
    title: "New Produce Barter Offer",
    body: `A peer farmer proposed ${input.offeredQty} ${input.offeredUnit} of ${input.offeredItemDescription} for "${listing.offeredTitle}".`,
    category: "OFFER_ACTIVITY",
    entityType: "EXCHANGE_LISTING",
    entityId: listing.id,
    actionUrl: `/exchange/${listing.id}`,
  });

  return offer;
}

export async function acceptExchangeOfferWithRepo(
  repo: BarterRepository,
  actor: BarterActorContext,
  offerId: string,
): Promise<ExchangeAgreementSummary> {
  const offer = await repo.getOfferById(offerId);
  if (!offer) {
    throw new NotFoundError("Exchange offer not found");
  }

  const listing = await repo.getListingById(offer.listingId);
  if (!listing) {
    throw new NotFoundError("Exchange listing not found");
  }

  if (listing.ownerFarmerId !== actor.userId && actor.role !== "ADMIN") {
    throw new ForbiddenError("Only the listing owner can accept this barter offer");
  }

  if (listing.status !== "OPEN") {
    throw new ValidationError(`Cannot accept an offer for listing with status ${listing.status}`);
  }

  if (offer.status !== "PENDING") {
    throw new ValidationError(`Cannot accept an offer with status ${offer.status}`);
  }

  const termsSummary = `Swap agreed: ${listing.ownerFarmerName} trades ${listing.offeredQty} ${listing.offeredUnit} of "${listing.offeredTitle}" with ${offer.proposerFarmerName} for ${offer.offeredQty} ${offer.offeredUnit} of "${offer.offeredItemDescription}".`;

  const agreement = await repo.createAgreement({
    listingId: listing.id,
    offerId: offer.id,
    farmerAId: listing.ownerFarmerId,
    farmerBId: offer.proposerFarmerId,
    termsSummary,
  });

  await recordAuditLog({
    actorUserId: actor.userId,
    action: "BARTER_AGREEMENT_CREATED",
    entityType: "EXCHANGE_AGREEMENT",
    entityId: agreement.id,
    metadata: {
      listingId: listing.id,
      offerId: offer.id,
      farmerAId: listing.ownerFarmerId,
      farmerBId: offer.proposerFarmerId,
    },
    ipAddress: actor.ipAddress ?? undefined,
  });

  // Notify proposer farmer
  await dispatchNotification({
    userId: offer.proposerFarmerId,
    title: "Barter Offer Accepted!",
    body: `${listing.ownerFarmerName} accepted your barter offer. View your agreement to coordinate exchange and confirm fulfillment.`,
    category: "OFFER_ACTIVITY",
    entityType: "EXCHANGE_AGREEMENT",
    entityId: agreement.id,
    actionUrl: `/exchange/agreements/${agreement.id}`,
  });

  return agreement;
}

export async function confirmExchangeAgreementWithRepo(
  repo: BarterRepository,
  actor: BarterActorContext,
  agreementId: string,
): Promise<ExchangeAgreementSummary> {
  const agreement = await repo.getAgreementById(agreementId);
  if (!agreement) {
    throw new NotFoundError("Exchange agreement not found");
  }

  if (agreement.status !== "ACTIVE") {
    throw new ValidationError(`Agreement is already ${agreement.status}`);
  }

  let side: "FARMER_A" | "FARMER_B";
  if (actor.userId === agreement.farmerAId) {
    if (agreement.farmerAConfirmedAt) {
      throw new ValidationError("You have already confirmed fulfillment for this swap");
    }
    side = "FARMER_A";
  } else if (actor.userId === agreement.farmerBId) {
    if (agreement.farmerBConfirmedAt) {
      throw new ValidationError("You have already confirmed fulfillment for this swap");
    }
    side = "FARMER_B";
  } else if (actor.role === "ADMIN") {
    // Admin acts as whichever side hasn't confirmed yet
    side = !agreement.farmerAConfirmedAt ? "FARMER_A" : "FARMER_B";
  } else {
    throw new ForbiddenError("You are not a party to this barter agreement");
  }

  const updatedAgreement = await repo.confirmAgreementSide({
    agreementId,
    userId: actor.userId,
    side,
  });

  await recordAuditLog({
    actorUserId: actor.userId,
    action: "BARTER_FULFILLMENT_CONFIRMED",
    entityType: "EXCHANGE_AGREEMENT",
    entityId: agreementId,
    metadata: {
      side,
      isFullyCompleted: updatedAgreement.status === "COMPLETED",
    },
    ipAddress: actor.ipAddress ?? undefined,
  });

  if (updatedAgreement.status === "COMPLETED") {
    // Both sides confirmed!
    await dispatchNotification({
      userId: updatedAgreement.farmerAId,
      title: "Barter Swap Fully Completed",
      body: `Both parties have verified physical fulfillment for agreement "${updatedAgreement.termsSummary.slice(0, 50)}...".`,
      category: "ORDER_STATUS",
      entityType: "EXCHANGE_AGREEMENT",
      entityId: updatedAgreement.id,
      actionUrl: `/exchange/agreements/${updatedAgreement.id}`,
    });

    await dispatchNotification({
      userId: updatedAgreement.farmerBId,
      title: "Barter Swap Fully Completed",
      body: `Both parties have verified physical fulfillment for agreement "${updatedAgreement.termsSummary.slice(0, 50)}...".`,
      category: "ORDER_STATUS",
      entityType: "EXCHANGE_AGREEMENT",
      entityId: updatedAgreement.id,
      actionUrl: `/exchange/agreements/${updatedAgreement.id}`,
    });
  } else {
    // Notify the other party that one side confirmed
    const otherUserId = side === "FARMER_A" ? updatedAgreement.farmerBId : updatedAgreement.farmerAId;
    await dispatchNotification({
      userId: otherUserId,
      title: "Partner Confirmed Barter Delivery",
      body: `Your barter partner has confirmed physical delivery. Please confirm once you have received and inspected your produce.`,
      category: "ORDER_STATUS",
      entityType: "EXCHANGE_AGREEMENT",
      entityId: updatedAgreement.id,
      actionUrl: `/exchange/agreements/${updatedAgreement.id}`,
    });
  }

  return updatedAgreement;
}

export function calculateBarterRatioWithCore(input: CalculateBarterRatioInput): BarterCalculationResult {
  return calculateBarterRatio(input);
}

