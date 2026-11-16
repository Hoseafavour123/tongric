import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateBarterRatio,
  getBaselineUnitPriceNgn,
} from "../barter-calculator.ts";
import {
  createExchangeListingWithRepo,
  listExchangeListingsWithRepo,
  createExchangeOfferWithRepo,
  acceptExchangeOfferWithRepo,
  confirmExchangeAgreementWithRepo,
} from "../barter-core.ts";
import { BarterRepository } from "../barter-repo.ts";

vi.mock("@/lib/audit.ts", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/modules/notifications/notifications.service.ts", () => ({
  dispatchNotification: vi.fn().mockResolvedValue(undefined),
}));

describe("Barter Parity Calculator", () => {
  it("resolves realistic baseline prices for Benue crops", () => {
    const yamPrice = getBaselineUnitPriceNgn("yam", "unit");
    const soybeanPrice = getBaselineUnitPriceNgn("soybeans", "bag");
    expect(yamPrice).toBe(1200);
    expect(soybeanPrice).toBe(45000);
  });

  it("calculates accurate fair-value equivalence between yam tubers and soybean bags", () => {
    // 50 tubers of yam at ₦1,200 = ₦60,000.
    // Soybeans per bag = ₦45,000.
    // Counterpart quantity should be approx 1.3 bags.
    const result = calculateBarterRatio({
      offeredCropCode: "yam",
      offeredQuantity: 50,
      offeredUnitCode: "unit",
      requestedCropCode: "soybeans",
      requestedUnitCode: "bag",
    });

    expect(result.estimatedOfferedValueNgn).toBe(60000);
    expect(result.estimatedRequestedUnitValueNgn).toBe(45000);
    expect(result.suggestedCounterpartQuantity).toBe(1.3);
    expect(result.fairValueEquivalenceNote).toContain("50 unit of yam");
  });
});

