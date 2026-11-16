import {
  CreateFinancingProductInput,
  FinancingProductSummary,
  LoanApplicationSummary,
  TransactionSummarySnapshot,
  LoanApplicationStatus,
} from "./schemas.ts";

export interface FinanceRepository {
  listActiveProducts(): Promise<FinancingProductSummary[]>;
  getAllProducts(): Promise<FinancingProductSummary[]>;
  getProductById(id: string): Promise<FinancingProductSummary | null>;
  createProduct(input: CreateFinancingProductInput): Promise<FinancingProductSummary>;

  createApplication(params: {
    referenceCode: string;
    farmerId: string;
    productId: string;
    requestedAmountNgn: number;
    purpose: string;
    consentRecordId: string;
    snapshot: TransactionSummarySnapshot;
    documentKeys: string[];
  }): Promise<LoanApplicationSummary>;

  getApplicationById(id: string): Promise<LoanApplicationSummary | null>;
  getApplicationByReference(referenceCode: string): Promise<LoanApplicationSummary | null>;
  listApplicationsForFarmer(farmerId: string): Promise<LoanApplicationSummary[]>;
  listAllApplications(status?: LoanApplicationStatus): Promise<LoanApplicationSummary[]>;

  updateApplicationStatus(
    id: string,
    status: LoanApplicationStatus,
    partnerNote?: string | null,
  ): Promise<LoanApplicationSummary>;

  getFarmerCommercialMetrics(farmerId: string): Promise<{
    completedOrdersCount: number;
    totalSalesVolumeNgn: number;
    averageOrderNgn: number;
    activeListingsCount: number;
    kycStatus: string;
    farmerFullName: string;
    locationLga: string;
    accountCreatedAt: Date;
  }>;
}

