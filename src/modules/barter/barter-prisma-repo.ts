import type { PrismaClient } from "@prisma/client";
import type { BarterRepository } from "./barter-repo.ts";
import type {
  CreateExchangeListingInput,
  ExchangeListingFilter,
  ExchangeListingSummary,
  CreateExchangeOfferInput,
  ExchangeOfferSummary,
  ExchangeAgreementSummary,
  ExchangeListingStatus,
} from "./schemas.ts";

export function createPrismaBarterRepository(db: PrismaClient): BarterRepository {
  return {
    async createListing(ownerFarmerId: string, input: CreateExchangeListingInput): Promise<ExchangeListingSummary> {
      const record = await db.exchangeListing.create({
        data: {
          ownerFarmerId,
          offeredItemType: input.offeredItemType,
          offeredCropId: input.offeredCropId ?? null,
          offeredTitle: input.offeredTitle,
          offeredDescription: input.offeredDescription,
          offeredQty: input.offeredQty,
          offeredUnit: input.offeredUnit,
          desiredDescription: input.desiredDescription,
          desiredQty: input.desiredQty ?? null,
          desiredUnit: input.desiredUnit ?? null,
          locationLga: input.locationLga,
          status: "OPEN",
        },
        include: {
          ownerFarmer: {
            select: { id: true, fullName: true, phoneNumber: true },
          },
          _count: {
            select: { offers: true },
          },
        },
      });

      return {
        id: record.id,
        ownerFarmerId: record.ownerFarmer.id,
        ownerFarmerName: record.ownerFarmer.fullName,
        ownerFarmerPhone: record.ownerFarmer.phoneNumber,
        offeredItemType: record.offeredItemType,
        offeredCropId: record.offeredCropId,
        offeredTitle: record.offeredTitle,
        offeredDescription: record.offeredDescription,
        offeredQty: record.offeredQty,
        offeredUnit: record.offeredUnit,
        desiredDescription: record.desiredDescription,
        desiredQty: record.desiredQty,
        desiredUnit: record.desiredUnit,
        locationLga: record.locationLga,
        status: record.status,
        offersCount: record._count.offers,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    },

    async getListingById(id: string): Promise<ExchangeListingSummary | null> {
      const record = await db.exchangeListing.findUnique({
        where: { id },
        include: {
          ownerFarmer: {
            select: { id: true, fullName: true, phoneNumber: true },
          },
          _count: {
            select: { offers: true },
          },
        },
      });

      if (!record) return null;

      return {
        id: record.id,
        ownerFarmerId: record.ownerFarmer.id,
        ownerFarmerName: record.ownerFarmer.fullName,
        ownerFarmerPhone: record.ownerFarmer.phoneNumber,
        offeredItemType: record.offeredItemType,
        offeredCropId: record.offeredCropId,
        offeredTitle: record.offeredTitle,
        offeredDescription: record.offeredDescription,
        offeredQty: record.offeredQty,
        offeredUnit: record.offeredUnit,
        desiredDescription: record.desiredDescription,
        desiredQty: record.desiredQty,
        desiredUnit: record.desiredUnit,
        locationLga: record.locationLga,
        status: record.status,
        offersCount: record._count.offers,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    },

    async listListings(filter: ExchangeListingFilter): Promise<ExchangeListingSummary[]> {
      const where: Record<string, unknown> = {};

      if (filter.status) {
        where.status = filter.status;
      }
      if (filter.locationLga) {
        where.locationLga = { equals: filter.locationLga, mode: "insensitive" };
      }
      if (filter.itemType) {
        where.offeredItemType = filter.itemType;
      }
      if (filter.farmerId) {
        where.ownerFarmerId = filter.farmerId;
      }
      if (filter.search) {
        where.OR = [
          { offeredTitle: { contains: filter.search, mode: "insensitive" } },
          { offeredDescription: { contains: filter.search, mode: "insensitive" } },
          { desiredDescription: { contains: filter.search, mode: "insensitive" } },
        ];
      }

      const records = await db.exchangeListing.findMany({
        where,
        include: {
          ownerFarmer: {
            select: { id: true, fullName: true, phoneNumber: true },
          },
          _count: {
            select: { offers: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return records.map((record) => ({
        id: record.id,
        ownerFarmerId: record.ownerFarmer.id,
        ownerFarmerName: record.ownerFarmer.fullName,
        ownerFarmerPhone: record.ownerFarmer.phoneNumber,
        offeredItemType: record.offeredItemType,
        offeredCropId: record.offeredCropId,
        offeredTitle: record.offeredTitle,
        offeredDescription: record.offeredDescription,
        offeredQty: record.offeredQty,
        offeredUnit: record.offeredUnit,
        desiredDescription: record.desiredDescription,
        desiredQty: record.desiredQty,
        desiredUnit: record.desiredUnit,
        locationLga: record.locationLga,
        status: record.status,
        offersCount: record._count.offers,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      }));
    },

    async updateListingStatus(id: string, status: ExchangeListingStatus): Promise<ExchangeListingSummary> {
      const record = await db.exchangeListing.update({
        where: { id },
        data: { status },
        include: {
          ownerFarmer: {
            select: { id: true, fullName: true, phoneNumber: true },
          },
          _count: {
            select: { offers: true },
          },
        },
      });

      return {
        id: record.id,
        ownerFarmerId: record.ownerFarmer.id,
        ownerFarmerName: record.ownerFarmer.fullName,
        ownerFarmerPhone: record.ownerFarmer.phoneNumber,
        offeredItemType: record.offeredItemType,
        offeredCropId: record.offeredCropId,
        offeredTitle: record.offeredTitle,
        offeredDescription: record.offeredDescription,
        offeredQty: record.offeredQty,
        offeredUnit: record.offeredUnit,
        desiredDescription: record.desiredDescription,
        desiredQty: record.desiredQty,
        desiredUnit: record.desiredUnit,
        locationLga: record.locationLga,
        status: record.status,
        offersCount: record._count.offers,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    },

    async createOffer(
      listingId: string,
      proposerFarmerId: string,
      input: CreateExchangeOfferInput,
    ): Promise<ExchangeOfferSummary> {
      const record = await db.exchangeOffer.create({
        data: {
          listingId,
          proposerFarmerId,
          offeredItemDescription: input.offeredItemDescription,
          offeredQty: input.offeredQty,
          offeredUnit: input.offeredUnit,
          message: input.message ?? null,
          status: "PENDING",
        },
        include: {
          proposerFarmer: {
            select: { id: true, fullName: true, phoneNumber: true },
          },
        },
      });

      return {
        id: record.id,
        listingId: record.listingId,
        proposerFarmerId: record.proposerFarmer.id,
        proposerFarmerName: record.proposerFarmer.fullName,
        proposerFarmerPhone: record.proposerFarmer.phoneNumber,
        offeredItemDescription: record.offeredItemDescription,
        offeredQty: record.offeredQty,
        offeredUnit: record.offeredUnit,
        message: record.message,
        status: record.status,
        createdAt: record.createdAt.toISOString(),
      };
    },

    async getOfferById(id: string): Promise<ExchangeOfferSummary | null> {
      const record = await db.exchangeOffer.findUnique({
        where: { id },
        include: {
          proposerFarmer: {
            select: { id: true, fullName: true, phoneNumber: true },
          },
        },
      });

      if (!record) return null;

      return {
        id: record.id,
        listingId: record.listingId,
        proposerFarmerId: record.proposerFarmer.id,
        proposerFarmerName: record.proposerFarmer.fullName,
        proposerFarmerPhone: record.proposerFarmer.phoneNumber,
        offeredItemDescription: record.offeredItemDescription,
        offeredQty: record.offeredQty,
        offeredUnit: record.offeredUnit,
        message: record.message,
        status: record.status,
        createdAt: record.createdAt.toISOString(),
      };
    },

    async listOffersForListing(listingId: string): Promise<ExchangeOfferSummary[]> {
      const records = await db.exchangeOffer.findMany({
        where: { listingId },
        include: {
          proposerFarmer: {
            select: { id: true, fullName: true, phoneNumber: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return records.map((record) => ({
        id: record.id,
        listingId: record.listingId,
        proposerFarmerId: record.proposerFarmer.id,
        proposerFarmerName: record.proposerFarmer.fullName,
        proposerFarmerPhone: record.proposerFarmer.phoneNumber,
        offeredItemDescription: record.offeredItemDescription,
        offeredQty: record.offeredQty,
        offeredUnit: record.offeredUnit,
        message: record.message,
        status: record.status,
        createdAt: record.createdAt.toISOString(),
      }));
    },

    async listOffersByFarmer(farmerId: string): Promise<ExchangeOfferSummary[]> {
      const records = await db.exchangeOffer.findMany({
        where: { proposerFarmerId: farmerId },
        include: {
          proposerFarmer: {
            select: { id: true, fullName: true, phoneNumber: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return records.map((record) => ({
        id: record.id,
        listingId: record.listingId,
        proposerFarmerId: record.proposerFarmer.id,
        proposerFarmerName: record.proposerFarmer.fullName,
        proposerFarmerPhone: record.proposerFarmer.phoneNumber,
        offeredItemDescription: record.offeredItemDescription,
        offeredQty: record.offeredQty,
        offeredUnit: record.offeredUnit,
        message: record.message,
        status: record.status,
        createdAt: record.createdAt.toISOString(),
      }));
    },

    async createAgreement(params: {
      listingId: string;
      offerId: string;
      farmerAId: string;
      farmerBId: string;
      termsSummary: string;
    }): Promise<ExchangeAgreementSummary> {
      const record = await db.$transaction(async (tx) => {
        // Update offer to ACCEPTED
        await tx.exchangeOffer.update({
          where: { id: params.offerId },
          data: { status: "ACCEPTED" },
        });

        // Reject other pending offers on the listing
        await tx.exchangeOffer.updateMany({
          where: {
            listingId: params.listingId,
            id: { not: params.offerId },
            status: "PENDING",
          },
          data: { status: "REJECTED" },
        });

        // Update listing status to AGREED
        await tx.exchangeListing.update({
          where: { id: params.listingId },
          data: { status: "AGREED" },
        });

        // Create agreement record
        return tx.exchangeAgreement.create({
          data: {
            listingId: params.listingId,
            offerId: params.offerId,
            farmerAId: params.farmerAId,
            farmerBId: params.farmerBId,
            termsSummary: params.termsSummary,
            status: "ACTIVE",
          },
          include: {
            listing: { select: { offeredTitle: true } },
            farmerA: { select: { fullName: true, phoneNumber: true } },
            farmerB: { select: { fullName: true, phoneNumber: true } },
          },
        });
      });

      return {
        id: record.id,
        listingId: record.listingId,
        listingTitle: record.listing.offeredTitle,
        offerId: record.offerId,
        farmerAId: record.farmerAId,
        farmerAName: record.farmerA.fullName,
        farmerAPhone: record.farmerA.phoneNumber,
        farmerBId: record.farmerBId,
        farmerBName: record.farmerB.fullName,
        farmerBPhone: record.farmerB.phoneNumber,
        termsSummary: record.termsSummary,
        farmerAConfirmedAt: record.farmerAConfirmedAt ? record.farmerAConfirmedAt.toISOString() : null,
        farmerBConfirmedAt: record.farmerBConfirmedAt ? record.farmerBConfirmedAt.toISOString() : null,
        status: record.status,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    },

    async getAgreementById(id: string): Promise<ExchangeAgreementSummary | null> {
      const record = await db.exchangeAgreement.findUnique({
        where: { id },
        include: {
          listing: { select: { offeredTitle: true } },
          farmerA: { select: { fullName: true, phoneNumber: true } },
          farmerB: { select: { fullName: true, phoneNumber: true } },
        },
      });

      if (!record) return null;

      return {
        id: record.id,
        listingId: record.listingId,
        listingTitle: record.listing.offeredTitle,
        offerId: record.offerId,
        farmerAId: record.farmerAId,
        farmerAName: record.farmerA.fullName,
        farmerAPhone: record.farmerA.phoneNumber,
        farmerBId: record.farmerBId,
        farmerBName: record.farmerB.fullName,
        farmerBPhone: record.farmerB.phoneNumber,
        termsSummary: record.termsSummary,
        farmerAConfirmedAt: record.farmerAConfirmedAt ? record.farmerAConfirmedAt.toISOString() : null,
        farmerBConfirmedAt: record.farmerBConfirmedAt ? record.farmerBConfirmedAt.toISOString() : null,
        status: record.status,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    },

    async listAgreementsForFarmer(farmerId: string): Promise<ExchangeAgreementSummary[]> {
      const records = await db.exchangeAgreement.findMany({
        where: {
          OR: [{ farmerAId: farmerId }, { farmerBId: farmerId }],
        },
        include: {
          listing: { select: { offeredTitle: true } },
          farmerA: { select: { fullName: true, phoneNumber: true } },
          farmerB: { select: { fullName: true, phoneNumber: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return records.map((record) => ({
        id: record.id,
        listingId: record.listingId,
        listingTitle: record.listing.offeredTitle,
        offerId: record.offerId,
        farmerAId: record.farmerAId,
        farmerAName: record.farmerA.fullName,
        farmerAPhone: record.farmerA.phoneNumber,
        farmerBId: record.farmerBId,
        farmerBName: record.farmerB.fullName,
        farmerBPhone: record.farmerB.phoneNumber,
        termsSummary: record.termsSummary,
        farmerAConfirmedAt: record.farmerAConfirmedAt ? record.farmerAConfirmedAt.toISOString() : null,
        farmerBConfirmedAt: record.farmerBConfirmedAt ? record.farmerBConfirmedAt.toISOString() : null,
        status: record.status,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      }));
    },

    async confirmAgreementSide(params: {
      agreementId: string;
      userId: string;
      side: "FARMER_A" | "FARMER_B";
    }): Promise<ExchangeAgreementSummary> {
      const now = new Date();
      const updateData: Record<string, unknown> = {};

      if (params.side === "FARMER_A") {
        updateData.farmerAConfirmedAt = now;
      } else {
        updateData.farmerBConfirmedAt = now;
      }

      const existing = await db.exchangeAgreement.findUnique({
        where: { id: params.agreementId },
      });

      if (!existing) {
        throw new Error("Exchange agreement not found");
      }

      const isBothConfirmed =
        (params.side === "FARMER_A" && existing.farmerBConfirmedAt !== null) ||
        (params.side === "FARMER_B" && existing.farmerAConfirmedAt !== null);

      if (isBothConfirmed) {
        updateData.status = "COMPLETED";
      }

      const record = await db.$transaction(async (tx) => {
        const ag = await tx.exchangeAgreement.update({
          where: { id: params.agreementId },
          data: updateData,
          include: {
            listing: { select: { offeredTitle: true } },
            farmerA: { select: { fullName: true, phoneNumber: true } },
            farmerB: { select: { fullName: true, phoneNumber: true } },
          },
        });

        if (isBothConfirmed) {
          await tx.exchangeListing.update({
            where: { id: existing.listingId },
            data: { status: "COMPLETED" },
          });
        }

        return ag;
      });

      return {
        id: record.id,
        listingId: record.listingId,
        listingTitle: record.listing.offeredTitle,
        offerId: record.offerId,
        farmerAId: record.farmerAId,
        farmerAName: record.farmerA.fullName,
        farmerAPhone: record.farmerA.phoneNumber,
        farmerBId: record.farmerBId,
        farmerBName: record.farmerB.fullName,
        farmerBPhone: record.farmerB.phoneNumber,
        termsSummary: record.termsSummary,
        farmerAConfirmedAt: record.farmerAConfirmedAt ? record.farmerAConfirmedAt.toISOString() : null,
        farmerBConfirmedAt: record.farmerBConfirmedAt ? record.farmerBConfirmedAt.toISOString() : null,
        status: record.status,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    },
  };
}

