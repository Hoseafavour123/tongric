import { getDb } from "@/lib/db.ts";
import { createPrismaFinanceRepository } from "./finance-prisma-repo.ts";
import {
  computeCreditEligibilityWithRepo,
  createLoanApplicationWithRepo,
  updateLoanApplicationStatusWithRepo,
  FinanceActorContext,
} from "./finance-core.ts";
import {
  CreateFinancingProductInput,
  CreateLoanApplicationInput,
  FinancingProductSummary,
  LoanApplicationSummary,
  CreditEligibilitySummary,
  LoanApplicationStatus,
} from "./schemas.ts";

function getRepo() {
  return createPrismaFinanceRepository(getDb());
}

export async function listActiveFinancingProducts(): Promise<FinancingProductSummary[]> {
  return getRepo().listActiveProducts();
}

export async function getAllFinancingProducts(): Promise<FinancingProductSummary[]> {
  return getRepo().getAllProducts();
}

export async function getFinancingProductById(id: string): Promise<FinancingProductSummary | null> {
  return getRepo().getProductById(id);
}

export async function createFinancingProduct(input: CreateFinancingProductInput): Promise<FinancingProductSummary> {
  return getRepo().createProduct(input);
}

export async function getFarmerCreditEligibility(farmerId: string): Promise<CreditEligibilitySummary> {
  return computeCreditEligibilityWithRepo(getRepo(), farmerId);
}

export async function createLoanApplication(
  actor: FinanceActorContext,
  input: CreateLoanApplicationInput,
): Promise<LoanApplicationSummary> {
  return createLoanApplicationWithRepo(getRepo(), actor, input);
}

export async function getLoanApplicationById(id: string): Promise<LoanApplicationSummary | null> {
  return getRepo().getApplicationById(id);
}

export async function getLoanApplicationByReference(referenceCode: string): Promise<LoanApplicationSummary | null> {
  return getRepo().getApplicationByReference(referenceCode);
}

export async function listLoanApplicationsForFarmer(farmerId: string): Promise<LoanApplicationSummary[]> {
  return getRepo().listApplicationsForFarmer(farmerId);
}

export async function listAllLoanApplications(status?: LoanApplicationStatus): Promise<LoanApplicationSummary[]> {
  return getRepo().listAllApplications(status);
}

export async function updateLoanApplicationStatus(
  actor: FinanceActorContext,
  applicationId: string,
  newStatus: LoanApplicationStatus,
  partnerNote?: string | null,
): Promise<LoanApplicationSummary> {
  return updateLoanApplicationStatusWithRepo(getRepo(), actor, applicationId, newStatus, partnerNote);
}

