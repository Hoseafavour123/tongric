import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors.ts";
import { recordAuditLog } from "@/lib/audit.ts";
import { dispatchNotification } from "@/modules/notifications/notifications.service.ts";
import { getDb } from "@/lib/db.ts";
import { FinanceRepository } from "./finance-repo.ts";
import {
  CreateLoanApplicationInput,
  LoanApplicationSummary,
  CreditEligibilitySummary,
  TransactionSummarySnapshot,
  LoanApplicationStatus,
} from "./schemas.ts";

export interface FinanceActorContext {
  userId: string;
  role: string;
  ipAddress?: string | null;
}

const CROCKFORD_CHARS = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function generateLoanReferenceCode(): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  let random = "";
  for (let i = 0; i < 5; i++) {
    random += CROCKFORD_CHARS[Math.floor(Math.random() * CROCKFORD_CHARS.length)];
  }
  return `LN-${yearMonth}-${random}`;
}

export async function computeCreditEligibilityWithRepo(
  repo: FinanceRepository,
  farmerId: string,
): Promise<CreditEligibilitySummary> {
  const metrics = await repo.getFarmerCommercialMetrics(farmerId);

  const now = new Date();
  const tenureDays = Math.max(0, Math.floor((now.getTime() - metrics.accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24)));

  let kycScore = 10;
  if (metrics.kycStatus === "VERIFIED") {
    kycScore = 40;
  } else if (metrics.kycStatus === "PENDING") {
    kycScore = 20;
  }

  const orderScore = Math.min(40, metrics.completedOrdersCount * 10);
  const listingScore = metrics.activeListingsCount > 0 ? 10 : 0;
  const tenureScore = tenureDays >= 14 ? 10 : 5;

  const totalScore = Math.min(100, kycScore + orderScore + listingScore + tenureScore);

  let recommendedTier = "Tier 1: Starter Input Facility (Up to ₦50,000)";
  let maxRecommendedCreditNgn = 50000;

  if (totalScore >= 70) {
    recommendedTier = "Tier 3: Commercial Wholesale Corridor (Up to ₦500,000)";
    maxRecommendedCreditNgn = 500000;
  } else if (totalScore >= 40) {
    recommendedTier = "Tier 2: Aggregation Growth Facility (Up to ₦150,000)";
    maxRecommendedCreditNgn = 150000;
  }

  return {
    farmerId,
    kycStatus: metrics.kycStatus,
    completedOrdersCount: metrics.completedOrdersCount,
    totalSalesVolumeNgn: metrics.totalSalesVolumeNgn,
    activeListingsCount: metrics.activeListingsCount,
    accountAgeDays: tenureDays,
    creditScore: totalScore,
    recommendedTier,
    maxRecommendedCreditNgn,
    eligibilityFactors: [
      {
        label: "Identity Verification (KYC)",
        score: kycScore,
        maxScore: 40,
        achieved: metrics.kycStatus === "VERIFIED",
      },
      {
        label: "Verified Commercial Sales Track Record",
        score: orderScore,
        maxScore: 40,
        achieved: metrics.completedOrdersCount >= 2,
      },
      {
        label: "Active Produce Inventory Listings",
        score: listingScore,
        maxScore: 10,
        achieved: metrics.activeListingsCount > 0,
      },
      {
        label: "Platform Active Tenure",
        score: tenureScore,
        maxScore: 10,
        achieved: tenureDays >= 14,
      },
    ],
  };
}

