import { describe, expect, it } from "vitest";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import {
  createProduceListingWithRepo,
  getProduceListingWithRepo,
  listActiveListingsWithRepo,
  listFarmerListingsWithRepo,
} from "../marketplace-core.ts";
import type {
  CreateListingData,
  MarketplaceAuditInput,
  MarketplaceFilterOptions,
  MarketplaceRepository,
} from "../marketplace-repo.ts";
import type { ProduceListingSummary } from "../schemas.ts";

function createMockListing(overrides: Partial<ProduceListingSummary> = {}): ProduceListingSummary {
  return {
    id: "list-1",
    farmerId: "farmer-1",
    farmerName: "Terna Iorfa",
    farmerPhone: "+2348011112233",
    title: "50 Bags of Yam (Grade B)",
    cropCode: "yam",
    cropCategory: "tuber",
    grade: "GRADE_B",
    quantity: 50,
    unitCode: "bag",
    estimatedWeightKg: 2500,
    pricePerUnit: 35000,
    currency: "NGN",
    minOrderQuantity: 5,
    isNegotiable: true,
    availabilityStatus: "AVAILABLE_NOW",
    harvestDate: null,
    state: "Benue",
    lga: "gboko",
    community: "Tor-Donga Settlement",
    description: "Good quality yams",
    status: "ACTIVE",
    primaryPhotoUrl: "https://example.com/yam.webp",
    photos: [
      {
        id: "p-1",
        listingId: "list-1",
        fileStoragePath: "marketplace/farmer-1/yam.webp",
        publicUrl: "https://example.com/yam.webp",
        mimeType: "image/webp",
        sizeBytes: 120000,
        isPrimary: true,
        createdAt: "2026-11-14T09:00:00.000Z",
      },
    ],
    createdAt: "2026-11-14T09:00:00.000Z",
    updatedAt: "2026-11-14T09:00:00.000Z",
    ...overrides,
  };
}

function createMockRepo(): MarketplaceRepository & {
  audits: MarketplaceAuditInput[];
  listings: ProduceListingSummary[];
} {
  const audits: MarketplaceAuditInput[] = [];
  const listings: ProduceListingSummary[] = [];

  return {
    audits,
    listings,
    async createListing(data: CreateListingData): Promise<ProduceListingSummary> {
      const summary = createMockListing({
        id: `list-${listings.length + 1}`,
        farmerId: data.farmerId,
        title: data.title,
        cropCode: data.cropCode,
        cropCategory: data.cropCategory,
        grade: data.grade,
        quantity: data.quantity,
        unitCode: data.unitCode,
        estimatedWeightKg: data.estimatedWeightKg,
        pricePerUnit: data.pricePerUnit,
        currency: data.currency,
        minOrderQuantity: data.minOrderQuantity,
        isNegotiable: data.isNegotiable,
        availabilityStatus: data.availabilityStatus,
        harvestDate: data.harvestDate ?? null,
        state: data.state,
        lga: data.lga,
        community: data.community,
        description: data.description ?? null,
        photos: data.photos.map((p, idx) => ({
          id: `p-${idx + 1}`,
          listingId: `list-${listings.length + 1}`,
          fileStoragePath: p.fileStoragePath,
          publicUrl: p.publicUrl,
          mimeType: p.mimeType,
          sizeBytes: p.sizeBytes,
          isPrimary: p.isPrimary ?? (idx === 0),
          createdAt: new Date().toISOString(),
        })),
      });
      listings.push(summary);
      return summary;
    },
    async getListingById(id: string): Promise<ProduceListingSummary | null> {
      return listings.find((l) => l.id === id) ?? null;
    },
    async listListingsByFarmer(farmerId: string): Promise<ProduceListingSummary[]> {
      return listings.filter((l) => l.farmerId === farmerId);
    },
    async listActiveListings(filter?: MarketplaceFilterOptions): Promise<ProduceListingSummary[]> {
      const results = listings.filter((l) => {
        if (filter?.cropCode && l.cropCode !== filter.cropCode) return false;
        if (filter?.lga && l.lga !== filter.lga) return false;
        if (filter?.grade && l.grade !== filter.grade) return false;
        if (filter?.availabilityStatus && l.availabilityStatus !== filter.availabilityStatus) return false;
        return l.status === "ACTIVE";
      });

      if (filter?.sortBy === "price_asc") {
        results.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
      } else if (filter?.sortBy === "price_desc") {
        results.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
      } else if (filter?.sortBy === "quantity_desc") {
        results.sort((a, b) => b.quantity - a.quantity);
      }

      return results;
    },
    async recordMarketplaceAudit(entry: MarketplaceAuditInput): Promise<void> {
      audits.push(entry);
    },
  };
}

