import { ForbiddenError, NotFoundError } from "@/lib/errors";
import {
  PRODUCE_CROP_CATALOG,
  PRODUCE_UNIT_CATALOG,
  estimateWeightKg,
} from "@/modules/i18n/catalogs";
import type {
  MarketplaceRepository,
  MarketplaceFilterOptions,
} from "./marketplace-repo.ts";
import {
  createListingSchema,
  type ProduceListingSummary,
} from "./schemas.ts";

export interface MarketplaceActor {
  id: string;
  role: string;
}

export interface MarketplaceAuditContext {
  ipAddress?: string | null;
}

/**
 * Creates a human-readable title summarizing batch size, unit, crop, and grade.
 * e.g., "50 Bags of Yam (Grade B)"
 */
function generateListingTitle(
  quantity: number,
  unitCode: string,
  cropCode: string,
  grade: string,
): string {
  const crop = PRODUCE_CROP_CATALOG.find((c) => c.code === cropCode);
  const cropName = crop ? crop.code.charAt(0).toUpperCase() + crop.code.slice(1) : cropCode;
  const unit = PRODUCE_UNIT_CATALOG.find((u) => u.code === unitCode);
  const unitName = unit ? unit.code.charAt(0).toUpperCase() + unit.code.slice(1) : unitCode;
  const pluralUnit = quantity > 1 && !unitName.endsWith("s") ? `${unitName}s` : unitName;

  const gradeLabel = grade === "GRADE_A" ? "Grade A" : grade === "GRADE_C" ? "Grade C" : "Grade B";
  return `${quantity} ${pluralUnit} of ${cropName} (${gradeLabel})`;
}

/**
 * Validates, authorizes, and persists a commercial produce listing offered by a farmer or admin.
 */
export async function createProduceListingWithRepo(
  repo: MarketplaceRepository,
  actor: MarketplaceActor,
  rawInput: unknown,
  auditContext?: MarketplaceAuditContext,
): Promise<ProduceListingSummary> {
  if (actor.role !== "FARMER" && actor.role !== "ADMIN") {
    throw new ForbiddenError(
      "Only registered farmers and administrators can publish produce listings.",
    );
  }

  const parsed = createListingSchema.parse(rawInput);

  const crop = PRODUCE_CROP_CATALOG.find((c) => c.code === parsed.cropCode);
  const cropCategory = crop ? crop.category : "other";

  const title = generateListingTitle(
    parsed.quantity,
    parsed.unitCode,
    parsed.cropCode,
    parsed.grade,
  );

  const calculatedWeight = estimateWeightKg(parsed.quantity, parsed.unitCode);
  const estimatedWeightKg = calculatedWeight !== null ? calculatedWeight : 0;

  const listing = await repo.createListing({
    ...parsed,
    farmerId: actor.id,
    title,
    cropCategory,
    estimatedWeightKg,
  });

  await repo.recordMarketplaceAudit({
    actorUserId: actor.id,
    action: "LISTING_CREATED",
    entityType: "PRODUCE_LISTING",
    entityId: listing.id,
    metadata: {
      cropCode: listing.cropCode,
      cropCategory: listing.cropCategory,
      grade: listing.grade,
      quantity: listing.quantity,
      unitCode: listing.unitCode,
      estimatedWeightKg: listing.estimatedWeightKg,
      pricePerUnit: listing.pricePerUnit,
      currency: listing.currency,
      minOrderQuantity: listing.minOrderQuantity,
      isNegotiable: listing.isNegotiable,
      availabilityStatus: listing.availabilityStatus,
      lga: listing.lga,
      community: listing.community,
      photoCount: listing.photos.length,
    },
    ipAddress: auditContext?.ipAddress,
  });

  return listing;
}

/**
 * Retrieves a single produce listing by ID with verified seller details and photos.
 */
export async function getProduceListingWithRepo(
  repo: MarketplaceRepository,
  id: string,
): Promise<ProduceListingSummary> {
  const listing = await repo.getListingById(id);
  if (!listing) {
    throw new NotFoundError("Produce listing not found.");
  }
  return listing;
}

/**
 * Lists all produce listings published by a specific farmer or producer.
 */
export async function listFarmerListingsWithRepo(
  repo: MarketplaceRepository,
  farmerId: string,
): Promise<ProduceListingSummary[]> {
  return repo.listListingsByFarmer(farmerId);
}

/**
 * Lists all active commercial produce listings available for buyer discovery and filtering.
 */
export async function listActiveListingsWithRepo(
  repo: MarketplaceRepository,
  filter?: MarketplaceFilterOptions,
): Promise<ProduceListingSummary[]> {
  return repo.listActiveListings(filter);
}