export async function createLoanApplicationWithRepo(
  repo: FinanceRepository,
  actor: FinanceActorContext,
  input: CreateLoanApplicationInput,
): Promise<LoanApplicationSummary> {
  if (actor.role !== "FARMER" && actor.role !== "ADMIN") {
    throw new ForbiddenError("Only registered farmers and administrators can submit agricultural loan demonstration applications");
  }

  const product = await repo.getProductById(input.productId);
  if (!product) {
    throw new NotFoundError("Financing product not found");
  }

  if (!product.isActive) {
    throw new ValidationError("This financing product is currently not accepting applications");
  }

  if (input.requestedAmountNgn < product.minAmountNgn || input.requestedAmountNgn > product.maxAmountNgn) {
    throw new ValidationError(
      `Requested amount must be between ₦${product.minAmountNgn.toLocaleString()} and ₦${product.maxAmountNgn.toLocaleString()}`,
    );
  }

  if (!input.consentGiven) {
    throw new ValidationError("Explicit NDPA 2023 data-sharing consent is required to share verified transaction history");
  }

  const db = getDb();

  // Record immutable NDPA consent record
  const consentRecord = await db.consentRecord.create({
    data: {
      userId: actor.userId,
      consentType: "FINANCIAL_DATA_SHARING",
      policyVersion: "2026.11",
      granted: true,
      locale: "en",
      ipAddress: actor.ipAddress ?? null,
    },
  });

  // Calculate transaction history snapshot
  const eligibility = await computeCreditEligibilityWithRepo(repo, actor.userId);
  const metrics = await repo.getFarmerCommercialMetrics(actor.userId);

  const snapshot: TransactionSummarySnapshot = {
    completedOrdersCount: metrics.completedOrdersCount,
    totalSalesVolumeNgn: metrics.totalSalesVolumeNgn,
    averageOrderNgn: metrics.averageOrderNgn,
    activeListingsCount: metrics.activeListingsCount,
    kycStatus: metrics.kycStatus,
    farmerFullName: metrics.farmerFullName,
    locationLga: metrics.locationLga,
    tenureDays: eligibility.accountAgeDays,
    estimatedCreditScore: eligibility.creditScore,
    recommendedTier: eligibility.recommendedTier,
    generatedAt: new Date().toISOString(),
  };

  const referenceCode = generateLoanReferenceCode();

  const application = await repo.createApplication({
    referenceCode,
    farmerId: actor.userId,
    productId: product.id,
    requestedAmountNgn: input.requestedAmountNgn,
    purpose: input.purpose,
    consentRecordId: consentRecord.id,
    snapshot,
    documentKeys: input.documentKeys,
  });

  await recordAuditLog({
    actorUserId: actor.userId,
    action: "LOAN_APPLICATION_SUBMITTED",
    entityType: "LOAN_APPLICATION",
    entityId: application.id,
    metadata: {
      referenceCode,
      productId: product.id,
      requestedAmountNgn: input.requestedAmountNgn,
      creditScore: eligibility.creditScore,
    },
    ipAddress: actor.ipAddress ?? undefined,
  });

  await dispatchNotification({
    userId: actor.userId,
    title: "Loan Application Received",
    body: `Your credit application (${referenceCode}) for "${product.title}" has been submitted for partner review.`,
    category: "SYSTEM_ALERT",
    entityType: "LOAN_APPLICATION",
    entityId: application.id,
    actionUrl: `/finance/applications/${application.id}`,
  });

  return application;
}

export async function updateLoanApplicationStatusWithRepo(
  repo: FinanceRepository,
  actor: FinanceActorContext,
  applicationId: string,
  newStatus: LoanApplicationStatus,
  partnerNote?: string | null,
): Promise<LoanApplicationSummary> {
  if (actor.role !== "ADMIN") {
    throw new ForbiddenError("Only administrators and authorized partner reviewers can update loan application statuses");
  }

  const existing = await repo.getApplicationById(applicationId);
  if (!existing) {
    throw new NotFoundError("Loan application not found");
  }

  const updated = await repo.updateApplicationStatus(applicationId, newStatus, partnerNote);

  await recordAuditLog({
    actorUserId: actor.userId,
    action: "LOAN_APPLICATION_STATUS_UPDATED",
    entityType: "LOAN_APPLICATION",
    entityId: applicationId,
    metadata: {
      fromStatus: existing.status,
      toStatus: newStatus,
      partnerNote,
    },
    ipAddress: actor.ipAddress ?? undefined,
  });

  // Notify the farmer
  await dispatchNotification({
    userId: updated.farmerId,
    title: `Loan Application Status: ${newStatus.replace(/_/g, " ")}`,
    body: `Your financing application (${updated.referenceCode}) has been updated to "${newStatus.replace(/_/g, " ")}". ${partnerNote ? `Note: ${partnerNote}` : ""}`,
    category: "SYSTEM_ALERT",
    entityType: "LOAN_APPLICATION",
    entityId: updated.id,
    actionUrl: `/finance/applications/${updated.id}`,
  });

  return updated;
}

