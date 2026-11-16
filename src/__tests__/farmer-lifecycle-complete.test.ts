import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/audit", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/db", () => ({
  getDb: () => ({
    consentRecord: {
      create: vi.fn().mockResolvedValue({ id: "cnst_mock_123" }),
    },
    loanApplication: {
      create: vi.fn(),
    },
    notification: {
      create: vi.fn().mockResolvedValue({
        id: "notif_mock_123",
        userId: "usr_farmer_1",
        type: "FINANCE_UPDATE",
        title: "Application Received",
        message: "Your application has been received.",
        data: {},
        isRead: false,
        readAt: null,
        createdAt: new Date(),
      }),
    },
  }),
}));

import {
  normalizeRecoveryCode,
  registerUserWithRepo,
  loginUserWithRepo,
  validateSessionWithRepo,
  type AuthRepository,
  type CreateRegisteredUserParams,
  type AuthAccountStatus,
  type AuthUserRole,
} from "@/modules/auth";
import {
  getFarmerProfileWithRepo,
  saveFarmerProfileWithRepo,
  submitVerificationDocumentWithRepo,
  type ProfileRepository,
  type FarmerProfileSummary,
  type VerificationDocumentSummary,
} from "@/modules/profile";
import {
  createProduceListingWithRepo,
  getProduceListingWithRepo,
  listActiveListingsWithRepo,
  type MarketplaceRepository,
  type ProduceListingSummary,
} from "@/modules/marketplace";
import {
  createOfferWithRepo,
  respondToOfferWithRepo,
  getWaybillWithRepo,
  verifyPickupPinWithRepo,
  type OrdersRepository,
  type CreateOfferData,
  type RespondOfferData,
  type ListingOfferMetadata,
  type CommercialOfferDetailSummary,
  type OrderDetailSummary,
  type WaybillSummary,
} from "@/modules/orders";
import {
  createExchangeListingWithRepo,
  calculateBarterRatio,
  type BarterRepository,
  type ExchangeListingSummary,
} from "@/modules/barter";
import {
  createLoanApplicationWithRepo,
  DEFAULT_FINANCING_PRODUCTS,
  type FinanceRepository,
  type LoanApplicationSummary,
} from "@/modules/finance";
import { estimateWeightKg } from "@/modules/i18n/catalogs";

