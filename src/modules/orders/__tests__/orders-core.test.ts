import { describe, expect, it } from "vitest";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  createOfferWithRepo,
  getOfferWithRepo,
  listUserOffersWithRepo,
  respondToOfferWithRepo,
  getOrderWithRepo,
  listOrdersWithRepo,
} from "../orders-core";
import type {
  OrdersRepository,
  CreateOfferData,
  RespondOfferData,
  ListingOfferMetadata,
  OrderAuditInput,
  OrdersFilterOptions,
} from "../orders-repo";
import type {
  CommercialOfferDetailSummary,
  CommercialOfferSummary,
  OrderDetailSummary,
  OrderSummary,
} from "../schemas";

function createMockOrder(
  overrides: Partial<OrderDetailSummary> = {},
): OrderDetailSummary {
  return {
    id: "ord-1",
    orderCode: "ORD-202611-73921",
    offerId: "off-1",
    listingId: "list-1",
    listingTitle: "50 Bags of Yam",
    cropCode: "yam",
    primaryPhotoUrl: null,
    isPerishable: false,
    farmerId: "usr_farmer_1",
    farmerName: "Terna Iorfa",
    farmerPhone: "+2348022223344",
    buyerId: "usr_buyer_1",
    buyerName: "Agro Commercials Ltd",
    buyerPhone: "+2348011112233",
    quantity: 20,
    unitCode: "bag",
    estimatedWeightKg: 1000,
    unitPrice: 30000,
    currency: "NGN",
    totalAmount: 600000,
    fulfillmentMode: "BUYER_ARRANGES_PICKUP",
    destinationLocation: null,
    proposedCollectionDate: "2026-11-20",
    status: "CONFIRMED",
    paymentArrangementNote:
      "Direct settlement between Buyer and Farmer; zero platform fund custody (Section 19)",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusEvents: [
      {
        id: "evt-1",
        orderId: "ord-1",
        fromStatus: null,
        toStatus: "CONFIRMED",
        changedById: "usr_farmer_1",
        changedByName: "Terna Iorfa",
        note: "Order confirmed following accepted purchase terms",
        createdAt: new Date().toISOString(),
      },
    ],
    ...overrides,
  };
}

function createMockDetail(
  overrides: Partial<CommercialOfferDetailSummary> = {},
): CommercialOfferDetailSummary {
  return {
    id: "off-1",
    offerCode: "OFF-202611-12345",
    listingId: "list-1",
    listingTitle: "50 Bags of Yam",
    cropCode: "yam",
    isPerishable: false,
    primaryPhotoUrl: null,
    buyerId: "usr_buyer_1",
    buyerName: "Agro Commercials Ltd",
    buyerPhone: "+2348011112233",
    farmerId: "usr_farmer_1",
    farmerName: "Terna Iorfa",
    farmerPhone: "+2348022223344",
    status: "PENDING",
    quantity: 20,
    unitCode: "bag",
    unitPrice: 30000,
    currency: "NGN",
    totalAmount: 600000,
    fulfillmentMode: "BUYER_ARRANGES_PICKUP",
    destinationLocation: null,
    proposedCollectionDate: "2026-11-20",
    expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    isExpired: false,
    counterRoundCount: 0,
    lastActionById: "usr_buyer_1",
    lastActionByName: "Agro Commercials Ltd",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    listingQuantity: 50,
    listingUnitPrice: 35000,
    listingMinOrderQuantity: 5,
    listingLga: "Gboko",
    listingCommunity: "Tor-Donga",
    messages: [
      {
        id: "msg-1",
        offerId: "off-1",
        senderId: "usr_buyer_1",
        senderName: "Agro Commercials Ltd",
        senderRole: "BUYER",
        action: "INITIATE",
        proposedQuantity: 20,
        proposedUnitPrice: 30000,
        note: "Initial proposal",
        createdAt: new Date().toISOString(),
      },
    ],
    ...overrides,
  };
}