describe("marketplace-core", () => {
  const sampleInput = {
    cropCode: "yam",
    grade: "GRADE_B" as const,
    quantity: 50,
    unitCode: "bag",
    pricePerUnit: 35000,
    currency: "NGN",
    minOrderQuantity: 5,
    isNegotiable: true,
    availabilityStatus: "AVAILABLE_NOW" as const,
    harvestDate: null,
    state: "Benue" as const,
    lga: "gboko",
    community: "Tor-Donga Settlement",
    description: "Sound tuber batch",
    photos: [],
  };

  describe("createProduceListingWithRepo", () => {
    it("rejects non-farmer non-admin users with ForbiddenError", async () => {
      const repo = createMockRepo();
      const buyerActor = { id: "user-1", role: "BUYER" };

      await expect(
        createProduceListingWithRepo(repo, buyerActor, sampleInput),
      ).rejects.toThrow(ForbiddenError);

      const transportActor = { id: "user-2", role: "TRANSPORT_PROVIDER" };
      await expect(
        createProduceListingWithRepo(repo, transportActor, sampleInput),
      ).rejects.toThrow(ForbiddenError);
    });

    it("allows registered farmer to create a listing with auto-calculated weight and title", async () => {
      const repo = createMockRepo();
      const farmerActor = { id: "farmer-10", role: "FARMER" };

      const listing = await createProduceListingWithRepo(
        repo,
        farmerActor,
        sampleInput,
        { ipAddress: "192.168.1.100" },
      );

      expect(listing.farmerId).toBe("farmer-10");
      expect(listing.cropCode).toBe("yam");
      expect(listing.cropCategory).toBe("tuber");
      // 50 bags of yam @ 50 kg/bag = 2500 kg
      expect(listing.estimatedWeightKg).toBe(2500);
      expect(listing.title).toBe("50 Bags of Yam (Grade B)");

      // Verify audit trail
      expect(repo.audits).toHaveLength(1);
      expect(repo.audits[0]).toMatchObject({
        actorUserId: "farmer-10",
        action: "LISTING_CREATED",
        entityType: "PRODUCE_LISTING",
        entityId: listing.id,
        ipAddress: "192.168.1.100",
      });
      expect(repo.audits[0]?.metadata).toMatchObject({
        cropCode: "yam",
        cropCategory: "tuber",
        quantity: 50,
        estimatedWeightKg: 2500,
      });
    });

    it("allows admin to create a produce listing on behalf of farmers", async () => {
      const repo = createMockRepo();
      const adminActor = { id: "admin-1", role: "ADMIN" };

      const listing = await createProduceListingWithRepo(
        repo,
        adminActor,
        {
          ...sampleInput,
          cropCode: "tomatoes",
          unitCode: "basket",
          quantity: 20,
          grade: "GRADE_A",
        },
      );

      expect(listing.cropCategory).toBe("horticulture");
      // 20 baskets @ 30 kg/basket = 600 kg
      expect(listing.estimatedWeightKg).toBe(600);
      expect(listing.title).toBe("20 Baskets of Tomatoes (Grade A)");
    });
  });

  describe("getProduceListingWithRepo", () => {
    it("returns the produce listing when found", async () => {
      const repo = createMockRepo();
      const created = await repo.createListing({
        ...sampleInput,
        farmerId: "f-1",
        title: "50 Bags of Yam",
        cropCategory: "tuber",
        estimatedWeightKg: 2500,
      });

      const found = await getProduceListingWithRepo(repo, created.id);
      expect(found.id).toBe(created.id);
      expect(found.title).toBe(created.title);
    });

    it("throws NotFoundError when produce listing does not exist", async () => {
      const repo = createMockRepo();
      await expect(getProduceListingWithRepo(repo, "non-existent")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("listFarmerListingsWithRepo", () => {
    it("returns listings belonging specifically to the requested farmer", async () => {
      const repo = createMockRepo();
      await repo.createListing({
        ...sampleInput,
        farmerId: "farmer-A",
        title: "Batch 1",
        cropCategory: "tuber",
        estimatedWeightKg: 2500,
      });
      await repo.createListing({
        ...sampleInput,
        farmerId: "farmer-B",
        title: "Batch 2",
        cropCategory: "tuber",
        estimatedWeightKg: 2500,
      });

      const farmerAListings = await listFarmerListingsWithRepo(repo, "farmer-A");
      expect(farmerAListings).toHaveLength(1);
      expect(farmerAListings[0]?.farmerId).toBe("farmer-A");
    });
  });

  describe("listActiveListingsWithRepo", () => {
    it("filters active listings by cropCode and lga", async () => {
      const repo = createMockRepo();
      await repo.createListing({
        ...sampleInput,
        farmerId: "f-1",
        title: "Gboko Yams",
        cropCode: "yam",
        lga: "gboko",
        cropCategory: "tuber",
        estimatedWeightKg: 2500,
      });
      await repo.createListing({
        ...sampleInput,
        farmerId: "f-2",
        title: "Katsina-Ala Rice",
        cropCode: "rice",
        lga: "katsina-ala",
        cropCategory: "grain_legume",
        estimatedWeightKg: 2500,
      });

      const yamListings = await listActiveListingsWithRepo(repo, { cropCode: "yam" });
      expect(yamListings).toHaveLength(1);
      expect(yamListings[0]?.cropCode).toBe("yam");

      const gbokoListings = await listActiveListingsWithRepo(repo, { lga: "gboko" });
      expect(gbokoListings).toHaveLength(1);
      expect(gbokoListings[0]?.lga).toBe("gboko");
    });

    it("filters active listings by availabilityStatus", async () => {
      const repo = createMockRepo();
      await repo.createListing({
        ...sampleInput,
        farmerId: "f-1",
        title: "Ready Tomatoes",
        cropCode: "tomatoes",
        availabilityStatus: "AVAILABLE_NOW",
        cropCategory: "horticulture",
        estimatedWeightKg: 1000,
      });
      await repo.createListing({
        ...sampleInput,
        farmerId: "f-2",
        title: "Upcoming Mangoes",
        cropCode: "mangoes",
        availabilityStatus: "UPCOMING_HARVEST",
        harvestDate: "2026-12-01",
        cropCategory: "tree_crop",
        estimatedWeightKg: 1500,
      });

      const readyOnly = await listActiveListingsWithRepo(repo, {
        availabilityStatus: "AVAILABLE_NOW",
      });
      expect(readyOnly).toHaveLength(1);
      expect(readyOnly[0]?.cropCode).toBe("tomatoes");

      const upcomingOnly = await listActiveListingsWithRepo(repo, {
        availabilityStatus: "UPCOMING_HARVEST",
      });
      expect(upcomingOnly).toHaveLength(1);
      expect(upcomingOnly[0]?.cropCode).toBe("mangoes");
    });

    it("sorts active listings by price and quantity", async () => {
      const repo = createMockRepo();
      await repo.createListing({
        ...sampleInput,
        farmerId: "f-1",
        title: "Cheap Yam",
        pricePerUnit: 10000,
        quantity: 20,
        cropCategory: "tuber",
        estimatedWeightKg: 1000,
      });
      await repo.createListing({
        ...sampleInput,
        farmerId: "f-2",
        title: "Expensive Yam",
        pricePerUnit: 50000,
        quantity: 100,
        cropCategory: "tuber",
        estimatedWeightKg: 5000,
      });

      const priceAsc = await listActiveListingsWithRepo(repo, { sortBy: "price_asc" });
      expect(priceAsc[0]?.pricePerUnit).toBe(10000);
      expect(priceAsc[1]?.pricePerUnit).toBe(50000);

      const priceDesc = await listActiveListingsWithRepo(repo, { sortBy: "price_desc" });
      expect(priceDesc[0]?.pricePerUnit).toBe(50000);
      expect(priceDesc[1]?.pricePerUnit).toBe(10000);

      const qtyDesc = await listActiveListingsWithRepo(repo, { sortBy: "quantity_desc" });
      expect(qtyDesc[0]?.quantity).toBe(100);
      expect(qtyDesc[1]?.quantity).toBe(20);
    });
  });
});
