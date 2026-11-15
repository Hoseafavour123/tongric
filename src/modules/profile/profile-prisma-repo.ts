import type {
  BuyerType as PrismaBuyerType,
  DocumentType as PrismaDocumentType,
  PricingModel as PrismaPricingModel,
  PrismaClient,
  VehicleType as PrismaVehicleType,
} from "@prisma/client";
import type {
  CreateVerificationDocumentInput,
  ProfileAuditInput,
  ProfileRepository,
  UpdateVerificationStatusInput,
} from "./profile-repo";
import type {
  AdminVerificationQueueItem,
  BuyerProfileSummary,
  DocumentType,
  FarmerProfileSummary,
  TransportProfileSummary,
  UpsertBuyerProfileInput,
  UpsertFarmerProfileInput,
  UpsertTransportProfileInput,
  VerificationDocumentSummary,
  VerificationStatus,
} from "./schemas";

function mapToFarmerProfileSummary(profile: {
  id: string;
  userId: string;
  state: string;
  lga: string;
  community: string;
  primaryCrops: string[];
  cooperativeName: string | null;
  farmSizeHectares: { toNumber(): number } | number | null;
  verificationStatus: string;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): FarmerProfileSummary {
  const farmSizeHectares =
    profile.farmSizeHectares === null || profile.farmSizeHectares === undefined
      ? null
      : typeof profile.farmSizeHectares === "number"
        ? profile.farmSizeHectares
        : profile.farmSizeHectares.toNumber();

  const isComplete = Boolean(
    profile.lga && profile.community && profile.primaryCrops.length > 0,
  );

  return {
    id: profile.id,
    userId: profile.userId,
    state: profile.state,
    lga: profile.lga,
    community: profile.community,
    primaryCrops: profile.primaryCrops,
    cooperativeName: profile.cooperativeName,
    farmSizeHectares,
    verificationStatus: profile.verificationStatus as FarmerProfileSummary["verificationStatus"],
    verifiedAt: profile.verifiedAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    isComplete,
  };
}

function mapToBuyerProfileSummary(profile: {
  id: string;
  userId: string;
  businessName: string;
  buyerType: string;
  state: string;
  operatingLga: string;
  primaryMarket: string | null;
  cropsSourced: string[];
  verificationStatus: string;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): BuyerProfileSummary {
  const isComplete = Boolean(
    profile.businessName &&
      profile.buyerType &&
      profile.operatingLga &&
      profile.cropsSourced.length > 0,
  );

  return {
    id: profile.id,
    userId: profile.userId,
    businessName: profile.businessName,
    buyerType: profile.buyerType as BuyerProfileSummary["buyerType"],
    state: profile.state,
    operatingLga: profile.operatingLga,
    primaryMarket: profile.primaryMarket,
    cropsSourced: profile.cropsSourced,
    verificationStatus: profile.verificationStatus as BuyerProfileSummary["verificationStatus"],
    verifiedAt: profile.verifiedAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    isComplete,
  };
}

function mapToTransportProfileSummary(profile: {
  id: string;
  userId: string;
  operatorName: string;
  vehicleTypes: string[];
  maxCapacityKg: number;
  operatingLgas: string[];
  isAvailable: boolean;
  pricingModel: string;
  verificationStatus: string;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): TransportProfileSummary {
  const isComplete = Boolean(
    profile.operatorName &&
      profile.vehicleTypes.length > 0 &&
      profile.maxCapacityKg > 0 &&
      profile.operatingLgas.length > 0,
  );

  return {
    id: profile.id,
    userId: profile.userId,
    operatorName: profile.operatorName,
    vehicleTypes: profile.vehicleTypes as TransportProfileSummary["vehicleTypes"],
    maxCapacityKg: profile.maxCapacityKg,
    operatingLgas: profile.operatingLgas,
    isAvailable: profile.isAvailable,
    pricingModel: profile.pricingModel as TransportProfileSummary["pricingModel"],
    verificationStatus: profile.verificationStatus as TransportProfileSummary["verificationStatus"],
    verifiedAt: profile.verifiedAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    isComplete,
  };
}

function mapToVerificationDocumentSummary(doc: {
  id: string;
  userId: string;
  documentType: string;
  documentNumber: string | null;
  fileStoragePath: string;
  fileMimeType: string;
  fileSizeBytes: number;
  notes: string | null;
  status: string;
  reviewedByUserId: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): VerificationDocumentSummary {
  return {
    id: doc.id,
    userId: doc.userId,
    documentType: doc.documentType as DocumentType,
    documentNumber: doc.documentNumber,
    fileStoragePath: doc.fileStoragePath,
    fileMimeType: doc.fileMimeType,
    fileSizeBytes: doc.fileSizeBytes,
    notes: doc.notes,
    status: doc.status as VerificationStatus,
    reviewedByUserId: doc.reviewedByUserId,
    reviewedAt: doc.reviewedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findFarmerProfileByUserId(
    userId: string,
  ): Promise<FarmerProfileSummary | null> {
    const profile = await this.prisma.farmerProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;
    return mapToFarmerProfileSummary(profile);
  }

  async upsertFarmerProfile(
    userId: string,
    input: UpsertFarmerProfileInput,
  ): Promise<FarmerProfileSummary> {
    const profile = await this.prisma.farmerProfile.upsert({
      where: { userId },
      update: {
        lga: input.lga,
        community: input.community,
        primaryCrops: input.primaryCrops,
        cooperativeName: input.cooperativeName,
        farmSizeHectares: input.farmSizeHectares,
      },
      create: {
        userId,
        state: "Benue",
        lga: input.lga,
        community: input.community,
        primaryCrops: input.primaryCrops,
        cooperativeName: input.cooperativeName,
        farmSizeHectares: input.farmSizeHectares,
        verificationStatus: "UNVERIFIED",
      },
    });

    return mapToFarmerProfileSummary(profile);
  }

  async findBuyerProfileByUserId(
    userId: string,
  ): Promise<BuyerProfileSummary | null> {
    const profile = await this.prisma.buyerProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;
    return mapToBuyerProfileSummary(profile);
  }

  async upsertBuyerProfile(
    userId: string,
    input: UpsertBuyerProfileInput,
  ): Promise<BuyerProfileSummary> {
    const profile = await this.prisma.buyerProfile.upsert({
      where: { userId },
      update: {
        businessName: input.businessName,
        buyerType: input.buyerType as PrismaBuyerType,
        operatingLga: input.operatingLga,
        primaryMarket: input.primaryMarket,
        cropsSourced: input.cropsSourced,
      },
      create: {
        userId,
        businessName: input.businessName,
        buyerType: input.buyerType as PrismaBuyerType,
        state: "Benue",
        operatingLga: input.operatingLga,
        primaryMarket: input.primaryMarket,
        cropsSourced: input.cropsSourced,
        verificationStatus: "UNVERIFIED",
      },
    });

    return mapToBuyerProfileSummary(profile);
  }

  async findTransportProfileByUserId(
    userId: string,
  ): Promise<TransportProfileSummary | null> {
    const profile = await this.prisma.transportProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;
    return mapToTransportProfileSummary(profile);
  }

  async upsertTransportProfile(
    userId: string,
    input: UpsertTransportProfileInput,
  ): Promise<TransportProfileSummary> {
    const profile = await this.prisma.transportProfile.upsert({
      where: { userId },
      update: {
        operatorName: input.operatorName,
        vehicleTypes: input.vehicleTypes as PrismaVehicleType[],
        maxCapacityKg: input.maxCapacityKg,
        operatingLgas: input.operatingLgas,
        isAvailable: input.isAvailable,
        pricingModel: input.pricingModel as PrismaPricingModel,
      },
      create: {
        userId,
        operatorName: input.operatorName,
        vehicleTypes: input.vehicleTypes as PrismaVehicleType[],
        maxCapacityKg: input.maxCapacityKg,
        operatingLgas: input.operatingLgas,
        isAvailable: input.isAvailable,
        pricingModel: input.pricingModel as PrismaPricingModel,
        verificationStatus: "UNVERIFIED",
      },
    });

    return mapToTransportProfileSummary(profile);
  }

  async createVerificationDocument(
    input: CreateVerificationDocumentInput,
  ): Promise<VerificationDocumentSummary> {
    const doc = await this.prisma.$transaction(async (tx) => {
      const created = await tx.verificationDocument.create({
        data: {
          userId: input.userId,
          documentType: input.documentType as PrismaDocumentType,
          documentNumber: input.documentNumber,
          fileStoragePath: input.fileStoragePath,
          fileMimeType: input.fileMimeType,
          fileSizeBytes: input.fileSizeBytes,
          status: "PENDING",
        },
      });

      await Promise.all([
        tx.farmerProfile.updateMany({
          where: { userId: input.userId },
          data: { verificationStatus: "PENDING" },
        }),
        tx.buyerProfile.updateMany({
          where: { userId: input.userId },
          data: { verificationStatus: "PENDING" },
        }),
        tx.transportProfile.updateMany({
          where: { userId: input.userId },
          data: { verificationStatus: "PENDING" },
        }),
      ]);

      return created;
    });

    return mapToVerificationDocumentSummary(doc);
  }

  async findVerificationDocumentById(
    id: string,
  ): Promise<VerificationDocumentSummary | null> {
    const doc = await this.prisma.verificationDocument.findUnique({
      where: { id },
    });

    if (!doc) return null;
    return mapToVerificationDocumentSummary(doc);
  }

  async findLatestVerificationDocumentByUserId(
    userId: string,
  ): Promise<VerificationDocumentSummary | null> {
    const doc = await this.prisma.verificationDocument.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!doc) return null;
    return mapToVerificationDocumentSummary(doc);
  }

  async listVerificationDocuments(filters?: {
    status?: VerificationStatus;
    limit?: number;
  }): Promise<AdminVerificationQueueItem[]> {
    const items = await this.prisma.verificationDocument.findMany({
      where: filters?.status ? { status: filters.status } : undefined,
      orderBy: { createdAt: "desc" },
      take: filters?.limit ?? 50,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
    });

    return items.map((item) => ({
      ...mapToVerificationDocumentSummary(item),
      user: item.user,
    }));
  }

  async updateVerificationStatus(
    input: UpdateVerificationStatusInput,
  ): Promise<VerificationDocumentSummary> {
    const doc = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.verificationDocument.update({
        where: { id: input.documentId },
        data: {
          status: input.status,
          notes: input.notes ?? null,
          reviewedByUserId: input.reviewedByUserId,
          reviewedAt: new Date(),
        },
      });

      const verifiedAt = input.status === "VERIFIED" ? new Date() : null;

      await Promise.all([
        tx.farmerProfile.updateMany({
          where: { userId: input.targetUserId },
          data: {
            verificationStatus: input.status,
            verifiedAt,
          },
        }),
        tx.buyerProfile.updateMany({
          where: { userId: input.targetUserId },
          data: {
            verificationStatus: input.status,
            verifiedAt,
          },
        }),
        tx.transportProfile.updateMany({
          where: { userId: input.targetUserId },
          data: {
            verificationStatus: input.status,
            verifiedAt,
          },
        }),
      ]);

      return updated;
    });

    return mapToVerificationDocumentSummary(doc);
  }

  async recordProfileAudit(entry: ProfileAuditInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorUserId: entry.actorUserId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        metadata: entry.metadata ? (entry.metadata as object) : undefined,
        ipAddress: entry.ipAddress ?? null,
      },
    });
  }
}