function createMockRepo(
  initialListing?: ListingOfferMetadata,
  initialOffer?: CommercialOfferDetailSummary,
  initialOrder?: OrderDetailSummary,
): OrdersRepository & {
  audits: OrderAuditInput[];
  offer: CommercialOfferDetailSummary | null;
  listing: ListingOfferMetadata | null;
  order: OrderDetailSummary | null;
} {
  const audits: OrderAuditInput[] = [];
  let offer: CommercialOfferDetailSummary | null = initialOffer ?? null;
  let order: OrderDetailSummary | null = initialOrder ?? null;
  const listing: ListingOfferMetadata | null =
    initialListing ?? {
      id: "list-1",
      farmerId: "usr_farmer_1",
      title: "50 Bags of Yam",
      cropCode: "yam",
      unitCode: "bag",
      quantity: 50,
      pricePerUnit: 35000,
      minOrderQuantity: 5,
      status: "ACTIVE",
      lga: "Gboko",
      community: "Tor-Donga",
      primaryPhotoUrl: null,
    };

  return {
    audits,
    get offer() {
      return offer;
    },
    get listing() {
      return listing;
    },
    get order() {
      return order;
    },
    async createOffer(data: CreateOfferData): Promise<CommercialOfferDetailSummary> {
      offer = createMockDetail({
        id: "off-new",
        offerCode: data.offerCode,
        listingId: data.listingId,
        buyerId: data.buyerId,
        farmerId: data.farmerId,
        quantity: data.quantity,
        unitCode: data.unitCode,
        unitPrice: data.unitPrice,
        totalAmount: data.totalAmount,
        fulfillmentMode: data.fulfillmentMode,
        destinationLocation: data.destinationLocation ?? null,
        proposedCollectionDate: data.proposedCollectionDate ?? null,
        expiresAt: data.expiresAt.toISOString(),
      });
      return offer;
    },
    async getOfferById(id: string): Promise<CommercialOfferDetailSummary | null> {
      if (offer && offer.id === id) return offer;
      return null;
    },
    async listOffersByUser(
      _userId: string,
      _filter?: OrdersFilterOptions,
    ): Promise<CommercialOfferSummary[]> {
      void _userId;
      void _filter;
      return offer ? [offer] : [];
    },
    async respondToOffer(
      _offerId: string,
      data: RespondOfferData,
    ): Promise<CommercialOfferDetailSummary> {
      if (!offer) throw new NotFoundError("Not found");
      offer = {
        ...offer,
        status: data.newStatus,
        quantity: data.newQuantity ?? offer.quantity,
        unitPrice: data.newUnitPrice ?? offer.unitPrice,
        totalAmount: data.newTotalAmount ?? offer.totalAmount,
        lastActionById: data.actorUserId,
        counterRoundCount: data.incrementCounterRound
          ? offer.counterRoundCount + 1
          : offer.counterRoundCount,
        messages: [
          ...offer.messages,
          {
            id: `msg-${offer.messages.length + 1}`,
            offerId: offer.id,
            senderId: data.actorUserId,
            action: data.action,
            proposedQuantity: data.newQuantity ?? null,
            proposedUnitPrice: data.newUnitPrice ?? null,
            note: data.note ?? null,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      return offer;
    },
    async getListingForOffer(id: string): Promise<ListingOfferMetadata | null> {
      if (listing && listing.id === id) return listing;
      return null;
    },
    async recordOrderAudit(entry: OrderAuditInput): Promise<void> {
      audits.push(entry);
    },
    async createOrderFromAcceptedOffer(
      offerId: string,
      actorUserId: string,
    ): Promise<{ order: OrderDetailSummary; autoDeclinedOfferIds: string[] }> {
      order = createMockOrder({
        offerId,
        farmerId: actorUserId,
      });
      if (offer) {
        offer = { ...offer, status: "ACCEPTED", lastActionById: actorUserId };
      }
      return { order, autoDeclinedOfferIds: [] };
    },
    async getOrderById(id: string): Promise<OrderDetailSummary | null> {
      if (order && order.id === id) return order;
      return null;
    },
    async listOrdersByUser(
      _userId: string,
      _filter?: OrdersFilterOptions,
    ): Promise<OrderSummary[]> {
      void _userId;
      void _filter;
      return order ? [order] : [];
    },
  };
}

describe("orders-core", () => {
  describe("createOfferWithRepo", () => {
    it("creates offer with valid parameters and logs audit", async () => {
      const repo = createMockRepo();
      const offer = await createOfferWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        {
          listingId: "list-1",
          quantity: 20,
          unitPrice: 32000,
          fulfillmentMode: "BUYER_ARRANGES_PICKUP",
          proposedCollectionDate: "2026-11-20",
          note: "Self pickup",
        },
      );

      expect(offer.quantity).toBe(20);
      expect(offer.unitPrice).toBe(32000);
      expect(offer.totalAmount).toBe(640000);
      expect(repo.audits).toHaveLength(1);
      expect(repo.audits[0]?.action).toBe("OFFER_INITIATED");
    });

    it("rejects offer creation on farmer's own listing", async () => {
      const repo = createMockRepo();
      await expect(
        createOfferWithRepo(
          repo,
          { id: "usr_farmer_1", role: "FARMER" },
          {
            listingId: "list-1",
            quantity: 10,
            unitPrice: 35000,
          },
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it("rejects quantity below minimum order quantity", async () => {
      const repo = createMockRepo();
      await expect(
        createOfferWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          {
            listingId: "list-1",
            quantity: 2, // MOQ is 5
            unitPrice: 35000,
          },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects quantity exceeding available listing stock", async () => {
      const repo = createMockRepo();
      await expect(
        createOfferWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          {
            listingId: "list-1",
            quantity: 100, // available is 50
            unitPrice: 35000,
          },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("differentiates expiry: 24h for perishables vs 72h for staples", async () => {
      const stapleRepo = createMockRepo();
      const stapleOffer = await createOfferWithRepo(
        stapleRepo,
        { id: "usr_buyer_1", role: "BUYER" },
        { listingId: "list-1", quantity: 10, unitPrice: 30000 },
      );
      const stapleHours =
        (new Date(stapleOffer.expiresAt).getTime() - Date.now()) / (3600 * 1000);
      expect(stapleHours).toBeGreaterThan(70);
      expect(stapleHours).toBeLessThanOrEqual(72);

      const perishableListing: ListingOfferMetadata = {
        ...stapleRepo.listing!,
        id: "list-tomato",
        cropCode: "tomatoes",
      };
      const perishableRepo = createMockRepo(perishableListing);
      const perishableOffer = await createOfferWithRepo(
        perishableRepo,
        { id: "usr_buyer_1", role: "BUYER" },
        { listingId: "list-tomato", quantity: 10, unitPrice: 15000 },
      );
      const perishableHours =
        (new Date(perishableOffer.expiresAt).getTime() - Date.now()) / (3600 * 1000);
      expect(perishableHours).toBeGreaterThan(22);
      expect(perishableHours).toBeLessThanOrEqual(24);
    });
  });

  describe("respondToOfferWithRepo", () => {
    it("allows receiver to accept offer, creating order atomically", async () => {
      const initialOffer = createMockDetail({
        status: "PENDING",
        lastActionById: "usr_buyer_1",
      });
      const repo = createMockRepo(undefined, initialOffer);

      const res = await respondToOfferWithRepo(
        repo,
        { id: "usr_farmer_1", role: "FARMER" },
        "off-1",
        { action: "ACCEPT" },
      );

      expect(res.offer.status).toBe("ACCEPTED");
      expect(res.order).toBeDefined();
      expect(res.order?.orderCode).toBe("ORD-202611-73921");
    });

    it("prevents proposer from accepting their own proposal", async () => {
      const initialOffer = createMockDetail({
        status: "PENDING",
        lastActionById: "usr_buyer_1",
      });
      const repo = createMockRepo(undefined, initialOffer);

      await expect(
        respondToOfferWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          "off-1",
          { action: "ACCEPT" },
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it("allows proposer to withdraw their offer", async () => {
      const initialOffer = createMockDetail({
        status: "PENDING",
        lastActionById: "usr_buyer_1",
      });
      const repo = createMockRepo(undefined, initialOffer);

      const res = await respondToOfferWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        "off-1",
        { action: "WITHDRAW" },
      );

      expect(res.offer.status).toBe("WITHDRAWN");
    });

    it("allows counter-offers and increments round count", async () => {
      const initialOffer = createMockDetail({
        status: "PENDING",
        counterRoundCount: 0,
        lastActionById: "usr_buyer_1",
      });
      const repo = createMockRepo(undefined, initialOffer);

      const res = await respondToOfferWithRepo(
        repo,
        { id: "usr_farmer_1", role: "FARMER" },
        "off-1",
        {
          action: "COUNTER",
          proposedQuantity: 25,
          proposedUnitPrice: 33000,
          note: "How about ₦33,000 for 25 bags?",
        },
      );

      expect(res.offer.status).toBe("COUNTERED");
      expect(res.offer.counterRoundCount).toBe(1);
      expect(res.offer.quantity).toBe(25);
      expect(res.offer.unitPrice).toBe(33000);
      expect(res.offer.totalAmount).toBe(825000);
    });

    it("enforces 3 rounds maximum and blocks 4th counter", async () => {
      const maxedOffer = createMockDetail({
        status: "COUNTERED",
        counterRoundCount: 3,
        lastActionById: "usr_buyer_1",
      });
      const repo = createMockRepo(undefined, maxedOffer);

      await expect(
        respondToOfferWithRepo(
          repo,
          { id: "usr_farmer_1", role: "FARMER" },
          "off-1",
          {
            action: "COUNTER",
            proposedQuantity: 20,
            proposedUnitPrice: 34000,
          },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects actions on expired offers", async () => {
      const expiredOffer = createMockDetail({
        isExpired: true,
        expiresAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      });
      const repo = createMockRepo(undefined, expiredOffer);

      await expect(
        respondToOfferWithRepo(
          repo,
          { id: "usr_farmer_1", role: "FARMER" },
          "off-1",
          { action: "ACCEPT" },
        ),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("getOfferWithRepo", () => {
    it("returns offer if user is participant", async () => {
      const offer = createMockDetail();
      const repo = createMockRepo(undefined, offer);
      const res = await getOfferWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        "off-1",
      );
      expect(res.id).toBe("off-1");
    });

    it("throws NotFoundError if offer does not exist", async () => {
      const repo = createMockRepo();
      await expect(
        getOfferWithRepo(repo, { id: "usr_buyer_1", role: "BUYER" }, "unknown"),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError if user is not participant or admin", async () => {
      const offer = createMockDetail();
      const repo = createMockRepo(undefined, offer);
      await expect(
        getOfferWithRepo(repo, { id: "stranger", role: "BUYER" }, "off-1"),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("listUserOffersWithRepo", () => {
    it("lists offers for participant", async () => {
      const offer = createMockDetail();
      const repo = createMockRepo(undefined, offer);
      const res = await listUserOffersWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        { role: "buyer" },
      );
      expect(res.length).toBe(1);
    });
  });

  describe("getOrderWithRepo", () => {
    it("returns order detail for buyer participant", async () => {
      const order = createMockOrder();
      const repo = createMockRepo(undefined, undefined, order);

      const res = await getOrderWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        "ord-1",
      );

      expect(res.id).toBe("ord-1");
      expect(res.orderCode).toBe("ORD-202611-73921");
    });

    it("returns order detail for farmer participant", async () => {
      const order = createMockOrder();
      const repo = createMockRepo(undefined, undefined, order);

      const res = await getOrderWithRepo(
        repo,
        { id: "usr_farmer_1", role: "FARMER" },
        "ord-1",
      );

      expect(res.id).toBe("ord-1");
    });

    it("throws NotFoundError if order does not exist", async () => {
      const repo = createMockRepo();

      await expect(
        getOrderWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          "non-existent",
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError if actor is not order participant or admin", async () => {
      const order = createMockOrder();
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        getOrderWithRepo(
          repo,
          { id: "stranger_id", role: "BUYER" },
          "ord-1",
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("listOrdersWithRepo", () => {
    it("lists orders for participant", async () => {
      const order = createMockOrder();
      const repo = createMockRepo(undefined, undefined, order);

      const list = await listOrdersWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        { role: "buyer" },
      );

      expect(list.length).toBe(1);
      expect(list[0]?.orderCode).toBe("ORD-202611-73921");
    });
  });
});