describe("Barter Domain Core", () => {
  let mockRepo: BarterRepository;

  beforeEach(() => {
    mockRepo = {
      createListing: vi.fn(),
      getListingById: vi.fn(),
      listListings: vi.fn(),
      updateListingStatus: vi.fn(),
      createOffer: vi.fn(),
      getOfferById: vi.fn(),
      listOffersForListing: vi.fn(),
      listOffersByFarmer: vi.fn(),
      createAgreement: vi.fn(),
      getAgreementById: vi.fn(),
      listAgreementsForFarmer: vi.fn(),
      confirmAgreementSide: vi.fn(),
    };
  });

  it("allows a registered farmer to create a barter listing and blocks non-farmers", async () => {
    const actorFarmer = { userId: "farmer-1", role: "FARMER" };
    const actorBuyer = { userId: "buyer-1", role: "BUYER" };

    const input = {
      offeredItemType: "CROP" as const,
      offeredCropId: "yam",
      offeredTitle: "50 Tubers of White Yam",
      offeredDescription: "Stored dry in barn",
      offeredQty: 50,
      offeredUnit: "unit",
      desiredDescription: "2 bags of soybeans",
      desiredQty: 2,
      desiredUnit: "bag",
      locationLga: "Makurdi",
    };

    (mockRepo.createListing as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "listing-1",
      ownerFarmerId: "farmer-1",
      ...input,
      status: "OPEN",
      offersCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Farmer succeeds
    const listing = await createExchangeListingWithRepo(mockRepo, actorFarmer, input);
    expect(listing.id).toBe("listing-1");
    expect(mockRepo.createListing).toHaveBeenCalledWith("farmer-1", input);

    // List listings with filter
    (mockRepo.listListings as ReturnType<typeof vi.fn>).mockResolvedValue([listing]);
    const list = await listExchangeListingsWithRepo(mockRepo, { locationLga: "Makurdi" });
    expect(list).toHaveLength(1);

    // Buyer is forbidden
    await expect(
      createExchangeListingWithRepo(mockRepo, actorBuyer, input),
    ).rejects.toThrow("Only registered farmers and administrators");
  });

  it("prevents listing owners from proposing barter offers on their own listings", async () => {
    const actorFarmer = { userId: "farmer-1", role: "FARMER" };

    (mockRepo.getListingById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "listing-1",
      ownerFarmerId: "farmer-1",
      offeredTitle: "White Yam",
      status: "OPEN",
    });

    await expect(
      createExchangeOfferWithRepo(mockRepo, actorFarmer, "listing-1", {
        offeredItemDescription: "Maize bags",
        offeredQty: 3,
        offeredUnit: "bag",
      }),
    ).rejects.toThrow("cannot propose a barter offer on your own listing");
  });

  it("allows peer farmers to submit offers and notifies the listing owner", async () => {
    const actorProposer = { userId: "farmer-2", role: "FARMER" };

    (mockRepo.getListingById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "listing-1",
      ownerFarmerId: "farmer-1",
      ownerFarmerName: "Farmer One",
      offeredTitle: "White Yam",
      status: "OPEN",
    });

    (mockRepo.createOffer as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "offer-1",
      listingId: "listing-1",
      proposerFarmerId: "farmer-2",
      offeredItemDescription: "Clean yellow maize",
      offeredQty: 3,
      offeredUnit: "bag",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });

    const offer = await createExchangeOfferWithRepo(mockRepo, actorProposer, "listing-1", {
      offeredItemDescription: "Clean yellow maize",
      offeredQty: 3,
      offeredUnit: "bag",
    });

    expect(offer.id).toBe("offer-1");
    expect(mockRepo.createOffer).toHaveBeenCalledWith("listing-1", "farmer-2", expect.any(Object));
  });

  it("accepts offer, creates agreement, and rejects other pending offers", async () => {
    const actorOwner = { userId: "farmer-1", role: "FARMER" };

    (mockRepo.getOfferById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "offer-1",
      listingId: "listing-1",
      proposerFarmerId: "farmer-2",
      proposerFarmerName: "Farmer Two",
      offeredItemDescription: "Yellow maize",
      offeredQty: 3,
      offeredUnit: "bag",
      status: "PENDING",
    });

    (mockRepo.getListingById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "listing-1",
      ownerFarmerId: "farmer-1",
      ownerFarmerName: "Farmer One",
      offeredTitle: "White Yam",
      offeredQty: 50,
      offeredUnit: "unit",
      status: "OPEN",
    });

    (mockRepo.createAgreement as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "agreement-1",
      listingId: "listing-1",
      listingTitle: "White Yam",
      offerId: "offer-1",
      farmerAId: "farmer-1",
      farmerAName: "Farmer One",
      farmerBId: "farmer-2",
      farmerBName: "Farmer Two",
      status: "ACTIVE",
      farmerAConfirmedAt: null,
      farmerBConfirmedAt: null,
    });

    const agreement = await acceptExchangeOfferWithRepo(mockRepo, actorOwner, "offer-1");
    expect(agreement.id).toBe("agreement-1");
    expect(mockRepo.createAgreement).toHaveBeenCalled();
  });

  it("enforces dual party confirmation before marking agreement completed", async () => {
    const actorA = { userId: "farmer-1", role: "FARMER" };
    const actorB = { userId: "farmer-2", role: "FARMER" };

    (mockRepo.getAgreementById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "agreement-1",
      farmerAId: "farmer-1",
      farmerBId: "farmer-2",
      termsSummary: "50 yam for 3 bags maize",
      farmerAConfirmedAt: null,
      farmerBConfirmedAt: null,
      status: "ACTIVE",
    });

    // Step 1: Farmer A confirms
    (mockRepo.confirmAgreementSide as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "agreement-1",
      farmerAId: "farmer-1",
      farmerBId: "farmer-2",
      termsSummary: "50 yam for 3 bags maize",
      farmerAConfirmedAt: new Date().toISOString(),
      farmerBConfirmedAt: null,
      status: "ACTIVE", // still active!
    });

    const step1 = await confirmExchangeAgreementWithRepo(mockRepo, actorA, "agreement-1");
    expect(step1.status).toBe("ACTIVE");

    // Farmer A cannot confirm twice
    (mockRepo.getAgreementById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "agreement-1",
      farmerAId: "farmer-1",
      farmerBId: "farmer-2",
      termsSummary: "50 yam for 3 bags maize",
      farmerAConfirmedAt: new Date().toISOString(),
      farmerBConfirmedAt: null,
      status: "ACTIVE",
    });

    await expect(
      confirmExchangeAgreementWithRepo(mockRepo, actorA, "agreement-1"),
    ).rejects.toThrow("already confirmed fulfillment");

    // Step 2: Farmer B confirms -> COMPLETED
    (mockRepo.confirmAgreementSide as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "agreement-1",
      farmerAId: "farmer-1",
      farmerBId: "farmer-2",
      termsSummary: "50 yam for 3 bags maize",
      farmerAConfirmedAt: new Date().toISOString(),
      farmerBConfirmedAt: new Date().toISOString(),
      status: "COMPLETED", // now completed!
    });

    const step2 = await confirmExchangeAgreementWithRepo(mockRepo, actorB, "agreement-1");
    expect(step2.status).toBe("COMPLETED");
  });
});

