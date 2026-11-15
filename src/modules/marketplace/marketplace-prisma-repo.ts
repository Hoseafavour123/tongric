import type { PrismaClient } from "@prisma/client";
import type {
  MarketplaceRepository,
  CreateListingData,
  MarketplaceFilterOptions,
  MarketplaceAuditInput,
} from "./marketplace-repo.ts";
import type {
  ProduceListingSummary,
  ListingPhotoSummary,
  ListingStatus,
  ProduceGrade,
  AvailabilityStatus,
} from "./schemas.ts";

interface RawListingWithRelations {
  id: string;
  farmerId: string;
  title: string;
  cropCode: string;
  cropCategory: string;
  grade: string;
  quantity: number;
  unitCode: string;
  estimatedWeightKg: number;
  pricePerUnit: { toString(): string } | number;
  currency: string;
  minOrderQuantity: number;
  isNegotiable: boolean;
  availabilityStatus: string;
  harvestDate: Date | null;
  state: string;
  lga: string;
  community: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  farmer?: {
    fullName: string;
    phoneNumber: string;
    farmerProfile?: {
      verificationStatus: string;
      cooperativeName: string | null;
    } | null;
  } | null;
  photos?: Array<{
    id: string;
    listingId: string;
    fileStoragePath: string;
    publicUrl: string;
    mimeType: string;
    sizeBytes: number;
    isPrimary: boolean;
    createdAt: Date;
  }>;
}

const farmerSelect = {
  fullName: true,
  phoneNumber: true,
  farmerProfile: {
    select: {
      verificationStatus: true,
      cooperativeName: true,
    },
  },
} as const;

function mapListingToSummary(row: RawListingWithRelations): ProduceListingSummary {
  const photos: ListingPhotoSummary[] = (row.photos ?? []).map((p) => ({
    id: p.id,
    listingId: p.listingId,
    fileStoragePath: p.fileStoragePath,
    publicUrl: p.publicUrl,
    mimeType: p.mimeType,
    sizeBytes: p.sizeBytes,
    isPrimary: p.isPrimary,
    createdAt: p.createdAt.toISOString(),
  }));

  const primaryPhoto = photos.find((p) => p.isPrimary) ?? photos[0] ?? null;

  return {
    id: row.id,
    farmerId: row.farmerId,
    farmerName: row.farmer?.fullName,
    farmerPhone: row.farmer?.phoneNumber,
    farmerVerificationStatus: row.farmer?.farmerProfile?.verificationStatus as
      | "UNVERIFIED"
      | "PENDING"
      | "VERIFIED"
      | "REJECTED"
      | undefined,
    cooperativeName: row.farmer?.farmerProfile?.cooperativeName ?? null,
    title: row.title,
    cropCode: row.cropCode,
    cropCategory: row.cropCategory,
    grade: row.grade as ProduceGrade,
    quantity: row.quantity,
    unitCode: row.unitCode,
    estimatedWeightKg: row.estimatedWeightKg,
    pricePerUnit: Number(row.pricePerUnit),
    currency: row.currency,
    minOrderQuantity: row.minOrderQuantity,
    isNegotiable: row.isNegotiable,
    availabilityStatus: row.availabilityStatus as AvailabilityStatus,
    harvestDate: row.harvestDate ? (row.harvestDate.toISOString().split("T")[0] ?? null) : null,
    state: row.state,
    lga: row.lga,
    community: row.community,
    description: row.description ?? null,
    status: row.status as ListingStatus,
    primaryPhotoUrl: primaryPhoto?.publicUrl ?? null,
    photos,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function createPrismaMarketplaceRepository(
  db: PrismaClient,
): MarketplaceRepository {
  return {
    async createListing(data: CreateListingData): Promise<ProduceListingSummary> {
      const hasExplicitPrimary = data.photos.some((p) => p.isPrimary);
      const photoCreates = data.photos.map((p, idx) => ({
        fileStoragePath: p.fileStoragePath,
        publicUrl: p.publicUrl,
        mimeType: p.mimeType,
        sizeBytes: p.sizeBytes,
        isPrimary: hasExplicitPrimary ? p.isPrimary : idx === 0,
      }));

      const created = await db.produceListing.create({
        data: {
          farmerId: data.farmerId,
          title: data.title,
          cropCode: data.cropCode,
          cropCategory: data.cropCategory,
          grade: data.grade,
          quantity: data.quantity,
          unitCode: data.unitCode,
          estimatedWeightKg: data.estimatedWeightKg,
          pricePerUnit: data.pricePerUnit,
          currency: data.currency,
          minOrderQuantity: data.minOrderQuantity,
          isNegotiable: data.isNegotiable,
          availabilityStatus: data.availabilityStatus,
          harvestDate: data.harvestDate ? new Date(data.harvestDate) : null,
          state: data.state,
          lga: data.lga,
          community: data.community,
          description: data.description,
          status: "ACTIVE",
          photos: {
            create: photoCreates,
          },
        },
        include: {
          photos: { orderBy: { createdAt: "asc" } },
          farmer: { select: farmerSelect },
        },
      });

      return mapListingToSummary(created as unknown as RawListingWithRelations);
    },

    async getListingById(id: string): Promise<ProduceListingSummary | null> {
      const listing = await db.produceListing.findUnique({
        where: { id },
        include: {
          photos: { orderBy: { createdAt: "asc" } },
          farmer: { select: farmerSelect },
        },
      });

      if (!listing) return null;
      return mapListingToSummary(listing as unknown as RawListingWithRelations);
    },

    async listListingsByFarmer(farmerId: string): Promise<ProduceListingSummary[]> {
      const listings = await db.produceListing.findMany({
        where: { farmerId },
        orderBy: { createdAt: "desc" },
        include: {
          photos: { orderBy: { createdAt: "asc" } },
          farmer: { select: farmerSelect },
        },
      });

      return listings.map((l) =>
        mapListingToSummary(l as unknown as RawListingWithRelations),
      );
    },

    async listActiveListings(
      filter?: MarketplaceFilterOptions,
    ): Promise<ProduceListingSummary[]> {
      const where: Record<string, unknown> = {
        status: filter?.status ?? "ACTIVE",
      };

      if (filter?.cropCode) {
        where.cropCode = filter.cropCode;
      }
      if (filter?.lga) {
        where.lga = filter.lga;
      }
      if (filter?.grade) {
        where.grade = filter.grade;
      }
      if (filter?.availabilityStatus) {
        where.availabilityStatus = filter.availabilityStatus;
      }

      let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
      if (filter?.sortBy === "price_asc") {
        orderBy = { pricePerUnit: "asc" };
      } else if (filter?.sortBy === "price_desc") {
        orderBy = { pricePerUnit: "desc" };
      } else if (filter?.sortBy === "quantity_desc") {
        orderBy = { quantity: "desc" };
      } else if (filter?.sortBy === "newest") {
        orderBy = { createdAt: "desc" };
      }

      const listings = await db.produceListing.findMany({
        where,
        orderBy,
        include: {
          photos: { orderBy: { createdAt: "asc" } },
          farmer: { select: farmerSelect },
        },
      });

      return listings.map((l) =>
        mapListingToSummary(l as unknown as RawListingWithRelations),
      );
    },

    async recordMarketplaceAudit(entry: MarketplaceAuditInput): Promise<void> {
      await db.auditLog.create({
        data: {
          actorUserId: entry.actorUserId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          metadata: entry.metadata ? (entry.metadata as object) : undefined,
          ipAddress: entry.ipAddress,
        },
      });
    },
  };
}
