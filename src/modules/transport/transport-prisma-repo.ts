import type { PrismaClient } from "@prisma/client";
import type {
  TransportRepository,
  TransportAuditInput,
  TransporterProfileData,
  SubmitCarrierReviewData,
  OrderReviewMetadata,
} from "./transport-repo.ts";
import type {
  TransportRequestSummary,
  TransporterAssignmentSummary,
  VerifiedTransporterSummary,
  CarrierReviewSummary,
} from "./schemas.ts";
import type { OrderStatus } from "@/modules/orders/schemas";
import { NotFoundError, ValidationError } from "@/lib/errors";

interface RawTransportOrder {
  id: string;
  orderCode: string;
  cropCode: string;
  quantity: number;
  unitCode: string;
  estimatedWeightKg: number;
  destinationLocation: string | null;
  proposedCollectionDate: Date | null;
  corridorRoute: string | null;
  estimatedFreightFee: { toString(): string } | number | null;
  status: string;
  createdAt: Date;
  transporterId?: string | null;
  listing?: {
    lga: string;
    community: string;
  } | null;
  farmer?: {
    fullName: string;
    phoneNumber: string;
  } | null;
  buyer?: {
    fullName: string;
    phoneNumber: string;
  } | null;
  transporter?: {
    fullName: string;
    phoneNumber: string;
  } | null;
}