describe("Complete End-to-End Farmer Role Journey", () => {
  let registeredFarmerId = "";
  let farmerRecoveryCode = "";
  let sessionToken = "";
  let createdListingId = "";
  let receivedOfferId = "";
  let confirmedOrderId = "";

  const buyerId = "usr_buyer_99";

  // Mock In-Memory Databases
  const usersDb = new Map<string, {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string | null;
    passwordHash: string;
    recoveryCodeHash: string;
    role: AuthUserRole;
    accountStatus: AuthAccountStatus;
    preferredLanguageCode: string;
  }>();

  const sessionsDb = new Map<string, {
    id: string;
    userId: string;
    sessionHash: string;
    expiresAt: Date;
    createdAt: Date;
  }>();

  const farmerProfilesDb = new Map<string, FarmerProfileSummary>();
  const verificationDocsDb = new Map<string, VerificationDocumentSummary>();
  const listingsDb = new Map<string, ProduceListingSummary>();
  const offersDb = new Map<string, CommercialOfferDetailSummary>();
  const ordersDb = new Map<string, OrderDetailSummary>();
  const barterListingsDb = new Map<string, ExchangeListingSummary>();
  const loanApplicationsDb = new Map<string, LoanApplicationSummary>();

  // -------------------------------------------------------------------------
  // Feature 1: Farmer Registration
  // -------------------------------------------------------------------------
  describe("Feature 1: Farmer Registration", () => {
    it("successfully registers a new smallholder farmer with phone, Tiv language, and NDPA consent", async () => {
      const mockAuthRepo: AuthRepository = {
        async findExistingIdentity(input: { phoneNumber: string; email: string | null }) {
          let phoneExists = false;
          let emailExists = false;
          for (const u of usersDb.values()) {
            if (u.phoneNumber === input.phoneNumber) phoneExists = true;
            if (input.email && u.email === input.email) emailExists = true;
          }
          return { phoneExists, emailExists };
        },
        async userExistsById(userId: string) { return usersDb.has(userId); },
        async createRegisteredUser(params: CreateRegisteredUserParams) {
          const id = `usr_farmer_${Date.now()}`;
          const record = {
            id,
            fullName: params.fullName,
            phoneNumber: params.phoneNumber,
            email: params.email,
            passwordHash: params.passwordHash,
            recoveryCodeHash: params.recoveryCodeHash,
            role: params.role,
            accountStatus: "ACTIVE" as const,
            preferredLanguageCode: params.preferredLanguageCode,
          };
          usersDb.set(id, record);
          return {
            id,
            fullName: record.fullName,
            phoneNumber: record.phoneNumber,
            email: record.email,
            role: record.role,
            accountStatus: record.accountStatus,
            preferredLanguageCode: record.preferredLanguageCode,
            createdAt: new Date(),
          };
        },
        async findUserByPhoneForLogin(phoneNumber: string) {
          for (const u of usersDb.values()) {
            if (u.phoneNumber === phoneNumber) return u;
          }
          return null;
        },
        async createSession(params: { userId: string; sessionHash: string; expiresAt: Date; ipAddress: string | null; userAgent: string | null }) {
          const record = {
            id: `sess_${Date.now()}`,
            userId: params.userId,
            sessionHash: params.sessionHash,
            expiresAt: params.expiresAt,
            createdAt: new Date(),
          };
          sessionsDb.set(params.sessionHash, record);
          return record;
        },
        async findValidSession(sessionHash: string) {
          const s = sessionsDb.get(sessionHash);
          if (!s || s.expiresAt < new Date()) return null;
          const u = usersDb.get(s.userId);
          if (!u) return null;
          return {
            sessionId: s.id,
            user: {
              id: u.id,
              fullName: u.fullName,
              phoneNumber: u.phoneNumber,
              email: u.email,
              role: u.role,
              accountStatus: u.accountStatus,
              preferredLanguageCode: u.preferredLanguageCode,
              createdAt: new Date(),
            },
          };
        },
        async revokeSession(sessionHash: string) { return sessionsDb.delete(sessionHash); },
        async revokeAllUserSessions(userId: string) {
          let count = 0;
          for (const [k, v] of sessionsDb.entries()) {
            if (v.userId === userId) {
              sessionsDb.delete(k);
              count++;
            }
          }
          return count;
        },
        async findActiveRecoveryCodes() { return null; },
        async consumeRecoveryCodeAndResetPassword() {},
        async recordSecurityAudit() {},
      };

      const registrationResult = await registerUserWithRepo(
        mockAuthRepo,
        {
          fullName: "Terna Aondover",
          phoneNumber: "08012345678",
          password: "SecurePassword123!",
          confirmPassword: "SecurePassword123!",
          role: "FARMER",
          preferredLanguageCode: "tiv",
          acceptedPrivacyPolicy: true,
          acceptedOptionalUpdates: true,
        },
        {
          activeLanguageCodes: new Set(["en", "tiv", "ido", "ha"]),
          ipAddress: "127.0.0.1",
          userAgent: "Vitest E2E",
        },
      );

      expect(registrationResult.user.fullName).toBe("Terna Aondover");
      expect(registrationResult.user.role).toBe("FARMER");
      expect(registrationResult.user.phoneNumber).toBe("+2348012345678");
      expect(registrationResult.user.preferredLanguageCode).toBe("tiv");
      expect(registrationResult.recoveryCode).toMatch(/^TGR-[A-Z0-9]{5}-[A-Z0-9]{5}$/);

      registeredFarmerId = registrationResult.user.id;
      farmerRecoveryCode = registrationResult.recoveryCode;
    });

    it("verifies the farmer recovery code is normalized and recoverable", () => {
      const normalized = normalizeRecoveryCode(farmerRecoveryCode);
      expect(normalized).toBe(farmerRecoveryCode);
    });
  });

  // -------------------------------------------------------------------------
  // Feature 2: Farmer Authentication & Session
  // -------------------------------------------------------------------------
  describe("Feature 2: Farmer Login & Session Management", () => {
    it("authenticates the farmer credentials and creates a 14-day session", async () => {
      const mockAuthRepo: AuthRepository = {
        async findExistingIdentity() { return { phoneExists: false, emailExists: false }; },
        async userExistsById(userId: string) { return usersDb.has(userId); },
        async createRegisteredUser() { throw new Error("not implemented"); },
        async findUserByPhoneForLogin(phoneNumber: string) {
          for (const u of usersDb.values()) {
            if (u.phoneNumber === phoneNumber) return u;
          }
          return null;
        },
        async createSession(params: { userId: string; sessionHash: string; expiresAt: Date; ipAddress: string | null; userAgent: string | null }) {
          const record = {
            id: `sess_${Date.now()}`,
            userId: params.userId,
            sessionHash: params.sessionHash,
            expiresAt: params.expiresAt,
            createdAt: new Date(),
          };
          sessionsDb.set(params.sessionHash, record);
          return record;
        },
        async findValidSession(sessionHash: string) {
          const s = sessionsDb.get(sessionHash);
          if (!s || s.expiresAt < new Date()) return null;
          const u = usersDb.get(s.userId);
          if (!u) return null;
          return {
            sessionId: s.id,
            user: {
              id: u.id,
              fullName: u.fullName,
              phoneNumber: u.phoneNumber,
              email: u.email,
              role: u.role,
              accountStatus: u.accountStatus,
              preferredLanguageCode: u.preferredLanguageCode,
              createdAt: new Date(),
            },
          };
        },
        async revokeSession() { return true; },
        async revokeAllUserSessions() { return 0; },
        async findActiveRecoveryCodes() { return null; },
        async consumeRecoveryCodeAndResetPassword() {},
        async recordSecurityAudit() {},
      };

      const loginResult = await loginUserWithRepo(
        mockAuthRepo,
        {
          phoneNumber: "08012345678",
          password: "SecurePassword123!",
        },
        { ipAddress: "127.0.0.1", userAgent: "Vitest E2E" },
      );

      expect(loginResult.user.id).toBe(registeredFarmerId);
      expect(loginResult.user.role).toBe("FARMER");
      expect(loginResult.user.preferredLanguageCode).toBe("tiv");
      expect(loginResult.token).toBeTruthy();
      expect(loginResult.expiresAt.getTime()).toBeGreaterThan(Date.now());

      sessionToken = loginResult.token;
    });

    it("validates the active session token", async () => {
      const mockAuthRepo: AuthRepository = {
        async findExistingIdentity() { return { phoneExists: false, emailExists: false }; },
        async userExistsById(userId: string) { return usersDb.has(userId); },
        async createRegisteredUser() { throw new Error("not implemented"); },
        async findUserByPhoneForLogin() { return null; },
        async createSession() { throw new Error("not implemented"); },
        async findValidSession(sessionHash: string) {
          const s = sessionsDb.get(sessionHash);
          if (!s || s.expiresAt < new Date()) return null;
          const u = usersDb.get(s.userId);
          if (!u) return null;
          return {
            sessionId: s.id,
            user: {
              id: u.id,
              fullName: u.fullName,
              phoneNumber: u.phoneNumber,
              email: u.email,
              role: u.role,
              accountStatus: u.accountStatus,
              preferredLanguageCode: u.preferredLanguageCode,
              createdAt: new Date(),
            },
          };
        },
        async revokeSession() { return true; },
        async revokeAllUserSessions() { return 0; },
        async findActiveRecoveryCodes() { return null; },
        async consumeRecoveryCodeAndResetPassword() {},
        async recordSecurityAudit() {},
      };

      const validatedSession = await validateSessionWithRepo(mockAuthRepo, sessionToken);
      expect(validatedSession).not.toBeNull();
      expect(validatedSession?.user.id).toBe(registeredFarmerId);
      expect(validatedSession?.user.role).toBe("FARMER");
    });
  });

  // -------------------------------------------------------------------------
  // Feature 3: Farm Profile Management
  // -------------------------------------------------------------------------
  describe("Feature 3: Farm Profile Management", () => {
    it("creates and updates the farmer's agricultural profile in Gboko LGA", async () => {
      const mockProfileRepo: ProfileRepository = {
        async findFarmerProfileByUserId(userId: string) {
          return farmerProfilesDb.get(userId) ?? null;
        },
        async upsertFarmerProfile(userId, input) {
          const profile: FarmerProfileSummary = {
            id: `prf_${userId}`,
            userId,
            state: "Benue",
            lga: input.lga,
            community: input.community,
            primaryCrops: input.primaryCrops,
            cooperativeName: input.cooperativeName ?? null,
            farmSizeHectares: input.farmSizeHectares ?? null,
            verificationStatus: "UNVERIFIED",
            verifiedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            isComplete: true,
          };
          farmerProfilesDb.set(userId, profile);
          return profile;
        },
        async findBuyerProfileByUserId() { return null; },
        async upsertBuyerProfile() { throw new Error("not implemented"); },
        async findTransportProfileByUserId() { return null; },
        async upsertTransportProfile() { throw new Error("not implemented"); },
        async findVerificationDocumentById() { return null; },
        async findLatestVerificationDocumentByUserId() { return null; },
        async createVerificationDocument() { throw new Error("not implemented"); },
        async listVerificationDocuments() { return []; },
        async updateVerificationStatus() { throw new Error("not implemented"); },
        async recordProfileAudit() {},
      };

      const savedProfile = await saveFarmerProfileWithRepo(
        mockProfileRepo,
        { id: registeredFarmerId, role: "FARMER" },
        registeredFarmerId,
        {
          lga: "gboko",
          community: "Tor-Donga Settlement",
          primaryCrops: ["yam", "soybeans"],
          cooperativeName: "Mbaav Farmers Cooperative",
          farmSizeHectares: 3.5,
        },
      );

      expect(savedProfile.lga).toBe("gboko");
      expect(savedProfile.community).toBe("Tor-Donga Settlement");
      expect(savedProfile.primaryCrops).toEqual(["yam", "soybeans"]);
      expect(savedProfile.cooperativeName).toBe("Mbaav Farmers Cooperative");
      expect(savedProfile.verificationStatus).toBe("UNVERIFIED");
      expect(savedProfile.isComplete).toBe(true);

      const retrieved = await getFarmerProfileWithRepo(mockProfileRepo, registeredFarmerId);
      expect(retrieved?.userId).toBe(registeredFarmerId);
    });
  });

  // -------------------------------------------------------------------------
  // Feature 4: Farmer KYC / Identity Verification Submission
  // -------------------------------------------------------------------------
  describe("Feature 4: Farmer KYC / Identity Verification", () => {
    it("submits a Voter's Card for identity verification", async () => {
      const mockProfileRepo: ProfileRepository = {
        async findFarmerProfileByUserId(userId: string) {
          return farmerProfilesDb.get(userId) ?? null;
        },
        async upsertFarmerProfile() { throw new Error("not implemented"); },
        async findBuyerProfileByUserId() { return null; },
        async upsertBuyerProfile() { throw new Error("not implemented"); },
        async findTransportProfileByUserId() { return null; },
        async upsertTransportProfile() { throw new Error("not implemented"); },
        async findLatestVerificationDocumentByUserId(userId: string) {
          return verificationDocsDb.get(userId) ?? null;
        },
        async createVerificationDocument(params) {
          const doc: VerificationDocumentSummary = {
            id: `doc_${Date.now()}`,
            userId: params.userId,
            documentType: params.documentType,
            documentNumber: params.documentNumber ?? null,
            fileStoragePath: params.fileStoragePath,
            fileMimeType: params.fileMimeType,
            fileSizeBytes: params.fileSizeBytes,
            status: "PENDING",
            reviewedAt: null,
            reviewedByUserId: null,
            notes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          verificationDocsDb.set(params.userId, doc);
          return doc;
        },
        async findVerificationDocumentById() { return null; },
        async listVerificationDocuments() { return []; },
        async updateVerificationStatus() { throw new Error("not implemented"); },
        async recordProfileAudit() {},
      };

      const submission = await submitVerificationDocumentWithRepo(
        mockProfileRepo,
        { id: registeredFarmerId, role: "FARMER" },
        registeredFarmerId,
        {
          documentType: "VOTERS_CARD",
          documentNumber: "90F5B1234567890",
        },
        {
          storagePath: `private/verifications/${registeredFarmerId}/voters-card.jpg`,
          mimeType: "image/jpeg",
          sizeBytes: 245000,
        },
      );

      expect(submission.documentType).toBe("VOTERS_CARD");
      expect(submission.status).toBe("PENDING");
      expect(submission.fileStoragePath).toContain("voters-card.jpg");
    });
  });

  // -------------------------------------------------------------------------
  // Feature 5: Farmer Produce Listing Creation
  // -------------------------------------------------------------------------
  describe("Feature 5: Produce Listing Creation with Weight Estimation", () => {
    it("calculates accurate total weight in kg for 100 bags of Yam", () => {
      const estimatedKg = estimateWeightKg(100, "bag");
      expect(estimatedKg).toBe(5000); // 50kg per standard bag = 5,000kg
    });

    it("creates a harvest listing with Grade A quality, pricing, and photo metadata", async () => {
      const mockMarketplaceRepo: MarketplaceRepository = {
        async createListing(data) {
          const id = `list_${Date.now()}`;
          const listing: ProduceListingSummary = {
            id,
            farmerId: data.farmerId,
            farmerName: "Terna Aondover",
            farmerPhone: "+2348012345678",
            title: "100 Bags of Yam (Grade A)",
            cropCode: data.cropCode,
            cropCategory: "tuber",
            grade: data.grade,
            quantity: data.quantity,
            unitCode: data.unitCode,
            estimatedWeightKg: data.estimatedWeightKg,
            pricePerUnit: data.pricePerUnit,
            currency: data.currency,
            minOrderQuantity: data.minOrderQuantity,
            isNegotiable: data.isNegotiable,
            availabilityStatus: data.availabilityStatus,
            harvestDate: data.harvestDate,
            state: data.state,
            lga: data.lga,
            community: data.community,
            description: data.description,
            status: "ACTIVE",
            primaryPhotoUrl: data.photos[0]?.publicUrl ?? null,
            photos: data.photos.map((p, idx) => ({
              id: `p_${idx}`,
              listingId: id,
              fileStoragePath: p.fileStoragePath,
              publicUrl: p.publicUrl,
              mimeType: p.mimeType,
              sizeBytes: p.sizeBytes,
              isPrimary: p.isPrimary ?? idx === 0,
              createdAt: new Date().toISOString(),
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          listingsDb.set(id, listing);
          return listing;
        },
        async getListingById(id) { return listingsDb.get(id) ?? null; },
        async listActiveListings() { return Array.from(listingsDb.values()); },
        async listListingsByFarmer(farmerId) {
          return Array.from(listingsDb.values()).filter((l) => l.farmerId === farmerId);
        },
        async recordMarketplaceAudit() {},
      };

      const listing = await createProduceListingWithRepo(
        mockMarketplaceRepo,
        { id: registeredFarmerId, role: "FARMER" },
        {
          cropCode: "yam",
          grade: "GRADE_A",
          quantity: 100,
          unitCode: "bag",
          pricePerUnit: 45000,
          currency: "NGN",
          minOrderQuantity: 5,
          isNegotiable: true,
          availabilityStatus: "AVAILABLE_NOW",
          harvestDate: null,
          state: "Benue",
          lga: "gboko",
          community: "Tor-Donga Settlement",
          description: "Freshly harvested premium tubers from Gboko fertile plains.",
          photos: [
            {
              fileStoragePath: "marketplace/yam-harvest-1.jpg",
              publicUrl: "https://res.cloudinary.com/demo/yam-1.jpg",
              mimeType: "image/jpeg",
              sizeBytes: 154000,
              isPrimary: true,
            },
          ],
        },
      );

      expect(listing.title).toBe("100 Bags of Yam (Grade A)");
      expect(listing.cropCode).toBe("yam");
      expect(listing.grade).toBe("GRADE_A");
      expect(listing.estimatedWeightKg).toBe(5000);
      expect(listing.pricePerUnit).toBe(45000);
      expect(listing.photos).toHaveLength(1);
      expect(listing.primaryPhotoUrl).toBe("https://res.cloudinary.com/demo/yam-1.jpg");

      createdListingId = listing.id;
    });
  });

  // -------------------------------------------------------------------------
  // Feature 6: Marketplace Discovery
  // -------------------------------------------------------------------------
  describe("Feature 6: Marketplace Discovery", () => {
    it("discovers the farmer's listing with crop and LGA filters", async () => {
      const mockMarketplaceRepo: MarketplaceRepository = {
        async createListing() { throw new Error("not implemented"); },
        async getListingById(id) { return listingsDb.get(id) ?? null; },
        async listActiveListings(filter) {
          let all = Array.from(listingsDb.values());
          if (filter?.cropCode) all = all.filter((l) => l.cropCode === filter.cropCode);
          if (filter?.lga) all = all.filter((l) => l.lga === filter.lga);
          return all;
        },
        async listListingsByFarmer() { return []; },
        async recordMarketplaceAudit() {},
      };

      const results = await listActiveListingsWithRepo(
        mockMarketplaceRepo,
        { cropCode: "yam", lga: "gboko" },
      );

      expect(results).toHaveLength(1);
      expect(results[0]!.id).toBe(createdListingId);
      expect(results[0]!.farmerName).toBe("Terna Aondover");

      const detail = await getProduceListingWithRepo(mockMarketplaceRepo, createdListingId);
      expect(detail).not.toBeNull();
      expect(detail?.farmerPhone).toBe("+2348012345678");
    });
  });

  // -------------------------------------------------------------------------
  // Feature 7: Wholesale Buyer Offer & Farmer Acceptance
  // -------------------------------------------------------------------------
  describe("Feature 7: Wholesale Offer & Farmer Negotiation", () => {
    it("buyer creates an offer for 40 bags of Yam", async () => {
      const mockOrdersRepo: OrdersRepository = {
        async getListingForOffer(listingId: string): Promise<ListingOfferMetadata | null> {
          const l = listingsDb.get(listingId);
          if (!l) return null;
          return {
            id: l.id,
            farmerId: l.farmerId,
            title: l.title,
            cropCode: l.cropCode,
            unitCode: l.unitCode,
            quantity: l.quantity,
            pricePerUnit: l.pricePerUnit,
            minOrderQuantity: l.minOrderQuantity,
            status: l.status,
            lga: l.lga,
            community: l.community,
            primaryPhotoUrl: l.primaryPhotoUrl,
          };
        },
        async createOffer(data: CreateOfferData) {
          const id = `off_${Date.now()}`;
          const offer: CommercialOfferDetailSummary = {
            id,
            offerCode: data.offerCode,
            listingId: data.listingId,
            listingTitle: "100 Bags of Yam (Grade A)",
            cropCode: "yam",
            isPerishable: false,
            primaryPhotoUrl: null,
            buyerId: data.buyerId,
            buyerName: "Emeka Okonkwo",
            buyerPhone: "+2348022222222",
            farmerId: registeredFarmerId,
            farmerName: "Terna Aondover",
            farmerPhone: "+2348012345678",
            status: "PENDING",
            quantity: data.quantity,
            unitCode: data.unitCode,
            unitPrice: data.unitPrice,
            currency: "NGN",
            totalAmount: data.totalAmount,
            fulfillmentMode: data.fulfillmentMode,
            destinationLocation: data.destinationLocation ?? null,
            proposedCollectionDate: data.proposedCollectionDate ?? null,
            expiresAt: data.expiresAt.toISOString(),
            isExpired: false,
            counterRoundCount: 0,
            lastActionById: data.buyerId,
            lastActionByName: "Emeka Okonkwo",
            listingQuantity: 100,
            listingUnitPrice: 45000,
            listingMinOrderQuantity: 5,
            listingLga: "gboko",
            listingCommunity: "Tor-Donga Settlement",
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          offersDb.set(id, offer);
          return offer;
        },
        async getOfferById(id: string) { return offersDb.get(id) ?? null; },
        async listOffersByUser() { return []; },
        async respondToOffer() { throw new Error("not implemented"); },
        async createOrderFromAcceptedOffer() { throw new Error("not implemented"); },
        async getOrderById() { return null; },
        async listOrdersByUser() { return []; },
        async updateOrderStatus() { throw new Error("not implemented"); },
        async cancelOrder() { throw new Error("not implemented"); },
        async disputeOrder() { throw new Error("not implemented"); },
        async verifyPickupPin() { throw new Error("not implemented"); },
        async verifyDeliveryPin() { throw new Error("not implemented"); },
        async getWaybillByOrderId() { return null; },
        async recordOrderAudit() {},
      };

      const offer = await createOfferWithRepo(
        mockOrdersRepo,
        { id: buyerId, role: "BUYER" },
        {
          listingId: createdListingId,
          quantity: 40,
          unitPrice: 42000,
          fulfillmentMode: "BUYER_ARRANGES_PICKUP",
          destinationLocation: "Makurdi North Bank",
          proposedCollectionDate: "2026-11-25",
          note: "Ready for direct farm-gate collection.",
        },
      );

      expect(offer.status).toBe("PENDING");
      expect(offer.quantity).toBe(40);
      expect(offer.totalAmount).toBe(40 * 42000);
      receivedOfferId = offer.id;
    });

    it("farmer reviews and accepts the purchase proposal, generating a confirmed order", async () => {
      const mockOrdersRepo: OrdersRepository = {
        async getListingForOffer() { return null; },
        async createOffer() { throw new Error("not implemented"); },
        async getOfferById(id: string) { return offersDb.get(id) ?? null; },
        async listOffersByUser() { return []; },
        async respondToOffer(offerId: string, data: RespondOfferData) {
          const off = offersDb.get(offerId)!;
          off.status = data.newStatus;
          off.lastActionById = data.actorUserId;
          return off;
        },
        async createOrderFromAcceptedOffer(offerId: string) {
          const off = offersDb.get(offerId)!;
          off.status = "ACCEPTED";
          const orderId = `ord_${Date.now()}`;
          const order: OrderDetailSummary = {
            id: orderId,
            orderCode: "ORD-202611-99881",
            offerId: off.id,
            listingId: off.listingId,
            listingTitle: off.listingTitle ?? "100 Bags of Yam (Grade A)",
            cropCode: off.cropCode ?? "yam",
            isPerishable: false,
            primaryPhotoUrl: null,
            buyerId: off.buyerId,
            buyerName: off.buyerName ?? "Emeka Okonkwo",
            buyerPhone: off.buyerPhone ?? "+2348022222222",
            farmerId: off.farmerId,
            farmerName: off.farmerName ?? "Terna Aondover",
            farmerPhone: off.farmerPhone ?? "+2348012345678",
            quantity: off.quantity,
            unitCode: off.unitCode,
            estimatedWeightKg: 2000,
            unitPrice: off.unitPrice,
            currency: "NGN",
            totalAmount: off.totalAmount,
            fulfillmentMode: off.fulfillmentMode,
            destinationLocation: off.destinationLocation,
            proposedCollectionDate: off.proposedCollectionDate,
            status: "CONFIRMED",
            paymentArrangementNote: "Direct settlement at farm gate",
            pickupPin: "4829",
            deliveryPin: "7193",
            pickupVerifiedAt: null,
            deliveryVerifiedAt: null,
            statusEvents: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          ordersDb.set(orderId, order);
          return { order, autoDeclinedOfferIds: [] };
        },
        async getOrderById(id: string) { return ordersDb.get(id) ?? null; },
        async listOrdersByUser() { return []; },
        async updateOrderStatus() { throw new Error("not implemented"); },
        async cancelOrder() { throw new Error("not implemented"); },
        async disputeOrder() { throw new Error("not implemented"); },
        async verifyPickupPin() { throw new Error("not implemented"); },
        async verifyDeliveryPin() { throw new Error("not implemented"); },
        async getWaybillByOrderId() { return null; },
        async recordOrderAudit() {},
      };

      const responseResult = await respondToOfferWithRepo(
        mockOrdersRepo,
        { id: registeredFarmerId, role: "FARMER" },
        receivedOfferId,
        { action: "ACCEPT", note: "Accepted. Please dispatch pickup vehicle." },
      );

      expect(responseResult.offer.status).toBe("ACCEPTED");
      expect(responseResult.order).not.toBeNull();
      expect(responseResult.order?.status).toBe("CONFIRMED");
      expect(responseResult.order?.totalAmount).toBe(1680000);

      confirmedOrderId = responseResult.order!.id;
    });
  });

  // -------------------------------------------------------------------------
  // Feature 8: Order Fulfillment, Handover Security PINs & Waybill
  // -------------------------------------------------------------------------
  describe("Feature 8: Order Fulfillment, Handover PINs & Waybill", () => {
    it("generates 4-digit security PINs and Section 19 compliant waybill", async () => {
      const order = ordersDb.get(confirmedOrderId)!;
      expect(order.pickupPin).toMatch(/^\d{4}$/);
      expect(order.deliveryPin).toMatch(/^\d{4}$/);

      const mockOrdersRepo: OrdersRepository = {
        async getListingForOffer() { return null; },
        async createOffer() { throw new Error("not implemented"); },
        async getOfferById() { return null; },
        async listOffersByUser() { return []; },
        async respondToOffer() { throw new Error("not implemented"); },
        async createOrderFromAcceptedOffer() { throw new Error("not implemented"); },
        async getOrderById(id: string) { return ordersDb.get(id) ?? null; },
        async listOrdersByUser() { return []; },
        async updateOrderStatus() { throw new Error("not implemented"); },
        async cancelOrder() { throw new Error("not implemented"); },
        async disputeOrder() { throw new Error("not implemented"); },
        async verifyPickupPin() { throw new Error("not implemented"); },
        async verifyDeliveryPin() { throw new Error("not implemented"); },
        async getWaybillByOrderId(orderId: string): Promise<WaybillSummary | null> {
          const ord = ordersDb.get(orderId);
          if (!ord) return null;
          return {
            waybillNumber: `WB-202611-88771`,
            orderId: ord.id,
            orderCode: ord.orderCode,
            cropCode: ord.cropCode,
            quantity: ord.quantity,
            unitCode: ord.unitCode,
            estimatedWeightKg: ord.estimatedWeightKg,
            totalAmount: ord.totalAmount,
            currency: ord.currency,
            corridorRoute: "Gboko ⇄ Makurdi",
            estimatedFreightFee: 35000,
            pickupLga: "Gboko",
            pickupCommunity: "Tor-Donga Settlement",
            destinationLocation: ord.destinationLocation ?? "Makurdi",
            farmerName: ord.farmerName ?? "Terna Aondover",
            farmerPhone: ord.farmerPhone ?? "+2348012345678",
            buyerName: ord.buyerName ?? "Emeka Okonkwo",
            buyerPhone: ord.buyerPhone ?? "+2348022222222",
            transporterName: "Benue Express Logistics",
            transporterPhone: "+2348033333333",
            status: ord.status,
            pickupVerifiedAt: ord.pickupVerifiedAt ?? null,
            deliveryVerifiedAt: ord.deliveryVerifiedAt ?? null,
            createdAt: new Date().toISOString(),
          };
        },
        async recordOrderAudit() {},
      };

      const waybill = await getWaybillWithRepo(
        mockOrdersRepo,
        { id: registeredFarmerId, role: "FARMER" },
        confirmedOrderId,
      );

      expect(waybill).not.toBeNull();
      expect(waybill?.waybillNumber).toContain("WB-202611-");
      expect(waybill?.corridorRoute).toBe("Gboko ⇄ Makurdi");
      expect(waybill?.farmerName).toBe("Terna Aondover");
    });

    it("verifies pickup PIN on cargo collection and updates order status to COLLECTED", async () => {
      const order = ordersDb.get(confirmedOrderId)!;
      const validPin = order.pickupPin!;

      const mockOrdersRepo: OrdersRepository = {
        async getListingForOffer() { return null; },
        async createOffer() { throw new Error("not implemented"); },
        async getOfferById() { return null; },
        async listOffersByUser() { return []; },
        async respondToOffer() { throw new Error("not implemented"); },
        async createOrderFromAcceptedOffer() { throw new Error("not implemented"); },
        async getOrderById(id: string) { return ordersDb.get(id) ?? null; },
        async listOrdersByUser() { return []; },
        async updateOrderStatus() { throw new Error("not implemented"); },
        async cancelOrder() { throw new Error("not implemented"); },
        async disputeOrder() { throw new Error("not implemented"); },
        async verifyPickupPin(orderId: string, pin: string) {
          const ord = ordersDb.get(orderId)!;
          if (ord.pickupPin !== pin) throw new Error("Invalid pickup PIN");
          ord.status = "COLLECTED";
          ord.pickupVerifiedAt = new Date().toISOString();
          return ord;
        },
        async verifyDeliveryPin() { throw new Error("not implemented"); },
        async getWaybillByOrderId() { return null; },
        async recordOrderAudit() {},
      };

      const updatedOrder = await verifyPickupPinWithRepo(
        mockOrdersRepo,
        { id: buyerId, role: "BUYER" },
        confirmedOrderId,
        { pin: validPin },
      );

      expect(updatedOrder.status).toBe("COLLECTED");
      expect(updatedOrder.pickupVerifiedAt).not.toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Feature 9: Farmer Barter / Produce Swap & Parity Valuation
  // -------------------------------------------------------------------------
  describe("Feature 9: Farmer Barter / Produce Exchange & Parity Valuation", () => {
    it("calculates fair crop exchange ratio between Maize and Soybeans based on Benue baseline values", () => {
      const parity = calculateBarterRatio({
        offeredCropCode: "maize",
        offeredQuantity: 50,
        offeredUnitCode: "bag",
        requestedCropCode: "soybeans",
        requestedUnitCode: "bag",
      });

      expect(parity.estimatedOfferedValueNgn).toBe(50 * 38000);
      expect(parity.estimatedRequestedUnitValueNgn).toBe(45000);
      expect(parity.recommendedExchangeRatio).toBe(0.84);
      expect(parity.suggestedCounterpartQuantity).toBe(42.2);
      expect(parity.fairValueEquivalenceNote).toContain("50 bag of maize");
    });

    it("creates a barter exchange listing offering Maize for Soybeans", async () => {
      const mockBarterRepo: BarterRepository = {
        async createListing(farmerId, data) {
          const id = `barter_${Date.now()}`;
          const listing: ExchangeListingSummary = {
            id,
            ownerFarmerId: farmerId,
            ownerFarmerName: "Terna Aondover",
            ownerFarmerPhone: "+2348012345678",
            offeredItemType: data.offeredItemType,
            offeredCropId: data.offeredCropId ?? null,
            offeredTitle: data.offeredTitle,
            offeredDescription: data.offeredDescription,
            offeredQty: data.offeredQty,
            offeredUnit: data.offeredUnit,
            desiredDescription: data.desiredDescription,
            desiredQty: data.desiredQty ?? null,
            desiredUnit: data.desiredUnit ?? null,
            locationLga: data.locationLga,
            status: "OPEN",
            offersCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          barterListingsDb.set(id, listing);
          return listing;
        },
        async getListingById(id) { return barterListingsDb.get(id) ?? null; },
        async listListings() { return Array.from(barterListingsDb.values()); },
        async updateListingStatus() { throw new Error("not implemented"); },
        async createOffer() { throw new Error("not implemented"); },
        async getOfferById() { return null; },
        async listOffersForListing() { return []; },
        async listOffersByFarmer() { return []; },
        async createAgreement() { throw new Error("not implemented"); },
        async getAgreementById() { return null; },
        async listAgreementsForFarmer() { return []; },
        async confirmAgreementSide() { throw new Error("not implemented"); },
      };

      const barter = await createExchangeListingWithRepo(
        mockBarterRepo,
        { userId: registeredFarmerId, role: "FARMER" },
        {
          offeredItemType: "CROP",
          offeredTitle: "50 Bags of Clean Yellow Maize",
          offeredDescription: "Well dried Benue yellow maize suitable for poultry feed or milling.",
          offeredQty: 50,
          offeredUnit: "bag",
          desiredDescription: "High quality Soybeans bags for seed multiplication.",
          desiredQty: 40,
          desiredUnit: "bag",
          locationLga: "gboko",
        },
      );

      expect(barter.offeredTitle).toBe("50 Bags of Clean Yellow Maize");
      expect(barter.offeredQty).toBe(50);
      expect(barter.locationLga).toBe("gboko");
      expect(barter.status).toBe("OPEN");
    });
  });

  // -------------------------------------------------------------------------
  // Feature 10: Agricultural Cooperative Credit Application
  // -------------------------------------------------------------------------
  describe("Feature 10: Agricultural Cooperative Credit Application", () => {
    it("submits a seasonal input loan application with BADC cooperative facility and NDPA consent", async () => {
      const mockFinanceRepo: FinanceRepository = {
        async getProductById(id) {
          const product = DEFAULT_FINANCING_PRODUCTS.find((p) => p.id === id);
          return product ?? null;
        },
        async getAllProducts() { return DEFAULT_FINANCING_PRODUCTS; },
        async listActiveProducts() { return DEFAULT_FINANCING_PRODUCTS.filter((p) => p.isActive); },
        async createProduct() { throw new Error("not implemented"); },
        async createApplication(params) {
          const id = `loan_${Date.now()}`;
          const application: LoanApplicationSummary = {
            id,
            referenceCode: params.referenceCode,
            farmerId: params.farmerId,
            farmerName: "Terna Aondover",
            farmerPhone: "+2348012345678",
            productId: params.productId,
            productTitle: "Seasonal Grain & Tuber Working Capital Facility",
            partnerName: "Benue Agricultural Development Corporation (BADC)",
            requestedAmountNgn: params.requestedAmountNgn,
            purpose: params.purpose,
            consentRecordId: params.consentRecordId,
            transactionSummarySnapshot: params.snapshot,
            documentKeys: params.documentKeys,
            status: "SUBMITTED",
            partnerNote: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          loanApplicationsDb.set(id, application);
          return application;
        },
        async getApplicationById(id) { return loanApplicationsDb.get(id) ?? null; },
        async getApplicationByReference() { return null; },
        async listApplicationsForFarmer(farmerId) {
          return Array.from(loanApplicationsDb.values()).filter((a) => a.farmerId === farmerId);
        },
        async listAllApplications() { return Array.from(loanApplicationsDb.values()); },
        async updateApplicationStatus() { throw new Error("not implemented"); },
        async getFarmerCommercialMetrics() {
          return {
            completedOrdersCount: 1,
            totalSalesVolumeNgn: 1680000,
            averageOrderNgn: 1680000,
            activeListingsCount: 1,
            kycStatus: "VERIFIED",
            farmerFullName: "Terna Aondover",
            locationLga: "gboko",
            accountCreatedAt: new Date(Date.now() - 30 * 86400000),
          };
        },
      };

      const loanApp = await createLoanApplicationWithRepo(
        mockFinanceRepo,
        { userId: registeredFarmerId, role: "FARMER" },
        {
          productId: "prod-badc-1",
          requestedAmountNgn: 100000,
          purpose: "Seasonal input purchase for hybrid seeds and certified fertilizer.",
          consentGiven: true,
          documentKeys: ["voters-card.jpg"],
        },
      );

      expect(loanApp.requestedAmountNgn).toBe(100000);
      expect(loanApp.status).toBe("SUBMITTED");
      expect(loanApp.farmerName).toBe("Terna Aondover");
      expect(loanApp.partnerName).toContain("BADC");
      expect(loanApp.transactionSummarySnapshot.totalSalesVolumeNgn).toBe(1680000);
    });
  });
});
