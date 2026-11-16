import type { PrismaClient } from "@prisma/client";
import type { FinanceRepository } from "./finance-repo.ts";
import type {
  CreateFinancingProductInput,
  FinancingProductSummary,
  LoanApplicationSummary,
  TransactionSummarySnapshot,
  LoanApplicationStatus,
} from "./schemas.ts";

export const SEED_FINANCING_PRODUCTS: CreateFinancingProductInput[] = [
  {
    partnerName: "Benue Agricultural Development Corporation (BADC)",
    title: "Seasonal Grain & Tuber Working Capital Facility",
    description: "Concessionary input financing for registered smallholder farmers cultivating yam, soybeans, and maize across Benue agricultural hubs.",
    minAmountNgn: 30000,
    maxAmountNgn: 150000,
    interestRateSummary: "5% per harvest cycle (non-compounding)",
    repaymentTerms: "Single bullet repayment at 120 days post-harvest",
    eligibilityText: "Must have at least 1 completed commercial delivery on Tongric, verified phone identity, and verified Benue farm location.",
    requiredDocuments: ["NATIONAL_ID", "COOPERATIVE_LETTER"],
    isDemoProduct: true,
    isActive: true,
  },
  {
    partnerName: "Benue Investment & Property Company (BIPC Micro-Credit)",
    title: "Produce Aggregation & Cooperative Inventory Advance",
    description: "Credit line designed for farmer cooperative clusters and high-volume producers aggregating harvested crops for urban wholesale corridors.",
    minAmountNgn: 100000,
    maxAmountNgn: 500000,
    interestRateSummary: "7.5% per annum (pro-rated 90-day seasonal term)",
    repaymentTerms: "Bi-monthly interest service with principal clearance upon batch liquidation",
    eligibilityText: "Minimum 3 verified sales records on Tongric, Grade A or B produce rating, and verified National ID or Voter's Card.",
    requiredDocuments: ["NATIONAL_ID", "COMMUNITY_ATTESTATION"],
    isDemoProduct: true,
    isActive: true,
  },
  {
    partnerName: "Makurdi Agricultural Cooperative Federation",
    title: "Smallholder Dry-Season Seed & Fertilizer Micro-Loan",
    description: "Fast-track micro-financing to purchase certified hybrid seeds, fertilizer, and organic crop protection for irrigation farmers along the Benue river basin.",
    minAmountNgn: 20000,
    maxAmountNgn: 80000,
    interestRateSummary: "4% flat cooperative rate",
    repaymentTerms: "Flexible post-harvest installment clearance within 90 days",
    eligibilityText: "Registered farmer on Tongric with active listing and verified cooperative membership or local community chief attestation.",
    requiredDocuments: ["COOPERATIVE_LETTER"],
    isDemoProduct: true,
    isActive: true,
  },
];

