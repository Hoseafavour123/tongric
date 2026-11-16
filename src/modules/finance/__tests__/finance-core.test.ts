import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  computeCreditEligibilityWithRepo,
  createLoanApplicationWithRepo,
  updateLoanApplicationStatusWithRepo,
} from "../finance-core.ts";
import { FinanceRepository } from "../finance-repo.ts";

vi.mock("@/lib/audit.ts", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/modules/notifications/notifications.service.ts", () => ({
  dispatchNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/db.ts", () => ({
  getDb: () => ({
    consentRecord: {
      create: vi.fn().mockResolvedValue({ id: "consent-123" }),
    },
  }),
}));

describe("Finance Domain Core & Credit Scoring", () => {
  let mockRepo: FinanceRepository;

  beforeEach(() => {
    mockRepo = {
      listActiveProducts: vi.fn(),
      getAllProducts: vi.fn(),
      getProductById: vi.fn(),
      createProduct: vi.fn(),
      createApplication: vi.fn(),
      getApplicationById: vi.fn(),
      getApplicationByReference: vi.fn(),
      listApplicationsForFarmer: vi.fn(),
      listAllApplications: vi.fn(),
      updateApplicationStatus: vi.fn(),
      getFarmerCommercialMetrics: vi.fn(),
    };
  });

  it("calculates commercial credit readiness score and assigns appropriate facility tier", async () => {
    // Verified farmer with 3 completed orders, active listing, and 30 days tenure
    (mockRepo.getFarmerCommercialMetrics as ReturnType<typeof vi.fn>).mockResolvedValue({
      completedOrdersCount: 3,
      totalSalesVolumeNgn: 450000,
      averageOrderNgn: 150000,
      activeListingsCount: 2,
      kycStatus: "VERIFIED",
      farmerFullName: "Aondona Iorfa",
      locationLga: "Guma",
      accountCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    });

    const eligibility = await computeCreditEligibilityWithRepo(mockRepo, "farmer-1");

    // KYC: 40, Orders: 30, Listings: 10, Tenure: 10 => 90 pts!
    expect(eligibility.creditScore).toBe(90);
    expect(eligibility.recommendedTier).toContain("Tier 3");
    expect(eligibility.maxRecommendedCreditNgn).toBe(500000);
    expect(eligibility.completedOrdersCount).toBe(3);
  });

  it("assigns starter tier to new unverified farmer with zero completed orders", async () => {
    (mockRepo.getFarmerCommercialMetrics as ReturnType<typeof vi.fn>).mockResolvedValue({
      completedOrdersCount: 0,
      totalSalesVolumeNgn: 0,
      averageOrderNgn: 0,
      activeListingsCount: 0,
      kycStatus: "UNVERIFIED",
      farmerFullName: "New Farmer",
      locationLga: "Makurdi",
      accountCreatedAt: new Date(),
    });

    const eligibility = await computeCreditEligibilityWithRepo(mockRepo, "farmer-2");

    // KYC: 10, Orders: 0, Listings: 0, Tenure: 5 => 15 pts!
    expect(eligibility.creditScore).toBe(15);
    expect(eligibility.recommendedTier).toContain("Tier 1");
    expect(eligibility.maxRecommendedCreditNgn).toBe(50000);
  });

  it("rejects loan application if explicit NDPA consent is missing or false", async () => {
    const actor = { userId: "farmer-1", role: "FARMER" };

    (mockRepo.getProductById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "prod-1",
      title: "Seasonal Crop Credit",
      minAmountNgn: 30000,
      maxAmountNgn: 150000,
      isActive: true,
    });

    await expect(
      createLoanApplicationWithRepo(mockRepo, actor, {
        productId: "prod-1",
        requestedAmountNgn: 50000,
        purpose: "Seeds and fertilizer",
        consentGiven: false as unknown as true,
        documentKeys: [],
      }),
    ).rejects.toThrow("Explicit NDPA 2023 data-sharing consent is required");
  });

  it("submits loan application with valid NDPA consent and creates snapshot", async () => {
    const actor = { userId: "farmer-1", role: "FARMER" };

    (mockRepo.getProductById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "prod-1",
      title: "Seasonal Crop Credit",
      partnerName: "BADC",
      minAmountNgn: 30000,
      maxAmountNgn: 150000,
      isActive: true,
    });

    (mockRepo.getFarmerCommercialMetrics as ReturnType<typeof vi.fn>).mockResolvedValue({
      completedOrdersCount: 2,
      totalSalesVolumeNgn: 200000,
      averageOrderNgn: 100000,
      activeListingsCount: 1,
      kycStatus: "VERIFIED",
      farmerFullName: "Aondona Iorfa",
      locationLga: "Gboko",
      accountCreatedAt: new Date(),
    });

    (mockRepo.createApplication as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "app-1",
      referenceCode: "LN-202611-ABCDE",
      farmerId: "farmer-1",
      productId: "prod-1",
      productTitle: "Seasonal Crop Credit",
      requestedAmountNgn: 80000,
      purpose: "Purchasing hybrid seeds",
      status: "SUBMITTED",
    });

    const app = await createLoanApplicationWithRepo(mockRepo, actor, {
      productId: "prod-1",
      requestedAmountNgn: 80000,
      purpose: "Purchasing hybrid seeds",
      consentGiven: true,
      documentKeys: ["DOC-1"],
    });

    expect(app.id).toBe("app-1");
    expect(mockRepo.createApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedAmountNgn: 80000,
        consentRecordId: "consent-123",
        referenceCode: expect.stringMatching(/^LN-\d{6}-[0-9A-Z]{5}$/),
      }),
    );
  });

  it("allows admin to update application status and note", async () => {
    const actorAdmin = { userId: "admin-1", role: "ADMIN" };
    const actorFarmer = { userId: "farmer-1", role: "FARMER" };

    (mockRepo.getApplicationById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "app-1",
      referenceCode: "LN-202611-12345",
      farmerId: "farmer-1",
      status: "UNDER_PARTNER_REVIEW",
    });

    (mockRepo.updateApplicationStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "app-1",
      referenceCode: "LN-202611-12345",
      farmerId: "farmer-1",
      status: "APPROVED",
      partnerNote: "Approved for ₦50,000",
    });

    // Farmer cannot update status
    await expect(
      updateLoanApplicationStatusWithRepo(mockRepo, actorFarmer, "app-1", "APPROVED"),
    ).rejects.toThrow("Only administrators");

    // Admin succeeds
    const updated = await updateLoanApplicationStatusWithRepo(
      mockRepo,
      actorAdmin,
      "app-1",
      "APPROVED",
      "Approved for ₦50,000",
    );

    expect(updated.status).toBe("APPROVED");
    expect(mockRepo.updateApplicationStatus).toHaveBeenCalledWith("app-1", "APPROVED", "Approved for ₦50,000");
  });
});

