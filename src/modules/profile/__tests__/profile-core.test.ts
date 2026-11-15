import { describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "@/lib/errors";
import {
  getBuyerProfileWithRepo,
  getFarmerProfileWithRepo,
  getTransportProfileWithRepo,
  saveBuyerProfileWithRepo,
  saveFarmerProfileWithRepo,
  saveTransportProfileWithRepo,
} from "../profile-core";
import type { ProfileRepository } from "../profile-repo";
import type {
  BuyerProfileSummary,
  FarmerProfileSummary,
  TransportProfileSummary,
  UpsertBuyerProfileInput,
  UpsertFarmerProfileInput,
  UpsertTransportProfileInput,
} from "../schemas";

describe("Profile Core Domain Logic", () => {
  function createMockRepo() {
    const farmerProfiles = new Map<string, FarmerProfileSummary>();
    const buyerProfiles = new Map<string, BuyerProfileSummary>();
    const transportProfiles = new Map<string, TransportProfileSummary>();
    const audits: unknown[] = [];

    const repo: ProfileRepository = {
      findFarmerProfileByUserId: vi.fn(async (userId: string) => {
        return farmerProfiles.get(userId) ?? null;
      }),
      upsertFarmerProfile: vi.fn(
        async (userId: string, input: UpsertFarmerProfileInput) => {
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
          farmerProfiles.set(userId, profile);
          return profile;
        },
      ),
      findBuyerProfileByUserId: vi.fn(async (userId: string) => {
        return buyerProfiles.get(userId) ?? null;
      }),
      upsertBuyerProfile: vi.fn(
        async (userId: string, input: UpsertBuyerProfileInput) => {
          const profile: BuyerProfileSummary = {
            id: `byr_${userId}`,
            userId,
            state: "Benue",
            businessName: input.businessName,
            buyerType: input.buyerType,
            operatingLga: input.operatingLga,
            primaryMarket: input.primaryMarket ?? null,
            cropsSourced: input.cropsSourced,
            verificationStatus: "UNVERIFIED",
            verifiedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            isComplete: true,
          };
          buyerProfiles.set(userId, profile);
          return profile;
        },
      ),
      findTransportProfileByUserId: vi.fn(async (userId: string) => {
        return transportProfiles.get(userId) ?? null;
      }),
      upsertTransportProfile: vi.fn(
        async (userId: string, input: UpsertTransportProfileInput) => {
          const profile: TransportProfileSummary = {
            id: `trn_${userId}`,
            userId,
            operatorName: input.operatorName,
            vehicleTypes: input.vehicleTypes,
            maxCapacityKg: input.maxCapacityKg,
            operatingLgas: input.operatingLgas,
            isAvailable: input.isAvailable,
            pricingModel: input.pricingModel,
            verificationStatus: "UNVERIFIED",
            verifiedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            isComplete: true,
          };
          transportProfiles.set(userId, profile);
          return profile;
        },
      ),
      recordProfileAudit: vi.fn(async (audit) => {
        audits.push(audit);
      }),
      createVerificationDocument: vi.fn(),
      findVerificationDocumentById: vi.fn(),
      findLatestVerificationDocumentByUserId: vi.fn(),
      listVerificationDocuments: vi.fn(),
      updateVerificationStatus: vi.fn(),
    };

    return { repo, farmerProfiles, buyerProfiles, transportProfiles, audits };
  }

  describe("Farmer Profile Operations", () => {
    it("retrieves null when farmer profile does not exist and profile summary when it does", async () => {
      const { repo } = createMockRepo();

      const notFound = await getFarmerProfileWithRepo(repo, "usr_1");
      expect(notFound).toBeNull();

      await repo.upsertFarmerProfile("usr_1", {
        lga: "gboko",
        community: "Tse-Agber",
        primaryCrops: ["yam"],
        cooperativeName: null,
        farmSizeHectares: null,
      });

      const found = await getFarmerProfileWithRepo(repo, "usr_1");
      expect(found).not.toBeNull();
      expect(found?.lga).toBe("gboko");
      expect(found?.isComplete).toBe(true);
    });

    it("allows farmer to save their own profile and records audit trail", async () => {
      const { repo, audits } = createMockRepo();

      const result = await saveFarmerProfileWithRepo(
        repo,
        { id: "usr_farmer_1", role: "FARMER" },
        "usr_farmer_1",
        {
          lga: "Gboko",
          community: "Tse-Agber",
          primaryCrops: ["yam", "soybeans"],
          cooperativeName: "Gboko Cooperative",
          farmSizeHectares: 2.5,
        },
        { ipAddress: "197.210.10.5" },
      );

      expect(result.userId).toBe("usr_farmer_1");
      expect(result.lga).toBe("gboko");
      expect(result.primaryCrops).toEqual(["yam", "soybeans"]);

      expect(audits).toHaveLength(1);
      expect(audits[0]).toEqual(
        expect.objectContaining({
          action: "FARMER_PROFILE_UPDATED",
          actorUserId: "usr_farmer_1",
          entityId: result.id,
          entityType: "FarmerProfile",
          ipAddress: "197.210.10.5",
        }),
      );
    });

    it("allows ADMIN operator to update profile on behalf of a farmer", async () => {
      const { repo, audits } = createMockRepo();

      const result = await saveFarmerProfileWithRepo(
        repo,
        { id: "usr_admin_1", role: "ADMIN" },
        "usr_farmer_2",
        {
          lga: "makurdi",
          community: "Wurukum",
          primaryCrops: ["rice"],
        },
      );

      expect(result.userId).toBe("usr_farmer_2");
      expect(audits[0]).toEqual(
        expect.objectContaining({
          action: "FARMER_PROFILE_UPDATED",
          actorUserId: "usr_admin_1",
        }),
      );
    });

    it("rejects when non-admin attempts to update another user's farmer profile", async () => {
      const { repo } = createMockRepo();

      await expect(
        saveFarmerProfileWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          "usr_farmer_3",
          {
            lga: "gboko",
            community: "Tse-Agber",
            primaryCrops: ["yam"],
          },
        ),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });
  });

  describe("Buyer Profile Operations", () => {
    it("retrieves null when buyer profile does not exist and profile summary when it does", async () => {
      const { repo } = createMockRepo();

      const notFound = await getBuyerProfileWithRepo(repo, "usr_buyer_1");
      expect(notFound).toBeNull();

      await repo.upsertBuyerProfile("usr_buyer_1", {
        businessName: "Benue Agro Processors Ltd",
        buyerType: "PROCESSOR",
        operatingLga: "makurdi",
        primaryMarket: "Modern Market",
        cropsSourced: ["yam", "soybeans"],
      });

      const found = await getBuyerProfileWithRepo(repo, "usr_buyer_1");
      expect(found).not.toBeNull();
      expect(found?.businessName).toBe("Benue Agro Processors Ltd");
      expect(found?.buyerType).toBe("PROCESSOR");
      expect(found?.isComplete).toBe(true);
    });

    it("allows buyer to save their own profile and records audit trail", async () => {
      const { repo, audits } = createMockRepo();

      const result = await saveBuyerProfileWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        "usr_buyer_1",
        {
          businessName: "Makurdi Grain Wholesalers",
          buyerType: "WHOLESALER",
          operatingLga: "Makurdi",
          primaryMarket: "Wurukum Market",
          cropsSourced: ["rice", "maize"],
        },
        { ipAddress: "197.210.10.12" },
      );

      expect(result.userId).toBe("usr_buyer_1");
      expect(result.businessName).toBe("Makurdi Grain Wholesalers");
      expect(result.operatingLga).toBe("makurdi");

      expect(audits).toHaveLength(1);
      expect(audits[0]).toEqual(
        expect.objectContaining({
          action: "BUYER_PROFILE_UPDATED",
          actorUserId: "usr_buyer_1",
          entityId: result.id,
          entityType: "BuyerProfile",
          ipAddress: "197.210.10.12",
        }),
      );
    });

    it("allows ADMIN operator to update profile on behalf of a buyer", async () => {
      const { repo, audits } = createMockRepo();

      const result = await saveBuyerProfileWithRepo(
        repo,
        { id: "usr_admin_1", role: "ADMIN" },
        "usr_buyer_2",
        {
          businessName: "Benue Food Hub",
          buyerType: "RETAILER",
          operatingLga: "gboko",
          cropsSourced: ["cassava"],
        },
      );

      expect(result.userId).toBe("usr_buyer_2");
      expect(audits[0]).toEqual(
        expect.objectContaining({
          action: "BUYER_PROFILE_UPDATED",
          actorUserId: "usr_admin_1",
        }),
      );
    });

    it("rejects when non-admin attempts to update another buyer's profile", async () => {
      const { repo } = createMockRepo();

      await expect(
        saveBuyerProfileWithRepo(
          repo,
          { id: "usr_farmer_1", role: "FARMER" },
          "usr_buyer_3",
          {
            businessName: "Other Business",
            buyerType: "RETAILER",
            operatingLga: "makurdi",
            cropsSourced: ["yam"],
          },
        ),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });
  });

  describe("Transport Profile Operations", () => {
    it("retrieves null when transporter profile does not exist and profile summary when it does", async () => {
      const { repo } = createMockRepo();

      const notFound = await getTransportProfileWithRepo(repo, "usr_trans_1");
      expect(notFound).toBeNull();

      await repo.upsertTransportProfile("usr_trans_1", {
        operatorName: "Tersoo Haulage",
        vehicleTypes: ["PICKUP", "VAN"],
        maxCapacityKg: 3000,
        operatingLgas: ["gboko", "makurdi"],
        isAvailable: true,
        pricingModel: "QUOTE_ON_REQUEST",
      });

      const found = await getTransportProfileWithRepo(repo, "usr_trans_1");
      expect(found).not.toBeNull();
      expect(found?.operatorName).toBe("Tersoo Haulage");
      expect(found?.maxCapacityKg).toBe(3000);
      expect(found?.isComplete).toBe(true);
    });

    it("allows transporter to save their own profile and records audit trail", async () => {
      const { repo, audits } = createMockRepo();

      const result = await saveTransportProfileWithRepo(
        repo,
        { id: "usr_trans_1", role: "TRANSPORT_PROVIDER" },
        "usr_trans_1",
        {
          operatorName: "Benue Valley Logistics",
          vehicleTypes: ["TRUCK"],
          maxCapacityKg: 10000,
          operatingLgas: ["gboko", "makurdi", "katsina-ala"],
          isAvailable: true,
          pricingModel: "FIXED_RATE_CARD",
        },
        { ipAddress: "197.210.10.88" },
      );

      expect(result.userId).toBe("usr_trans_1");
      expect(result.operatorName).toBe("Benue Valley Logistics");
      expect(result.pricingModel).toBe("FIXED_RATE_CARD");

      expect(audits).toHaveLength(1);
      expect(audits[0]).toEqual(
        expect.objectContaining({
          action: "TRANSPORTER_PROFILE_UPDATED",
          actorUserId: "usr_trans_1",
          entityId: result.id,
          entityType: "TransportProfile",
          ipAddress: "197.210.10.88",
        }),
      );
    });

    it("allows ADMIN operator to update profile on behalf of a transporter", async () => {
      const { repo, audits } = createMockRepo();

      const result = await saveTransportProfileWithRepo(
        repo,
        { id: "usr_admin_1", role: "ADMIN" },
        "usr_trans_2",
        {
          operatorName: "Express Agbese",
          vehicleTypes: ["MOTORCYCLE_TRICYCLE"],
          maxCapacityKg: 400,
          operatingLgas: ["agatu"],
          isAvailable: false,
          pricingModel: "QUOTE_ON_REQUEST",
        },
      );

      expect(result.userId).toBe("usr_trans_2");
      expect(result.isAvailable).toBe(false);
      expect(audits[0]).toEqual(
        expect.objectContaining({
          action: "TRANSPORTER_PROFILE_UPDATED",
          actorUserId: "usr_admin_1",
        }),
      );
    });

    it("rejects when non-admin attempts to update another transporter's profile", async () => {
      const { repo } = createMockRepo();

      await expect(
        saveTransportProfileWithRepo(
          repo,
          { id: "usr_farmer_1", role: "FARMER" },
          "usr_trans_3",
          {
            operatorName: "Unauthorized Edit",
            vehicleTypes: ["VAN"],
            maxCapacityKg: 1500,
            operatingLgas: ["makurdi"],
            isAvailable: true,
            pricingModel: "QUOTE_ON_REQUEST",
          },
        ),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });
  });
});