export function createPrismaFinanceRepository(db: PrismaClient): FinanceRepository {
  async function ensureSeedProducts(): Promise<void> {
    const count = await db.financingProduct.count();
    if (count === 0) {
      for (const item of SEED_FINANCING_PRODUCTS) {
        await db.financingProduct.create({
          data: {
            partnerName: item.partnerName,
            title: item.title,
            description: item.description,
            minAmountNgn: item.minAmountNgn,
            maxAmountNgn: item.maxAmountNgn,
            interestRateSummary: item.interestRateSummary,
            repaymentTerms: item.repaymentTerms,
            eligibilityText: item.eligibilityText,
            requiredDocuments: item.requiredDocuments,
            isDemoProduct: item.isDemoProduct,
            isActive: item.isActive,
          },
        });
      }
    }
  }

  return {
    async listActiveProducts(): Promise<FinancingProductSummary[]> {
      await ensureSeedProducts();
      const records = await db.financingProduct.findMany({
        where: { isActive: true },
        orderBy: { minAmountNgn: "asc" },
      });

      return records.map((r) => ({
        id: r.id,
        partnerName: r.partnerName,
        title: r.title,
        description: r.description,
        minAmountNgn: r.minAmountNgn,
        maxAmountNgn: r.maxAmountNgn,
        interestRateSummary: r.interestRateSummary,
        repaymentTerms: r.repaymentTerms,
        eligibilityText: r.eligibilityText,
        requiredDocuments: (r.requiredDocuments as string[]) ?? [],
        isDemoProduct: r.isDemoProduct,
        isActive: r.isActive,
        createdAt: r.createdAt.toISOString(),
      }));
    },

    async getAllProducts(): Promise<FinancingProductSummary[]> {
      await ensureSeedProducts();
      const records = await db.financingProduct.findMany({
        orderBy: { createdAt: "desc" },
      });

      return records.map((r) => ({
        id: r.id,
        partnerName: r.partnerName,
        title: r.title,
        description: r.description,
        minAmountNgn: r.minAmountNgn,
        maxAmountNgn: r.maxAmountNgn,
        interestRateSummary: r.interestRateSummary,
        repaymentTerms: r.repaymentTerms,
        eligibilityText: r.eligibilityText,
        requiredDocuments: (r.requiredDocuments as string[]) ?? [],
        isDemoProduct: r.isDemoProduct,
        isActive: r.isActive,
        createdAt: r.createdAt.toISOString(),
      }));
    },

    async getProductById(id: string): Promise<FinancingProductSummary | null> {
      await ensureSeedProducts();
      const r = await db.financingProduct.findUnique({ where: { id } });
      if (!r) return null;

      return {
        id: r.id,
        partnerName: r.partnerName,
        title: r.title,
        description: r.description,
        minAmountNgn: r.minAmountNgn,
        maxAmountNgn: r.maxAmountNgn,
        interestRateSummary: r.interestRateSummary,
        repaymentTerms: r.repaymentTerms,
        eligibilityText: r.eligibilityText,
        requiredDocuments: (r.requiredDocuments as string[]) ?? [],
        isDemoProduct: r.isDemoProduct,
        isActive: r.isActive,
        createdAt: r.createdAt.toISOString(),
      };
    },

    async createProduct(input: CreateFinancingProductInput): Promise<FinancingProductSummary> {
      const r = await db.financingProduct.create({
        data: {
          partnerName: input.partnerName,
          title: input.title,
          description: input.description,
          minAmountNgn: input.minAmountNgn,
          maxAmountNgn: input.maxAmountNgn,
          interestRateSummary: input.interestRateSummary,
          repaymentTerms: input.repaymentTerms,
          eligibilityText: input.eligibilityText,
          requiredDocuments: input.requiredDocuments,
          isDemoProduct: input.isDemoProduct,
          isActive: input.isActive,
        },
      });

      return {
        id: r.id,
        partnerName: r.partnerName,
        title: r.title,
        description: r.description,
        minAmountNgn: r.minAmountNgn,
        maxAmountNgn: r.maxAmountNgn,
        interestRateSummary: r.interestRateSummary,
        repaymentTerms: r.repaymentTerms,
        eligibilityText: r.eligibilityText,
        requiredDocuments: (r.requiredDocuments as string[]) ?? [],
        isDemoProduct: r.isDemoProduct,
        isActive: r.isActive,
        createdAt: r.createdAt.toISOString(),
      };
    },

    async createApplication(params: {
      referenceCode: string;
      farmerId: string;
      productId: string;
      requestedAmountNgn: number;
      purpose: string;
      consentRecordId: string;
      snapshot: TransactionSummarySnapshot;
      documentKeys: string[];
    }): Promise<LoanApplicationSummary> {
      const r = await db.loanApplication.create({
        data: {
          referenceCode: params.referenceCode,
          farmerId: params.farmerId,
          productId: params.productId,
          requestedAmountNgn: params.requestedAmountNgn,
          purpose: params.purpose,
          consentRecordId: params.consentRecordId,
          transactionSummarySnapshotJson: params.snapshot as unknown as object,
          documentKeys: params.documentKeys,
          status: "SUBMITTED",
        },
        include: {
          farmer: { select: { fullName: true, phoneNumber: true } },
          product: { select: { title: true, partnerName: true } },
        },
      });

      return {
        id: r.id,
        referenceCode: r.referenceCode,
        farmerId: r.farmerId,
        farmerName: r.farmer.fullName,
        farmerPhone: r.farmer.phoneNumber,
        productId: r.productId,
        productTitle: r.product.title,
        partnerName: r.product.partnerName,
        requestedAmountNgn: r.requestedAmountNgn,
        purpose: r.purpose,
        consentRecordId: r.consentRecordId,
        transactionSummarySnapshot: r.transactionSummarySnapshotJson as unknown as TransactionSummarySnapshot,
        documentKeys: (r.documentKeys as string[]) ?? [],
        status: r.status,
        partnerNote: r.partnerNote,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    },

    async getApplicationById(id: string): Promise<LoanApplicationSummary | null> {
      const r = await db.loanApplication.findUnique({
        where: { id },
        include: {
          farmer: { select: { fullName: true, phoneNumber: true } },
          product: { select: { title: true, partnerName: true } },
        },
      });

      if (!r) return null;

      return {
        id: r.id,
        referenceCode: r.referenceCode,
        farmerId: r.farmerId,
        farmerName: r.farmer.fullName,
        farmerPhone: r.farmer.phoneNumber,
        productId: r.productId,
        productTitle: r.product.title,
        partnerName: r.product.partnerName,
        requestedAmountNgn: r.requestedAmountNgn,
        purpose: r.purpose,
        consentRecordId: r.consentRecordId,
        transactionSummarySnapshot: r.transactionSummarySnapshotJson as unknown as TransactionSummarySnapshot,
        documentKeys: (r.documentKeys as string[]) ?? [],
        status: r.status,
        partnerNote: r.partnerNote,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    },

    async getApplicationByReference(referenceCode: string): Promise<LoanApplicationSummary | null> {
      const r = await db.loanApplication.findUnique({
        where: { referenceCode },
        include: {
          farmer: { select: { fullName: true, phoneNumber: true } },
          product: { select: { title: true, partnerName: true } },
        },
      });

      if (!r) return null;

      return {
        id: r.id,
        referenceCode: r.referenceCode,
        farmerId: r.farmerId,
        farmerName: r.farmer.fullName,
        farmerPhone: r.farmer.phoneNumber,
        productId: r.productId,
        productTitle: r.product.title,
        partnerName: r.product.partnerName,
        requestedAmountNgn: r.requestedAmountNgn,
        purpose: r.purpose,
        consentRecordId: r.consentRecordId,
        transactionSummarySnapshot: r.transactionSummarySnapshotJson as unknown as TransactionSummarySnapshot,
        documentKeys: (r.documentKeys as string[]) ?? [],
        status: r.status,
        partnerNote: r.partnerNote,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    },

    async listApplicationsForFarmer(farmerId: string): Promise<LoanApplicationSummary[]> {
      const records = await db.loanApplication.findMany({
        where: { farmerId },
        include: {
          farmer: { select: { fullName: true, phoneNumber: true } },
          product: { select: { title: true, partnerName: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return records.map((r) => ({
        id: r.id,
        referenceCode: r.referenceCode,
        farmerId: r.farmerId,
        farmerName: r.farmer.fullName,
        farmerPhone: r.farmer.phoneNumber,
        productId: r.productId,
        productTitle: r.product.title,
        partnerName: r.product.partnerName,
        requestedAmountNgn: r.requestedAmountNgn,
        purpose: r.purpose,
        consentRecordId: r.consentRecordId,
        transactionSummarySnapshot: r.transactionSummarySnapshotJson as unknown as TransactionSummarySnapshot,
        documentKeys: (r.documentKeys as string[]) ?? [],
        status: r.status,
        partnerNote: r.partnerNote,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    },

    async listAllApplications(status?: LoanApplicationStatus): Promise<LoanApplicationSummary[]> {
      const where: Record<string, unknown> = {};
      if (status) {
        where.status = status;
      }

      const records = await db.loanApplication.findMany({
        where,
        include: {
          farmer: { select: { fullName: true, phoneNumber: true } },
          product: { select: { title: true, partnerName: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return records.map((r) => ({
        id: r.id,
        referenceCode: r.referenceCode,
        farmerId: r.farmerId,
        farmerName: r.farmer.fullName,
        farmerPhone: r.farmer.phoneNumber,
        productId: r.productId,
        productTitle: r.product.title,
        partnerName: r.product.partnerName,
        requestedAmountNgn: r.requestedAmountNgn,
        purpose: r.purpose,
        consentRecordId: r.consentRecordId,
        transactionSummarySnapshot: r.transactionSummarySnapshotJson as unknown as TransactionSummarySnapshot,
        documentKeys: (r.documentKeys as string[]) ?? [],
        status: r.status,
        partnerNote: r.partnerNote,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    },

    async updateApplicationStatus(
      id: string,
      status: LoanApplicationStatus,
      partnerNote?: string | null,
    ): Promise<LoanApplicationSummary> {
      const updateData: Record<string, unknown> = { status };
      if (partnerNote !== undefined) {
        updateData.partnerNote = partnerNote;
      }

      const r = await db.loanApplication.update({
        where: { id },
        data: updateData,
        include: {
          farmer: { select: { fullName: true, phoneNumber: true } },
          product: { select: { title: true, partnerName: true } },
        },
      });

      return {
        id: r.id,
        referenceCode: r.referenceCode,
        farmerId: r.farmerId,
        farmerName: r.farmer.fullName,
        farmerPhone: r.farmer.phoneNumber,
        productId: r.productId,
        productTitle: r.product.title,
        partnerName: r.product.partnerName,
        requestedAmountNgn: r.requestedAmountNgn,
        purpose: r.purpose,
        consentRecordId: r.consentRecordId,
        transactionSummarySnapshot: r.transactionSummarySnapshotJson as unknown as TransactionSummarySnapshot,
        documentKeys: (r.documentKeys as string[]) ?? [],
        status: r.status,
        partnerNote: r.partnerNote,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    },

    async getFarmerCommercialMetrics(farmerId: string): Promise<{
      completedOrdersCount: number;
      totalSalesVolumeNgn: number;
      averageOrderNgn: number;
      activeListingsCount: number;
      kycStatus: string;
      farmerFullName: string;
      locationLga: string;
      accountCreatedAt: Date;
    }> {
      const user = await db.user.findUnique({
        where: { id: farmerId },
        include: {
          farmerProfile: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const completedOrders = await db.order.findMany({
        where: {
          farmerId,
          status: "COMPLETED",
        },
        select: {
          totalAmount: true,
        },
      });

      const activeListingsCount = await db.produceListing.count({
        where: {
          farmerId,
          status: "ACTIVE",
        },
      });

      const totalSalesVolumeNgn = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      const completedOrdersCount = completedOrders.length;
      const averageOrderNgn = completedOrdersCount > 0 ? Math.round(totalSalesVolumeNgn / completedOrdersCount) : 0;

      return {
        completedOrdersCount,
        totalSalesVolumeNgn,
        averageOrderNgn,
        activeListingsCount,
        kycStatus: user.farmerProfile?.verificationStatus ?? "UNVERIFIED",
        farmerFullName: user.fullName,
        locationLga: user.farmerProfile?.lga ?? "Makurdi",
        accountCreatedAt: user.createdAt,
      };
    },
  };
}

