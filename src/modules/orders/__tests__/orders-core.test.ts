import { describe, expect, it } from "vitest";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  createOfferWithRepo,
  getOfferWithRepo,
  listUserOffersWithRepo,
  respondToOfferWithRepo,
  getOrderWithRepo,
  listOrdersWithRepo,
  updateOrderStatusWithRepo,
  cancelOrderWithRepo,
  disputeOrderWithRepo,
  verifyPickupPinWithRepo,
  verifyDeliveryPinWithRepo,
  getWaybillWithRepo,
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
  OrderStatus,
  WaybillSummary,
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
    waybillNumber: "WB-202611-73921",
    pickupPin: "4829",
    deliveryPin: "7193",
    pickupVerifiedAt: null,
    deliveryVerifiedAt: null,
    transporterId: "usr_carrier_1",
    transporterName: "Benue Express Haulage",
    transporterPhone: "+2348055556677",
    corridorRoute: "Gboko ⇄ Makurdi",
    estimatedFreightFee: 45000,
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
    async updateOrderStatus(
      orderId: string,
      toStatus: string,
      changedById: string,
      note?: string | null,
    ): Promise<OrderDetailSummary> {
      if (!order || order.id !== orderId) throw new NotFoundError("Not found");
      order = {
        ...order,
        status: toStatus as OrderStatus,
        statusEvents: [
          ...order.statusEvents,
          {
            id: `evt-${order.statusEvents.length + 1}`,
            orderId: order.id,
            fromStatus: order.status,
            toStatus: toStatus as OrderStatus,
            changedById,
            note: note ?? null,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      return order;
    },
    async cancelOrder(
      orderId: string,
      reason: string,
      changedById: string,
    ): Promise<{
      order: OrderDetailSummary;
      restoredQuantity: number;
      listingReactivated: boolean;
    }> {
      if (!order || order.id !== orderId) throw new NotFoundError("Not found");
      order = {
        ...order,
        status: "CANCELLED",
        cancellationReason: reason,
        statusEvents: [
          ...order.statusEvents,
          {
            id: `evt-${order.statusEvents.length + 1}`,
            orderId: order.id,
            fromStatus: order.status,
            toStatus: "CANCELLED",
            changedById,
            note: reason,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      return { order, restoredQuantity: order.quantity, listingReactivated: false };
    },
    async disputeOrder(
      orderId: string,
      reason: string,
      changedById: string,
    ): Promise<OrderDetailSummary> {
      if (!order || order.id !== orderId) throw new NotFoundError("Not found");
      order = {
        ...order,
        status: "DISPUTED",
        statusEvents: [
          ...order.statusEvents,
          {
            id: `evt-${order.statusEvents.length + 1}`,
            orderId: order.id,
            fromStatus: order.status,
            toStatus: "DISPUTED",
            changedById,
            note: reason,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      return order;
    },
    async verifyPickupPin(
      orderId: string,
      pin: string,
      actorUserId: string,
    ): Promise<OrderDetailSummary> {
      if (!order || order.id !== orderId) throw new NotFoundError("Not found");
      if (order.pickupPin !== pin) throw new ValidationError("Invalid pickup PIN");
      const now = new Date().toISOString();
      order = {
        ...order,
        pickupVerifiedAt: now,
        status: "COLLECTED",
        statusEvents: [
          ...order.statusEvents,
          {
            id: `evt-${order.statusEvents.length + 1}`,
            orderId: order.id,
            fromStatus: order.status,
            toStatus: "COLLECTED",
            changedById: actorUserId,
            note: "Pickup PIN verified",
            createdAt: now,
          },
        ],
      };
      return order;
    },
    async verifyDeliveryPin(
      orderId: string,
      pin: string,
      actorUserId: string,
    ): Promise<OrderDetailSummary> {
      if (!order || order.id !== orderId) throw new NotFoundError("Not found");
      if (order.deliveryPin !== pin) throw new ValidationError("Invalid delivery PIN");
      const now = new Date().toISOString();
      order = {
        ...order,
        deliveryVerifiedAt: now,
        status: "DELIVERED",
        statusEvents: [
          ...order.statusEvents,
          {
            id: `evt-${order.statusEvents.length + 1}`,
            orderId: order.id,
            fromStatus: order.status,
            toStatus: "DELIVERED",
            changedById: actorUserId,
            note: "Delivery PIN verified",
            createdAt: now,
          },
        ],
      };
      return order;
    },
    async getWaybillByOrderId(orderId: string): Promise<WaybillSummary | null> {
      if (!order || order.id !== orderId) return null;
      return {
        waybillNumber: order.waybillNumber || `WB-${order.orderCode}`,
        orderId: order.id,
        orderCode: order.orderCode,
        cropCode: order.cropCode,
        quantity: order.quantity,
        unitCode: order.unitCode,
        estimatedWeightKg: order.estimatedWeightKg,
        totalAmount: order.totalAmount,
        currency: order.currency,
        corridorRoute: order.corridorRoute ?? "Gboko ⇄ Makurdi",
        estimatedFreightFee: order.estimatedFreightFee ?? 45000,
        pickupLga: order.listingLga ?? "Gboko",
        pickupCommunity: order.listingCommunity ?? "Tor-Donga",
        destinationLocation: order.destinationLocation,
        farmerName: order.farmerName || "Farmer",
        farmerPhone: order.farmerPhone || "",
        buyerName: order.buyerName || "Buyer",
        buyerPhone: order.buyerPhone || "",
        transporterName: order.transporterName ?? "Benue Express Haulage",
        transporterPhone: order.transporterPhone ?? "+2348055556677",
        status: order.status,
        pickupVerifiedAt: order.pickupVerifiedAt ?? null,
        deliveryVerifiedAt: order.deliveryVerifiedAt ?? null,
        createdAt: order.createdAt,
      };
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

  describe("updateOrderStatusWithRepo", () => {
    it("allows farmer or transporter to advance order from CONFIRMED to COLLECTED", async () => {
      const order = createMockOrder({ status: "CONFIRMED" });
      const repo = createMockRepo(undefined, undefined, order);

      const updated = await updateOrderStatusWithRepo(
        repo,
        { id: "usr_farmer_1", role: "FARMER" },
        "ord-1",
        { toStatus: "COLLECTED", note: "Produce collected at farm gate" },
      );

      expect(updated.status).toBe("COLLECTED");
      expect(updated.statusEvents.length).toBe(2);
      expect(updated.statusEvents[1]?.note).toBe("Produce collected at farm gate");
    });

    it("allows transporter to advance order to IN_TRANSIT", async () => {
      const order = createMockOrder({ status: "COLLECTED" });
      const repo = createMockRepo(undefined, undefined, order);

      const updated = await updateOrderStatusWithRepo(
        repo,
        { id: "usr_transporter_1", role: "TRANSPORTER" },
        "ord-1",
        { toStatus: "IN_TRANSIT", note: "Dispatched towards Makurdi" },
      );

      expect(updated.status).toBe("IN_TRANSIT");
    });

    it("allows transporter or farmer to advance order to DELIVERED", async () => {
      const order = createMockOrder({ status: "IN_TRANSIT" });
      const repo = createMockRepo(undefined, undefined, order);

      const updated = await updateOrderStatusWithRepo(
        repo,
        { id: "usr_farmer_1", role: "FARMER" },
        "ord-1",
        { toStatus: "DELIVERED", note: "Arrived at buyer warehouse" },
      );

      expect(updated.status).toBe("DELIVERED");
    });

    it("allows buyer to confirm receipt and mark COMPLETED", async () => {
      const order = createMockOrder({ status: "DELIVERED" });
      const repo = createMockRepo(undefined, undefined, order);

      const updated = await updateOrderStatusWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        "ord-1",
        { toStatus: "COMPLETED", note: "Received 20 bags in good condition" },
      );

      expect(updated.status).toBe("COMPLETED");
    });

    it("prevents non-buyer from completing the order", async () => {
      const order = createMockOrder({ status: "DELIVERED" });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        updateOrderStatusWithRepo(
          repo,
          { id: "usr_farmer_1", role: "FARMER" },
          "ord-1",
          { toStatus: "COMPLETED" },
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it("rejects invalid status transitions", async () => {
      const order = createMockOrder({ status: "CONFIRMED" });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        updateOrderStatusWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          "ord-1",
          { toStatus: "COMPLETED" },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects transitions on already completed orders", async () => {
      const order = createMockOrder({ status: "COMPLETED" });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        updateOrderStatusWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          "ord-1",
          { toStatus: "DELIVERED" },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects transitions on cancelled orders", async () => {
      const order = createMockOrder({ status: "CANCELLED" });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        updateOrderStatusWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          "ord-1",
          { toStatus: "CONFIRMED" },
        ),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("cancelOrderWithRepo", () => {
    it("allows buyer to cancel order prior to collection", async () => {
      const order = createMockOrder({ status: "CONFIRMED" });
      const repo = createMockRepo(undefined, undefined, order);

      const result = await cancelOrderWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        "ord-1",
        { reason: "Transport arrangement fell through before collection" },
      );

      expect(result.order.status).toBe("CANCELLED");
      expect(result.order.cancellationReason).toBe(
        "Transport arrangement fell through before collection",
      );
      expect(result.restoredQuantity).toBe(20);
    });

    it("allows farmer to cancel order when transport is requested", async () => {
      const order = createMockOrder({ status: "TRANSPORT_REQUESTED" });
      const repo = createMockRepo(undefined, undefined, order);

      const result = await cancelOrderWithRepo(
        repo,
        { id: "usr_farmer_1", role: "FARMER" },
        "ord-1",
        { reason: "Unforeseen flood damaged access road" },
      );

      expect(result.order.status).toBe("CANCELLED");
    });

    it("prohibits cancellation once produce is COLLECTED", async () => {
      const order = createMockOrder({ status: "COLLECTED" });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        cancelOrderWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          "ord-1",
          { reason: "Buyer changed mind after collection" },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("prohibits cancellation once order is in transit or delivered", async () => {
      const order = createMockOrder({ status: "IN_TRANSIT" });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        cancelOrderWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          "ord-1",
          { reason: "Too late cancellation" },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects cancellation by unauthorized user", async () => {
      const order = createMockOrder({ status: "CONFIRMED" });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        cancelOrderWithRepo(
          repo,
          { id: "stranger_id", role: "BUYER" },
          "ord-1",
          { reason: "Malicious cancel attempt" },
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("disputeOrderWithRepo", () => {
    it("allows buyer to report dispute on active order", async () => {
      const order = createMockOrder({ status: "DELIVERED" });
      const repo = createMockRepo(undefined, undefined, order);

      const disputed = await disputeOrderWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        "ord-1",
        { reason: "5 bags were found spoiled upon warehouse delivery" },
      );

      expect(disputed.status).toBe("DISPUTED");
    });

    it("prevents reporting duplicate dispute when already in dispute", async () => {
      const order = createMockOrder({ status: "DISPUTED" });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        disputeOrderWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          "ord-1",
          { reason: "Second dispute message" },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("prevents disputing a cancelled order", async () => {
      const order = createMockOrder({ status: "CANCELLED" });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        disputeOrderWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          "ord-1",
          { reason: "Trying to dispute cancelled order" },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects dispute from non-participant", async () => {
      const order = createMockOrder({ status: "COLLECTED" });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        disputeOrderWithRepo(
          repo,
          { id: "random_id", role: "BUYER" },
          "ord-1",
          { reason: "Uninvolved observer dispute" },
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("verifyPickupPinWithRepo", () => {
    it("successfully verifies farm-gate pickup for assigned carrier", async () => {
      const order = createMockOrder({
        status: "TRANSPORT_ASSIGNED",
        pickupPin: "4829",
        transporterId: "usr_carrier_1",
      });
      const repo = createMockRepo(undefined, undefined, order);

      const result = await verifyPickupPinWithRepo(
        repo,
        { id: "usr_carrier_1", role: "TRANSPORTER" },
        "ord-1",
        { pin: "4829" },
      );

      expect(result.status).toBe("COLLECTED");
      expect(result.pickupVerifiedAt).toBeDefined();
    });

    it("allows admin to verify pickup PIN", async () => {
      const order = createMockOrder({
        status: "CONFIRMED",
        pickupPin: "4829",
      });
      const repo = createMockRepo(undefined, undefined, order);

      const result = await verifyPickupPinWithRepo(
        repo,
        { id: "usr_admin", role: "ADMIN" },
        "ord-1",
        { pin: "4829" },
      );

      expect(result.status).toBe("COLLECTED");
    });

    it("rejects verification if wrong PIN is entered", async () => {
      const order = createMockOrder({
        status: "TRANSPORT_ASSIGNED",
        pickupPin: "4829",
        transporterId: "usr_carrier_1",
      });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        verifyPickupPinWithRepo(
          repo,
          { id: "usr_carrier_1", role: "TRANSPORTER" },
          "ord-1",
          { pin: "0000" },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects if PIN format is invalid (not 4 digits)", async () => {
      const order = createMockOrder({
        status: "TRANSPORT_ASSIGNED",
        pickupPin: "4829",
        transporterId: "usr_carrier_1",
      });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        verifyPickupPinWithRepo(
          repo,
          { id: "usr_carrier_1", role: "TRANSPORTER" },
          "ord-1",
          { pin: "12" },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects unauthorized carrier", async () => {
      const order = createMockOrder({
        status: "TRANSPORT_ASSIGNED",
        pickupPin: "4829",
        transporterId: "usr_carrier_1",
      });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        verifyPickupPinWithRepo(
          repo,
          { id: "usr_intruder", role: "TRANSPORTER" },
          "ord-1",
          { pin: "4829" },
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it("rejects verification if order is already cancelled or collected", async () => {
      const order = createMockOrder({
        status: "COLLECTED",
        pickupPin: "4829",
        pickupVerifiedAt: new Date().toISOString(),
        transporterId: "usr_carrier_1",
      });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        verifyPickupPinWithRepo(
          repo,
          { id: "usr_carrier_1", role: "TRANSPORTER" },
          "ord-1",
          { pin: "4829" },
        ),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("verifyDeliveryPinWithRepo", () => {
    it("successfully verifies delivery handover for assigned carrier", async () => {
      const order = createMockOrder({
        status: "COLLECTED",
        deliveryPin: "7193",
        pickupVerifiedAt: new Date().toISOString(),
        transporterId: "usr_carrier_1",
      });
      const repo = createMockRepo(undefined, undefined, order);

      const result = await verifyDeliveryPinWithRepo(
        repo,
        { id: "usr_carrier_1", role: "TRANSPORTER" },
        "ord-1",
        { pin: "7193" },
      );

      expect(result.status).toBe("DELIVERED");
      expect(result.deliveryVerifiedAt).toBeDefined();
    });

    it("rejects delivery verification if pickup was not verified first", async () => {
      const order = createMockOrder({
        status: "TRANSPORT_ASSIGNED",
        deliveryPin: "7193",
        pickupVerifiedAt: null,
        transporterId: "usr_carrier_1",
      });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        verifyDeliveryPinWithRepo(
          repo,
          { id: "usr_carrier_1", role: "TRANSPORTER" },
          "ord-1",
          { pin: "7193" },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects if wrong delivery PIN is entered", async () => {
      const order = createMockOrder({
        status: "COLLECTED",
        deliveryPin: "7193",
        pickupVerifiedAt: new Date().toISOString(),
        transporterId: "usr_carrier_1",
      });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        verifyDeliveryPinWithRepo(
          repo,
          { id: "usr_carrier_1", role: "TRANSPORTER" },
          "ord-1",
          { pin: "9999" },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects unauthorized party", async () => {
      const order = createMockOrder({
        status: "COLLECTED",
        deliveryPin: "7193",
        pickupVerifiedAt: new Date().toISOString(),
        transporterId: "usr_carrier_1",
      });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        verifyDeliveryPinWithRepo(
          repo,
          { id: "usr_stranger", role: "BUYER" },
          "ord-1",
          { pin: "7193" },
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("getWaybillWithRepo", () => {
    it("allows buyer, farmer, transporter, and admin to retrieve waybill", async () => {
      const order = createMockOrder({
        transporterId: "usr_carrier_1",
      });
      const repo = createMockRepo(undefined, undefined, order);

      const wbBuyer = await getWaybillWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        "ord-1",
      );
      expect(wbBuyer.waybillNumber).toBe("WB-202611-73921");

      const wbFarmer = await getWaybillWithRepo(
        repo,
        { id: "usr_farmer_1", role: "FARMER" },
        "ord-1",
      );
      expect(wbFarmer.waybillNumber).toBe("WB-202611-73921");

      const wbCarrier = await getWaybillWithRepo(
        repo,
        { id: "usr_carrier_1", role: "TRANSPORTER" },
        "ord-1",
      );
      expect(wbCarrier.waybillNumber).toBe("WB-202611-73921");

      const wbAdmin = await getWaybillWithRepo(
        repo,
        { id: "usr_admin", role: "ADMIN" },
        "ord-1",
      );
      expect(wbAdmin.waybillNumber).toBe("WB-202611-73921");
    });

    it("rejects access to uninvolved user", async () => {
      const order = createMockOrder({
        transporterId: "usr_carrier_1",
      });
      const repo = createMockRepo(undefined, undefined, order);

      await expect(
        getWaybillWithRepo(
          repo,
          { id: "usr_unrelated", role: "BUYER" },
          "ord-1",
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});

