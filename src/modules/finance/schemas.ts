import { z } from "zod";

export const loanApplicationStatusEnum = z.enum([
  "SUBMITTED",
  "UNDER_PARTNER_REVIEW",
  "ADDITIONAL_INFO_REQUESTED",
  "APPROVED",
  "DECLINED",
]);
export type LoanApplicationStatus = z.infer<typeof loanApplicationStatusEnum>;

export const createFinancingProductSchema = z.object({
  partnerName: z.string().trim().min(2, "Partner name is required").max(100),
  title: z.string().trim().min(3, "Title is required").max(120),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(1000),
  minAmountNgn: z.number().int().positive("Minimum amount must be positive"),
  maxAmountNgn: z.number().int().positive("Maximum amount must be positive"),
  interestRateSummary: z.string().trim().min(2, "Interest rate summary is required").max(100),
  repaymentTerms: z.string().trim().min(2, "Repayment terms are required").max(200),
  eligibilityText: z.string().trim().min(10, "Eligibility text is required").max(1000),
  requiredDocuments: z.array(z.string()).default(["NATIONAL_ID", "COOPERATIVE_LETTER"]),
  isDemoProduct: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export type CreateFinancingProductInput = z.infer<typeof createFinancingProductSchema>;

export const createLoanApplicationSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required"),
  requestedAmountNgn: z.number().int().positive("Requested amount must be greater than 0"),
  purpose: z.string().trim().min(5, "Purpose must be at least 5 characters").max(1000),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "You must explicitly grant NDPA consent to generate and share your verified sales summary" }),
  }),
  documentKeys: z.array(z.string()).default([]),
});

export type CreateLoanApplicationInput = z.infer<typeof createLoanApplicationSchema>;

export const updateLoanApplicationStatusSchema = z.object({
  status: loanApplicationStatusEnum,
  partnerNote: z.string().trim().max(1000).optional().nullable(),
});

export type UpdateLoanApplicationStatusInput = z.infer<typeof updateLoanApplicationStatusSchema>;

export interface FinancingProductSummary {
  id: string;
  partnerName: string;
  title: string;
  description: string;
  minAmountNgn: number;
  maxAmountNgn: number;
  interestRateSummary: string;
  repaymentTerms: string;
  eligibilityText: string;
  requiredDocuments: string[];
  isDemoProduct: boolean;
  isActive: boolean;
  createdAt: string;
}

export const DEFAULT_FINANCING_PRODUCTS: FinancingProductSummary[] = [
  {
    id: "prod-badc-1",
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
    createdAt: "2026-11-16T00:00:00.000Z",
  },
  {
    id: "prod-bipc-2",
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
    createdAt: "2026-11-16T00:00:00.000Z",
  },
  {
    id: "prod-coop-3",
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
    createdAt: "2026-11-16T00:00:00.000Z",
  },
];

export interface TransactionSummarySnapshot {
  completedOrdersCount: number;
  totalSalesVolumeNgn: number;
  averageOrderNgn: number;
  activeListingsCount: number;
  kycStatus: string;
  farmerFullName: string;
  locationLga: string;
  tenureDays: number;
  estimatedCreditScore: number;
  recommendedTier: string;
  generatedAt: string;
}

export interface LoanApplicationSummary {
  id: string;
  referenceCode: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  productId: string;
  productTitle: string;
  partnerName: string;
  requestedAmountNgn: number;
  purpose: string;
  consentRecordId: string;
  transactionSummarySnapshot: TransactionSummarySnapshot;
  documentKeys: string[];
  status: LoanApplicationStatus;
  partnerNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditEligibilitySummary {
  farmerId: string;
  kycStatus: string;
  completedOrdersCount: number;
  totalSalesVolumeNgn: number;
  activeListingsCount: number;
  accountAgeDays: number;
  creditScore: number;
  recommendedTier: string;
  maxRecommendedCreditNgn: number;
  eligibilityFactors: {
    label: string;
    score: number;
    maxScore: number;
    achieved: boolean;
  }[];
}