function mapToRequestSummary(row: RawTransportOrder): TransportRequestSummary {
  return {
    id: row.id,
    orderCode: row.orderCode,
    cropCode: row.cropCode,
    quantity: row.quantity,
    unitCode: row.unitCode,
    estimatedWeightKg: Number(row.estimatedWeightKg),
    listingLga: row.listing?.lga || "Benue LGA",
    listingCommunity: row.listing?.community || null,
    destinationLocation: row.destinationLocation,
    proposedCollectionDate: row.proposedCollectionDate
      ? (row.proposedCollectionDate.toISOString().split("T")[0] ?? null)
      : null,
    corridorRoute: row.corridorRoute,
    estimatedFreightFee: row.estimatedFreightFee
      ? Number(row.estimatedFreightFee)
      : null,
    farmerName: row.farmer?.fullName,
    farmerPhone: row.farmer?.phoneNumber,
    buyerName: row.buyer?.fullName,
    buyerPhone: row.buyer?.phoneNumber,
    status: row.status as OrderStatus,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapToAssignmentSummary(row: RawTransportOrder): TransporterAssignmentSummary {
  const base = mapToRequestSummary(row);
  return {
    ...base,
    transporterId: row.transporterId || "",
    transporterName: row.transporter?.fullName,
    transporterPhone: row.transporter?.phoneNumber,
  };
}

export function createPrismaTransportRepository(db: PrismaClient): TransportRepository {
  const defaultOrderInclude = {
    listing: {
      select: {
        lga: true,
        community: true,
      },
    },
    farmer: {
      select: {
        fullName: true,
        phoneNumber: true,
      },
    },
    buyer: {
      select: {
        fullName: true,
        phoneNumber: true,
      },
    },
    transporter: {
      select: {
        fullName: true,
        phoneNumber: true,
      },
    },
  };

  return {
    async listOpenTransportRequests(): Promise<TransportRequestSummary[]> {
      const orders = await db.order.findMany({
        where: {
          fulfillmentMode: "TONGRIC_LOGISTICS_REQUEST",
          transporterId: null,
          status: { in: ["CONFIRMED", "TRANSPORT_REQUESTED"] },
        },
        include: defaultOrderInclude,
        orderBy: { createdAt: "desc" },
      });

      return orders.map((o) => mapToRequestSummary(o as unknown as RawTransportOrder));
    },

    async listTransporterAssignments(
      transporterUserId: string,
    ): Promise<TransporterAssignmentSummary[]> {
      const orders = await db.order.findMany({
        where: {
          transporterId: transporterUserId,
          status: { in: ["TRANSPORT_ASSIGNED", "COLLECTED", "IN_TRANSIT", "DELIVERED"] },
        },
        include: defaultOrderInclude,
        orderBy: { updatedAt: "desc" },
      });

      return orders.map((o) => mapToAssignmentSummary(o as unknown as RawTransportOrder));
    },

    async claimTransportOrder(
      orderId: string,
      transporterUserId: string,
      corridorRoute: string,
      estimatedFreightFee: number,
    ): Promise<TransporterAssignmentSummary> {
      return await db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: defaultOrderInclude,
        });

        if (!order) {
          throw new NotFoundError("Transport order not found");
        }

        if (order.transporterId) {
          throw new ValidationError(
            "This transport request has already been claimed by another carrier.",
          );
        }

        if (order.fulfillmentMode !== "TONGRIC_LOGISTICS_REQUEST") {
          throw new ValidationError(
            "This order is not designated for Tongric logistics carrier fulfillment.",
          );
        }

        if (order.status !== "CONFIRMED" && order.status !== "TRANSPORT_REQUESTED") {
          throw new ValidationError(
            "Order is not in an open transport request status.",
          );
        }

        const transporter = await tx.user.findUnique({
          where: { id: transporterUserId },
          include: { transportProfile: true },
        });

        const operatorName =
          transporter?.transportProfile?.operatorName ||
          transporter?.fullName ||
          "Carrier";

        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            transporterId: transporterUserId,
            corridorRoute,
            estimatedFreightFee,
            status: "TRANSPORT_ASSIGNED",
          },
          include: defaultOrderInclude,
        });

        await tx.orderStatusEvent.create({
          data: {
            orderId,
            fromStatus: order.status,
            toStatus: "TRANSPORT_ASSIGNED",
            changedById: transporterUserId,
            note: `Transport haulage claimed by verified carrier: ${operatorName} (${corridorRoute})`,
          },
        });

        await tx.auditLog.create({
          data: {
            actorUserId: transporterUserId,
            action: "TRANSPORT_ROUTE_ASSIGNED",
            entityType: "ORDER",
            entityId: orderId,
            metadata: {
              orderCode: order.orderCode,
              corridorRoute,
              estimatedFreightFee,
              transporterId: transporterUserId,
              operatorName,
            },
          },
        });

        return mapToAssignmentSummary(updatedOrder as unknown as RawTransportOrder);
      });
    },

    async listVerifiedTransporters(lga?: string): Promise<VerifiedTransporterSummary[]> {
      const where: Record<string, unknown> = {
        isAvailable: true,
      };

      if (lga) {
        where.operatingLgas = { has: lga };
      }

      const rows = await db.transportProfile.findMany({
        where,
        include: {
          user: {
            select: {
              phoneNumber: true,
              transporterReviews: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return rows.map((r) => {
        const reviews = r.user.transporterReviews || [];
        const reviewCount = reviews.length;
        const averageRating =
          reviewCount > 0
            ? Number(
                (
                  reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount
                ).toFixed(1),
              )
            : null;

        return {
          id: r.id,
          userId: r.userId,
          operatorName: r.operatorName,
          phoneNumber: r.user.phoneNumber,
          vehicleTypes: r.vehicleTypes,
          maxCapacityKg: r.maxCapacityKg,
          operatingLgas: r.operatingLgas,
          isAvailable: r.isAvailable,
          pricingModel: r.pricingModel,
          verificationStatus: r.verificationStatus,
          verifiedAt: r.verifiedAt ? r.verifiedAt.toISOString() : null,
          averageRating,
          reviewCount,
        };
      });
    },

    async getTransporterProfile(userId: string): Promise<TransporterProfileData | null> {
      const profile = await db.transportProfile.findUnique({
        where: { userId },
      });

      if (!profile) return null;

      return {
        userId: profile.userId,
        operatorName: profile.operatorName,
        maxCapacityKg: profile.maxCapacityKg,
        operatingLgas: profile.operatingLgas,
        isAvailable: profile.isAvailable,
        verificationStatus: profile.verificationStatus,
      };
    },

    async recordTransportAudit(entry: TransportAuditInput): Promise<void> {
      await db.auditLog.create({
        data: {
          actorUserId: entry.actorUserId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          metadata: entry.metadata ? (entry.metadata as object) : undefined,
          ipAddress: entry.ipAddress,
        },
      });
    },

    async getOrderForReview(orderId: string): Promise<OrderReviewMetadata | null> {
      const order = await db.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderCode: true,
          farmerId: true,
          buyerId: true,
          transporterId: true,
          status: true,
        },
      });
      return order;
    },

    async getReviewForOrder(
      orderId: string,
      reviewerId: string,
    ): Promise<CarrierReviewSummary | null> {
      const review = await db.carrierReview.findUnique({
        where: {
          orderId_reviewerId: {
            orderId,
            reviewerId,
          },
        },
        include: {
          order: { select: { orderCode: true } },
          reviewer: { select: { fullName: true, role: true } },
        },
      });

      if (!review) return null;

      return {
        id: review.id,
        orderId: review.orderId,
        orderCode: review.order.orderCode,
        transporterId: review.transporterId,
        reviewerId: review.reviewerId,
        reviewerName: review.reviewer.fullName,
        reviewerRole: review.reviewer.role,
        rating: review.rating,
        timelinessScore: review.timelinessScore,
        cargoCareScore: review.cargoCareScore,
        communicationScore: review.communicationScore,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      };
    },

    async getReviewsForTransporter(transporterId: string): Promise<CarrierReviewSummary[]> {
      const reviews = await db.carrierReview.findMany({
        where: { transporterId },
        include: {
          order: { select: { orderCode: true } },
          reviewer: { select: { fullName: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return reviews.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        orderCode: r.order.orderCode,
        transporterId: r.transporterId,
        reviewerId: r.reviewerId,
        reviewerName: r.reviewer.fullName,
        reviewerRole: r.reviewer.role,
        rating: r.rating,
        timelinessScore: r.timelinessScore,
        cargoCareScore: r.cargoCareScore,
        communicationScore: r.communicationScore,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
      }));
    },

    async submitCarrierReview(
      data: SubmitCarrierReviewData,
    ): Promise<CarrierReviewSummary> {
      const created = await db.$transaction(async (tx) => {
        const review = await tx.carrierReview.create({
          data: {
            orderId: data.orderId,
            transporterId: data.transporterId,
            reviewerId: data.reviewerId,
            rating: data.rating,
            timelinessScore: data.timelinessScore,
            cargoCareScore: data.cargoCareScore,
            communicationScore: data.communicationScore,
            comment: data.comment,
          },
          include: {
            order: { select: { orderCode: true } },
            reviewer: { select: { fullName: true, role: true } },
          },
        });

        await tx.auditLog.create({
          data: {
            actorUserId: data.reviewerId,
            action: "CARRIER_REVIEW_SUBMITTED",
            entityType: "CARRIER_REVIEW",
            entityId: review.id,
            metadata: {
              orderId: data.orderId,
              transporterId: data.transporterId,
              rating: data.rating,
              timelinessScore: data.timelinessScore,
              cargoCareScore: data.cargoCareScore,
              communicationScore: data.communicationScore,
            },
          },
        });

        return review;
      });

      return {
        id: created.id,
        orderId: created.orderId,
        orderCode: created.order.orderCode,
        transporterId: created.transporterId,
        reviewerId: created.reviewerId,
        reviewerName: created.reviewer.fullName,
        reviewerRole: created.reviewer.role,
        rating: created.rating,
        timelinessScore: created.timelinessScore,
        cargoCareScore: created.cargoCareScore,
        communicationScore: created.communicationScore,
        comment: created.comment,
        createdAt: created.createdAt.toISOString(),
      };
    },
  };
}

