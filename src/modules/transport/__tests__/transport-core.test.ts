import { describe, expect, it } from "vitest";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  listOpenTransportRequestsWithRepo,
  listTransporterAssignmentsWithRepo,
  claimTransportOrderWithRepo,
  listVerifiedTransportersWithRepo,
  getTransportCorridors,
  submitCarrierReviewWithRepo,
  getCarrierReviewsWithRepo,
  getOrderReviewWithRepo,
} from "../transport-core";
import {
  findCorridorByLgas,
  calculateCorridorFreightFee,
  BENUE_TRANSPORT_CORRIDORS,
} from "../corridors";
import type {
  TransportRepository,
  TransportAuditInput,
  TransporterProfileData,
  SubmitCarrierReviewData,
  OrderReviewMetadata,
} from "../transport-repo";
import type {
  TransportRequestSummary,
  TransporterAssignmentSummary,
  VerifiedTransporterSummary,
  CarrierReviewSummary,
} from "../schemas";

function createMockRequest(
  overrides: Partial<TransportRequestSummary> = {},
): TransportRequestSummary {
  return {
    id: "ord-logistics-1",
    orderCode: "ORD-202611-98765",
    cropCode: "yam",
    quantity: 20,
    unitCode: "bag",
    estimatedWeightKg: 1000,
    listingLga: "Gboko",
    listingCommunity: "Tor-Donga",
    destinationLocation: "Makurdi North Bank",
    proposedCollectionDate: "2026-11-20",
    corridorRoute: null,
    estimatedFreightFee: null,
    farmerName: "Terna Iorfa",
    farmerPhone: "+2348022223344",
    buyerName: "Agro Commercials Ltd",
    buyerPhone: "+2348011112233",
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function createMockRepo(options?: {
  requests?: TransportRequestSummary[];
  assignments?: TransporterAssignmentSummary[];
  profile?: TransporterProfileData | null;
  transporters?: VerifiedTransporterSummary[];
  reviews?: CarrierReviewSummary[];
  orders?: OrderReviewMetadata[];
}): TransportRepository & {
  audits: TransportAuditInput[];
  reviews: CarrierReviewSummary[];
} {
  const audits: TransportAuditInput[] = [];
  const requests = options?.requests ?? [createMockRequest()];
  const assignments = options?.assignments ?? [];
  const profile =
    options?.profile !== undefined
      ? options.profile
      : {
          userId: "usr_transporter_1",
          operatorName: "Benue Express Haulage",
          maxCapacityKg: 3500,
          operatingLgas: ["Gboko", "Makurdi", "Otukpo"],
          isAvailable: true,
          verificationStatus: "VERIFIED",
        };
  const transporters = options?.transporters ?? [];
  const reviews = options?.reviews ?? [];
  const orders = options?.orders ?? [
    {
      id: "ord-1",
      orderCode: "ORD-202611-98765",
      farmerId: "usr_farmer_1",
      buyerId: "usr_buyer_1",
      transporterId: "usr_transporter_1",
      status: "DELIVERED",
    },
  ];

  return {
    audits,
    reviews,
    async listOpenTransportRequests() {
      return requests;
    },
    async listTransporterAssignments() {
      return assignments;
    },
    async claimTransportOrder(orderId, transporterUserId, corridorRoute, estimatedFreightFee) {
      const target = requests.find((r) => r.id === orderId);
      if (!target) throw new NotFoundError("Not found");
      return {
        ...target,
        transporterId: transporterUserId,
        corridorRoute,
        estimatedFreightFee,
        status: "TRANSPORT_ASSIGNED",
      };
    },
    async listVerifiedTransporters() {
      return transporters;
    },
    async getTransporterProfile(userId) {
      if (profile && profile.userId === userId) return profile;
      return null;
    },
    async recordTransportAudit(entry) {
      audits.push(entry);
    },
    async getOrderForReview(orderId) {
      const found = orders.find((o) => o.id === orderId);
      return found ?? null;
    },
    async getReviewForOrder(orderId, reviewerId) {
      const found = reviews.find(
        (r) => r.orderId === orderId && r.reviewerId === reviewerId,
      );
      return found ?? null;
    },
    async getReviewsForTransporter(transporterId) {
      return reviews.filter((r) => r.transporterId === transporterId);
    },
    async submitCarrierReview(data: SubmitCarrierReviewData) {
      const newReview: CarrierReviewSummary = {
        id: `rev-${reviews.length + 1}`,
        orderId: data.orderId,
        orderCode: "ORD-202611-98765",
        transporterId: data.transporterId,
        reviewerId: data.reviewerId,
        reviewerName: "Terna Iorfa",
        reviewerRole: "FARMER",
        rating: data.rating,
        timelinessScore: data.timelinessScore,
        cargoCareScore: data.cargoCareScore,
        communicationScore: data.communicationScore,
        comment: data.comment,
        createdAt: new Date().toISOString(),
      };
      reviews.push(newReview);
      return newReview;
    },
  };
}

describe("transport corridors & pricing logic", () => {
  it("matches Gboko and Makurdi to Gboko ⇄ Makurdi corridor", () => {
    const corridor = findCorridorByLgas("Gboko", "Makurdi North Bank");
    expect(corridor.code).toBe("gboko-makurdi");
    expect(corridor.distanceKm).toBe(85);
  });

  it("calculates flat rate base fee for cargo under 500kg", () => {
    const corridor = BENUE_TRANSPORT_CORRIDORS.find((c) => c.code === "gboko-makurdi")!;
    const fee = calculateCorridorFreightFee(corridor, 400);
    expect(fee).toBe(corridor.baseRateNgn);
  });

  it("scales freight fee proportionally for cargo exceeding 500kg", () => {
    const corridor = BENUE_TRANSPORT_CORRIDORS.find((c) => c.code === "gboko-makurdi")!;
    const fee = calculateCorridorFreightFee(corridor, 1000);
    // baseRate (25000) + (1000 - 500) * 15 = 25000 + 7500 = 32500
    expect(fee).toBe(32500);
  });
});

describe("transport-core", () => {
  describe("listOpenTransportRequestsWithRepo", () => {
    it("returns available haulage requests", async () => {
      const repo = createMockRepo();
      const list = await listOpenTransportRequestsWithRepo(repo);
      expect(list.length).toBe(1);
      expect(list[0]?.orderCode).toBe("ORD-202611-98765");
    });
  });

  describe("listTransporterAssignmentsWithRepo", () => {
    it("returns active assignments for transporter", async () => {
      const sampleAssignment = {
        ...createMockRequest(),
        id: "ord-assignment-1",
        transporterId: "usr_transporter_1",
        corridorRoute: "Gboko ⇄ Makurdi",
        estimatedFreightFee: 32500,
        status: "TRANSPORT_ASSIGNED" as const,
      };
      const repo = createMockRepo({ assignments: [sampleAssignment] });
      const list = await listTransporterAssignmentsWithRepo(repo, {
        id: "usr_transporter_1",
        role: "TRANSPORT_PROVIDER",
      });
      expect(list.length).toBe(1);
      expect(list[0]?.transporterId).toBe("usr_transporter_1");
    });
  });

  describe("listVerifiedTransportersWithRepo", () => {
    it("returns verified carrier profiles", async () => {
      const sampleCarrier = {
        id: "tp-1",
        userId: "usr_transporter_1",
        operatorName: "Benue Express",
        phoneNumber: "+2348033334455",
        vehicleTypes: ["PICKUP_VAN"],
        maxCapacityKg: 1500,
        operatingLgas: ["Gboko"],
        isAvailable: true,
        pricingModel: "CORRIDOR_BASE",
        verificationStatus: "VERIFIED",
        verifiedAt: new Date().toISOString(),
        averageRating: 4.8,
        reviewCount: 12,
      };
      const repo = createMockRepo({ transporters: [sampleCarrier] });
      const carriers = await listVerifiedTransportersWithRepo(repo, "Gboko");
      expect(carriers.length).toBe(1);
      expect(carriers[0]?.operatorName).toBe("Benue Express");
    });
  });

  describe("claimTransportOrderWithRepo", () => {
    it("allows verified transporter to claim open haulage within vehicle capacity", async () => {
      const repo = createMockRepo();
      const assignment = await claimTransportOrderWithRepo(
        repo,
        { id: "usr_transporter_1", role: "TRANSPORT_PROVIDER" },
        { orderId: "ord-logistics-1" },
      );

      expect(assignment.status).toBe("TRANSPORT_ASSIGNED");
      expect(assignment.transporterId).toBe("usr_transporter_1");
      expect(assignment.corridorRoute).toBe("Gboko ⇄ Makurdi");
      expect(assignment.estimatedFreightFee).toBe(32500);
    });

    it("rejects claim if actor is not a transport provider or admin", async () => {
      const repo = createMockRepo();
      await expect(
        claimTransportOrderWithRepo(
          repo,
          { id: "usr_buyer_1", role: "BUYER" },
          { orderId: "ord-logistics-1" },
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it("rejects claim if cargo payload exceeds transporter vehicle max capacity", async () => {
      const heavyCargo = createMockRequest({ estimatedWeightKg: 5000 });
      const smallVehicleRepo = createMockRepo({
        requests: [heavyCargo],
        profile: {
          userId: "usr_transporter_1",
          operatorName: "Small Pickup",
          maxCapacityKg: 1500,
          operatingLgas: ["Gboko"],
          isAvailable: true,
          verificationStatus: "VERIFIED",
        },
      });

      await expect(
        claimTransportOrderWithRepo(
          smallVehicleRepo,
          { id: "usr_transporter_1", role: "TRANSPORT_PROVIDER" },
          { orderId: "ord-logistics-1" },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("throws NotFoundError if target order is not in open requests", async () => {
      const repo = createMockRepo({ requests: [] });
      await expect(
        claimTransportOrderWithRepo(
          repo,
          { id: "usr_transporter_1", role: "TRANSPORT_PROVIDER" },
          { orderId: "non-existent" },
        ),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getTransportCorridors", () => {
    it("returns all defined Benue transport corridors", () => {
      const corridors = getTransportCorridors();
      expect(corridors.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("submitCarrierReviewWithRepo", () => {
    it("submits 5-star performance review with structured badges from farmer", async () => {
      const repo = createMockRepo();

      const review = await submitCarrierReviewWithRepo(
        repo,
        { id: "usr_farmer_1", role: "FARMER" },
        {
          orderId: "ord-1",
          rating: 5,
          timelinessScore: 5,
          cargoCareScore: 5,
          communicationScore: 4,
          comment: "Driver arrived promptly in Gboko and handled produce carefully.",
        },
      );

      expect(review.rating).toBe(5);
      expect(review.transporterId).toBe("usr_transporter_1");
      expect(review.reviewerId).toBe("usr_farmer_1");
      expect(review.comment).toContain("Gboko");
    });

    it("allows buyer to submit carrier review upon order completion", async () => {
      const repo = createMockRepo();

      const review = await submitCarrierReviewWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        {
          orderId: "ord-1",
          rating: 4,
          timelinessScore: 4,
          cargoCareScore: 4,
          communicationScore: 5,
        },
      );

      expect(review.rating).toBe(4);
      expect(review.reviewerId).toBe("usr_buyer_1");
    });

    it("rejects review if order has not yet been delivered", async () => {
      const repo = createMockRepo({
        orders: [
          {
            id: "ord-1",
            orderCode: "ORD-202611-98765",
            farmerId: "usr_farmer_1",
            buyerId: "usr_buyer_1",
            transporterId: "usr_transporter_1",
            status: "IN_TRANSIT",
          },
        ],
      });

      await expect(
        submitCarrierReviewWithRepo(
          repo,
          { id: "usr_farmer_1", role: "FARMER" },
          { orderId: "ord-1", rating: 5 },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects review from uninvolved party", async () => {
      const repo = createMockRepo();

      await expect(
        submitCarrierReviewWithRepo(
          repo,
          { id: "usr_stranger", role: "BUYER" },
          { orderId: "ord-1", rating: 5 },
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it("rejects duplicate review from same reviewer on same order", async () => {
      const existingReview: CarrierReviewSummary = {
        id: "rev-existing",
        orderId: "ord-1",
        orderCode: "ORD-202611-98765",
        transporterId: "usr_transporter_1",
        reviewerId: "usr_farmer_1",
        reviewerName: "Terna Iorfa",
        reviewerRole: "FARMER",
        rating: 5,
        timelinessScore: 5,
        cargoCareScore: 5,
        communicationScore: 5,
        comment: null,
        createdAt: new Date().toISOString(),
      };

      const repo = createMockRepo({
        reviews: [existingReview],
      });

      await expect(
        submitCarrierReviewWithRepo(
          repo,
          { id: "usr_farmer_1", role: "FARMER" },
          { orderId: "ord-1", rating: 4 },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects carrier reviewing themselves", async () => {
      const repo = createMockRepo();

      await expect(
        submitCarrierReviewWithRepo(
          repo,
          { id: "usr_transporter_1", role: "TRANSPORT_PROVIDER" },
          { orderId: "ord-1", rating: 5 },
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("getCarrierReviewsWithRepo & getOrderReviewWithRepo", () => {
    it("retrieves carrier reviews and actor order review", async () => {
      const existingReview: CarrierReviewSummary = {
        id: "rev-1",
        orderId: "ord-1",
        orderCode: "ORD-202611-98765",
        transporterId: "usr_transporter_1",
        reviewerId: "usr_farmer_1",
        reviewerName: "Terna Iorfa",
        reviewerRole: "FARMER",
        rating: 5,
        timelinessScore: 5,
        cargoCareScore: 5,
        communicationScore: 5,
        comment: "Excellent service",
        createdAt: new Date().toISOString(),
      };

      const repo = createMockRepo({ reviews: [existingReview] });

      const list = await getCarrierReviewsWithRepo(repo, "usr_transporter_1");
      expect(list.length).toBe(1);
      expect(list[0]?.rating).toBe(5);

      const myReview = await getOrderReviewWithRepo(
        repo,
        { id: "usr_farmer_1", role: "FARMER" },
        "ord-1",
      );
      expect(myReview?.id).toBe("rev-1");
    });
  });
});

