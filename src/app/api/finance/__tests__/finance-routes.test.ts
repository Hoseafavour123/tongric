import { describe, expect, it, vi, beforeEach } from "vitest";

const mockRequireAuth = vi.fn();
const mockListActiveFinancingProducts = vi.fn();
const mockGetFarmerCreditEligibility = vi.fn();
const mockCreateLoanApplication = vi.fn();
const mockListLoanApplicationsForFarmer = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/finance", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/finance")>();
  return {
    ...actual,
    listActiveFinancingProducts: (...args: unknown[]) => mockListActiveFinancingProducts(...args),
    getFarmerCreditEligibility: (...args: unknown[]) => mockGetFarmerCreditEligibility(...args),
    createLoanApplication: (...args: unknown[]) => mockCreateLoanApplication(...args),
    listLoanApplicationsForFarmer: (...args: unknown[]) => mockListLoanApplicationsForFarmer(...args),
  };
});

import { GET as getProductsRoute } from "../products/route.ts";
import { GET as getEligibilityRoute } from "../eligibility/route.ts";
import { GET as getApplicationsRoute, POST as postApplicationRoute } from "../applications/route.ts";

describe("Finance API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/finance/products returns active financing products", async () => {
    mockListActiveFinancingProducts.mockResolvedValueOnce([
      { id: "prod-1", title: "BADC Crop Loan", minAmountNgn: 30000 },
    ]);

    const res = await getProductsRoute();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });

  it("GET /api/finance/eligibility returns farmer credit score", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      sessionId: "s1",
      user: { id: "farmer-1", role: "FARMER" },
    });

    mockGetFarmerCreditEligibility.mockResolvedValueOnce({
      creditScore: 85,
      recommendedTier: "Tier 3",
    });

    const res = await getEligibilityRoute();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.creditScore).toBe(85);
  });

  it("GET /api/finance/applications returns user loan applications", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      sessionId: "s1",
      user: { id: "farmer-1", role: "FARMER" },
    });

    mockListLoanApplicationsForFarmer.mockResolvedValueOnce([
      { id: "app-1", referenceCode: "LN-202611-ABCDE" },
    ]);

    const res = await getApplicationsRoute();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });

  it("POST /api/finance/applications submits application with consent", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      sessionId: "s1",
      user: { id: "farmer-1", role: "FARMER" },
    });

    mockCreateLoanApplication.mockResolvedValueOnce({
      id: "app-1",
      referenceCode: "LN-202611-ABCDE",
      status: "SUBMITTED",
    });

    const req = new Request("http://localhost/api/finance/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: "prod-1",
        requestedAmountNgn: 50000,
        purpose: "Fertilizer purchase for Guma farm",
        consentGiven: true,
      }),
    });

    const res = await postApplicationRoute(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.referenceCode).toBe("LN-202611-ABCDE");
  });
});

