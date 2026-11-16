import type { PrismaClient } from "@prisma/client";
import type {
  OrdersRepository,
  CreateOfferData,
  RespondOfferData,
  ListingOfferMetadata,
  OrdersFilterOptions,
  OrderAuditInput,
} from "./orders-repo.ts";
import type {
  CommercialOfferSummary,
  CommercialOfferDetailSummary,
  OfferMessageSummary,
  OfferStatus,
  FulfillmentMode,
  OrderStatus,
  OrderSummary,
  OrderDetailSummary,
  OrderStatusEventSummary,
  WaybillSummary,
} from "./schemas.ts";
import { PRODUCE_CROP_CATALOG, estimateWeightKg } from "@/modules/i18n/catalogs";
import { NotFoundError, ValidationError } from "@/lib/errors";

interface RawOfferWithRelations {
  id: string;
  offerCode: string;
  listingId: string;
  buyerId: string;
  farmerId: string;
  status: string;
  quantity: number;
  unitCode: string;
  unitPrice: { toString(): string } | number;
  currency: string;
  totalAmount: { toString(): string } | number;
  fulfillmentMode: string;
  destinationLocation: string | null;
  proposedCollectionDate: Date | null;
  expiresAt: Date;
  counterRoundCount: number;
  lastActionById: string;
  createdAt: Date;
  updatedAt: Date;
  listing?: {
    title: string;
    cropCode: string;
    quantity: number;
    pricePerUnit: { toString(): string } | number;
    minOrderQuantity: number;
    lga: string;
    community: string;
    photos?: Array<{ publicUrl: string; isPrimary: boolean }>;
  } | null;
  buyer?: {
    fullName: string;
    phoneNumber: string;
  } | null;
  farmer?: {
    fullName: string;
    phoneNumber: string;
  } | null;
  lastActionBy?: {
    fullName: string;
  } | null;
  messages?: Array<{
    id: string;
    offerId: string;
    senderId: string;
    action: string;
    proposedQuantity: number | null;
    proposedUnitPrice: { toString(): string } | number | null;
    note: string | null;
    createdAt: Date;
    sender?: {
      fullName: string;
      role: string;
    } | null;
  }>;
}

function mapOfferToDetailSummary(
  row: RawOfferWithRelations,
  now = new Date(),
): CommercialOfferDetailSummary {
  const isPerishable =
    PRODUCE_CROP_CATALOG.find((c) => c.code === row.listing?.cropCode)
      ?.isPerishable ?? false;

  const isExpired =
    row.expiresAt <= now &&
    (row.status === "PENDING" || row.status === "COUNTERED");

  const effectiveStatus: OfferStatus = isExpired
    ? "EXPIRED"
    : (row.status as OfferStatus);

  const primaryPhoto =
    row.listing?.photos?.find((p) => p.isPrimary)?.publicUrl ??
    row.listing?.photos?.[0]?.publicUrl ??
    null;

  const messages: OfferMessageSummary[] = (row.messages ?? []).map((m) => ({
    id: m.id,
    offerId: m.offerId,
    senderId: m.senderId,
    senderName: m.sender?.fullName,
    senderRole: m.sender?.role,
    action: m.action,
    proposedQuantity: m.proposedQuantity,
    proposedUnitPrice:
      m.proposedUnitPrice !== null ? Number(m.proposedUnitPrice) : null,
    note: m.note,
    createdAt: m.createdAt.toISOString(),
  }));

  return {
    id: row.id,
    offerCode: row.offerCode,
    listingId: row.listingId,
    listingTitle: row.listing?.title,
    cropCode: row.listing?.cropCode,
    isPerishable,
    primaryPhotoUrl: primaryPhoto,
    buyerId: row.buyerId,
    buyerName: row.buyer?.fullName,
    buyerPhone: row.buyer?.phoneNumber,
    farmerId: row.farmerId,
    farmerName: row.farmer?.fullName,
    farmerPhone: row.farmer?.phoneNumber,
    status: effectiveStatus,
    quantity: row.quantity,
    unitCode: row.unitCode,
    unitPrice: Number(row.unitPrice),
    currency: row.currency,
    totalAmount: Number(row.totalAmount),
    fulfillmentMode: row.fulfillmentMode as FulfillmentMode,
    destinationLocation: row.destinationLocation,
    proposedCollectionDate: row.proposedCollectionDate
      ? (row.proposedCollectionDate.toISOString().split("T")[0] ?? null)
      : null,
    expiresAt: row.expiresAt.toISOString(),
    isExpired,
    counterRoundCount: row.counterRoundCount,
    lastActionById: row.lastActionById,
    lastActionByName: row.lastActionBy?.fullName,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    listingQuantity: row.listing?.quantity ?? 0,
    listingUnitPrice: Number(row.listing?.pricePerUnit ?? 0),
    listingMinOrderQuantity: row.listing?.minOrderQuantity ?? 1,
    listingLga: row.listing?.lga ?? "",
    listingCommunity: row.listing?.community ?? "",
    messages,
  };
}

interface RawOrderWithRelations {
  id: string;
  orderCode: string;
  offerId: string;
  listingId: string;
  farmerId: string;
  buyerId: string;
  cropCode: string;
  quantity: number;
  unitCode: string;
  estimatedWeightKg: number;
  unitPrice: { toString(): string } | number;
  currency: string;
  totalAmount: { toString(): string } | number;
  fulfillmentMode: string;
  destinationLocation: string | null;
  proposedCollectionDate: Date | null;
  status: string;
  paymentArrangementNote: string | null;
  cancellationReason: string | null;
  transporterId?: string | null;
  corridorRoute?: string | null;
  estimatedFreightFee?: { toString(): string } | number | null;
  waybillNumber?: string | null;
  pickupPin?: string | null;
  deliveryPin?: string | null;
  pickupVerifiedAt?: Date | null;
  deliveryVerifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  listing?: {
    title: string;
    cropCode: string;
    lga: string;
    community: string;
    photos?: Array<{ publicUrl: string; isPrimary: boolean }>;
  } | null;
  buyer?: {
    fullName: string;
    phoneNumber: string;
  } | null;
  farmer?: {
    fullName: string;
    phoneNumber: string;
    farmerProfile?: {
      lga: string;
      community: string;
    } | null;
  } | null;
  transporter?: {
    fullName: string;
    phoneNumber: string;
  } | null;
  statusEvents?: Array<{
    id: string;
    orderId: string;
    fromStatus: string | null;
    toStatus: string;
    changedById: string;
    note: string | null;
    createdAt: Date;
    changedBy?: {
      fullName: string;
    } | null;
  }>;
}

function mapToOrderSummary(row: RawOrderWithRelations): OrderSummary {
  const cropItem = PRODUCE_CROP_CATALOG.find((c) => c.code === row.cropCode);
  const primaryPhoto =
    row.listing?.photos?.find((p) => p.isPrimary)?.publicUrl ||
    row.listing?.photos?.[0]?.publicUrl ||
    null;

  return {
    id: row.id,
    orderCode: row.orderCode,
    offerId: row.offerId,
    listingId: row.listingId,
    listingTitle: row.listing?.title || "Produce Lot",
    cropCode: row.cropCode,
    primaryPhotoUrl: primaryPhoto,
    isPerishable: cropItem?.isPerishable ?? false,
    farmerId: row.farmerId,
    farmerName: row.farmer?.fullName,
    farmerPhone: row.farmer?.phoneNumber,
    buyerId: row.buyerId,
    buyerName: row.buyer?.fullName,
    buyerPhone: row.buyer?.phoneNumber,
    quantity: row.quantity,
    unitCode: row.unitCode,
    estimatedWeightKg: Number(row.estimatedWeightKg),
    unitPrice: Number(row.unitPrice),
    currency: row.currency,
    totalAmount: Number(row.totalAmount),
    fulfillmentMode: row.fulfillmentMode as FulfillmentMode,
    destinationLocation: row.destinationLocation,
    proposedCollectionDate: row.proposedCollectionDate
      ? (row.proposedCollectionDate.toISOString().split("T")[0] ?? null)
      : null,
    status: row.status as OrderStatus,
    paymentArrangementNote: row.paymentArrangementNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapToOrderDetailSummary(row: RawOrderWithRelations): OrderDetailSummary {
  const base = mapToOrderSummary(row);
  const events: OrderStatusEventSummary[] = (row.statusEvents || []).map((e) => ({
    id: e.id,
    orderId: e.orderId,
    fromStatus: (e.fromStatus as OrderStatus | null) ?? null,
    toStatus: e.toStatus as OrderStatus,
    changedById: e.changedById,
    changedByName: e.changedBy?.fullName,
    note: e.note,
    createdAt: e.createdAt.toISOString(),
  }));

  const farmerLoc = row.farmer?.farmerProfile
    ? `${row.farmer.farmerProfile.lga} LGA, ${row.farmer.farmerProfile.community}`
    : undefined;

  return {
    ...base,
    listingLga: row.listing?.lga,
    listingCommunity: row.listing?.community,
    farmerAddress: farmerLoc,
    cancellationReason: row.cancellationReason,
    transporterId: row.transporterId ?? null,
    transporterName: row.transporter?.fullName ?? null,
    transporterPhone: row.transporter?.phoneNumber ?? null,
    corridorRoute: row.corridorRoute ?? null,
    estimatedFreightFee:
      row.estimatedFreightFee != null ? Number(row.estimatedFreightFee) : null,
    waybillNumber: row.waybillNumber ?? null,
    pickupPin: row.pickupPin ?? null,
    deliveryPin: row.deliveryPin ?? null,
    pickupVerifiedAt: row.pickupVerifiedAt
      ? row.pickupVerifiedAt.toISOString()
      : null,
    deliveryVerifiedAt: row.deliveryVerifiedAt
      ? row.deliveryVerifiedAt.toISOString()
      : null,
    statusEvents: events,
  };
}

export function createPrismaOrdersRepository(db: PrismaClient): OrdersRepository {
  const defaultInclude = {
    listing: {
      select: {
        title: true,
        cropCode: true,
        quantity: true,
        pricePerUnit: true,
        minOrderQuantity: true,
        lga: true,
        community: true,
        photos: {
          select: { publicUrl: true, isPrimary: true },
          orderBy: { createdAt: "asc" },
        },
      },
    },
    buyer: { select: { fullName: true, phoneNumber: true } },
    farmer: { select: { fullName: true, phoneNumber: true } },
    lastActionBy: { select: { fullName: true } },
    messages: {
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { fullName: true, role: true } } },
    },
  } as const;

  const orderDetailInclude = {
    listing: {
      include: {
        photos: {
          select: { publicUrl: true, isPrimary: true },
        },
      },
    },
    farmer: {
      select: {
        fullName: true,
        phoneNumber: true,
        farmerProfile: {
          select: {
            lga: true,
            community: true,
          },
        },
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
    statusEvents: {
      include: {
        changedBy: {
          select: { fullName: true },
        },
      },
      orderBy: { createdAt: "asc" as const },
    },
  } as const;

  return {
    async createOffer(data: CreateOfferData): Promise<CommercialOfferDetailSummary> {
      const created = await db.$transaction(async (tx) => {
        const offer = await tx.commercialOffer.create({
          data: {
            offerCode: data.offerCode,
            listingId: data.listingId,
            buyerId: data.buyerId,
            farmerId: data.farmerId,
            status: "PENDING",
            quantity: data.quantity,
            unitCode: data.unitCode,
            unitPrice: data.unitPrice,
            currency: "NGN",
            totalAmount: data.totalAmount,
            fulfillmentMode: data.fulfillmentMode,
            destinationLocation: data.destinationLocation ?? null,
            proposedCollectionDate: data.proposedCollectionDateObj,
            expiresAt: data.expiresAt,
            counterRoundCount: 0,
            lastActionById: data.buyerId,
            messages: {
              create: {
                senderId: data.buyerId,
                action: "INITIATE",
                proposedQuantity: data.quantity,
                proposedUnitPrice: data.unitPrice,
                note: data.note ?? null,
              },
            },
          },
          include: defaultInclude,
        });
        return offer;
      });

      return mapOfferToDetailSummary(created as unknown as RawOfferWithRelations);
    },

    async getOfferById(id: string): Promise<CommercialOfferDetailSummary | null> {
      const offer = await db.commercialOffer.findUnique({
        where: { id },
        include: defaultInclude,
      });

      if (!offer) return null;
      return mapOfferToDetailSummary(offer as unknown as RawOfferWithRelations);
    },

    async listOffersByUser(
      userId: string,
      filter?: OrdersFilterOptions,
    ): Promise<CommercialOfferSummary[]> {
      const where: Record<string, unknown> = {};

      if (filter?.role === "buyer") {
        where.buyerId = userId;
      } else if (filter?.role === "farmer") {
        where.farmerId = userId;
      } else {
        where.OR = [{ buyerId: userId }, { farmerId: userId }];
      }

      if (filter?.status && filter.status !== "ALL") {
        where.status = filter.status;
      }

      const offers = await db.commercialOffer.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: defaultInclude,
      });

      return offers.map((o) =>
        mapOfferToDetailSummary(o as unknown as RawOfferWithRelations),
      );
    },

    async respondToOffer(
      offerId: string,
      data: RespondOfferData,
    ): Promise<CommercialOfferDetailSummary> {
      const updated = await db.$transaction(async (tx) => {
        const updateData: Record<string, unknown> = {
          status: data.newStatus,
          lastActionById: data.actorUserId,
        };

        if (data.incrementCounterRound) {
          updateData.counterRoundCount = { increment: 1 };
        }

        if (data.newQuantity !== undefined && data.newQuantity !== null) {
          updateData.quantity = data.newQuantity;
        }

        if (data.newUnitPrice !== undefined && data.newUnitPrice !== null) {
          updateData.unitPrice = data.newUnitPrice;
        }

        if (data.newTotalAmount !== undefined && data.newTotalAmount !== null) {
          updateData.totalAmount = data.newTotalAmount;
        }

        const offer = await tx.commercialOffer.update({
          where: { id: offerId },
          data: {
            ...updateData,
            messages: {
              create: {
                senderId: data.actorUserId,
                action: data.action,
                proposedQuantity: data.newQuantity ?? null,
                proposedUnitPrice: data.newUnitPrice ?? null,
                note: data.note ?? null,
              },
            },
          },
          include: defaultInclude,
        });

        return offer;
      });

      return mapOfferToDetailSummary(updated as unknown as RawOfferWithRelations);
    },

    async getListingForOffer(listingId: string): Promise<ListingOfferMetadata | null> {
      const listing = await db.produceListing.findUnique({
        where: { id: listingId },
        select: {
          id: true,
          farmerId: true,
          title: true,
          cropCode: true,
          unitCode: true,
          quantity: true,
          pricePerUnit: true,
          minOrderQuantity: true,
          status: true,
          lga: true,
          community: true,
          photos: {
            select: { publicUrl: true, isPrimary: true },
            take: 1,
          },
        },
      });

      if (!listing) return null;

      return {
        id: listing.id,
        farmerId: listing.farmerId,
        title: listing.title,
        cropCode: listing.cropCode,
        unitCode: listing.unitCode,
        quantity: listing.quantity,
        pricePerUnit: Number(listing.pricePerUnit),
        minOrderQuantity: listing.minOrderQuantity,
        status: listing.status,
        lga: listing.lga,
        community: listing.community,
        primaryPhotoUrl: listing.photos[0]?.publicUrl ?? null,
      };
    },

    async recordOrderAudit(entry: OrderAuditInput): Promise<void> {
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

    async createOrderFromAcceptedOffer(
      offerId: string,
      actorUserId: string,
    ): Promise<{ order: OrderDetailSummary; autoDeclinedOfferIds: string[] }> {
      return await db.$transaction(async (tx) => {
        // 1. Fetch the target offer with relations
        const offer = await tx.commercialOffer.findUnique({
          where: { id: offerId },
          include: {
            listing: true,
            buyer: true,
            farmer: true,
          },
        });

        if (!offer) {
          throw new NotFoundError("Offer not found");
        }

        // 2. Concurrency lock on produce listing (PostgreSQL row-level lock)
        await tx.$executeRawUnsafe(
          `SELECT id FROM produce_listings WHERE id = $1 FOR UPDATE`,
          offer.listingId,
        );

        // Fetch fresh listing state under lock
        const freshListing = await tx.produceListing.findUniqueOrThrow({
          where: { id: offer.listingId },
        });

        if (freshListing.status === "SOLD_OUT" || freshListing.status === "CANCELLED") {
          throw new ValidationError("Listing is no longer active or is already sold out");
        }

        if (freshListing.quantity < offer.quantity) {
          throw new ValidationError(
            `Insufficient produce quantity remaining on listing. Available: ${freshListing.quantity}, requested: ${offer.quantity}`,
          );
        }

        // 3. Atomically decrement listing available quantity
        const remainingQuantity = freshListing.quantity - offer.quantity;
        const newListingStatus =
          remainingQuantity === 0 ? "SOLD_OUT" : freshListing.status;

        await tx.produceListing.update({
          where: { id: offer.listingId },
          data: {
            quantity: remainingQuantity,
            status: newListingStatus,
          },
        });

        // 4. Transition accepted offer to ACCEPTED
        await tx.commercialOffer.update({
          where: { id: offerId },
          data: {
            status: "ACCEPTED",
            lastActionById: actorUserId,
          },
        });

        await tx.offerMessage.create({
          data: {
            offerId,
            senderId: actorUserId,
            action: "ACCEPT",
            proposedQuantity: offer.quantity,
            proposedUnitPrice: offer.unitPrice,
            note: "Offer accepted. Official order confirmed.",
          },
        });

        // 5. Auto-decline competing offers exceeding newly remaining quantity
        const autoDeclinedOfferIds: string[] = [];
        const competingOffers = await tx.commercialOffer.findMany({
          where: {
            listingId: offer.listingId,
            id: { not: offerId },
            status: { in: ["PENDING", "COUNTERED"] },
            expiresAt: { gt: new Date() },
          },
        });

        for (const comp of competingOffers) {
          if (comp.quantity > remainingQuantity) {
            await tx.commercialOffer.update({
              where: { id: comp.id },
              data: {
                status: "DECLINED",
                lastActionById: actorUserId,
              },
            });

            await tx.offerMessage.create({
              data: {
                offerId: comp.id,
                senderId: actorUserId,
                action: "DECLINE",
                note: "Auto-declined: listing inventory no longer sufficient for requested quantity",
              },
            });

            autoDeclinedOfferIds.push(comp.id);
          }
        }

        // 6. Generate human-readable order code ORD-YYYYMM-XXXXX (DEC-032) & waybill WB-YYYYMM-XXXXX
        const now = new Date();
        const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
        const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
        const orderCode = `ORD-${yearMonth}-${randomDigits}`;
        const waybillNumber = `WB-${yearMonth}-${randomDigits}`;
        const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();
        const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();

        // 7. Calculate estimated total weight in kg
        const weightKg =
          estimateWeightKg(offer.quantity, offer.unitCode) ??
          offer.quantity * (freshListing.estimatedWeightKg / Math.max(1, freshListing.quantity));

        // 8. Create Order record
        const createdOrder = await tx.order.create({
          data: {
            orderCode,
            waybillNumber,
            pickupPin,
            deliveryPin,
            offerId,
            listingId: offer.listingId,
            farmerId: offer.farmerId,
            buyerId: offer.buyerId,
            cropCode: freshListing.cropCode,
            quantity: offer.quantity,
            unitCode: offer.unitCode,
            estimatedWeightKg: weightKg,
            unitPrice: offer.unitPrice,
            totalAmount: offer.totalAmount,
            currency: offer.currency,
            fulfillmentMode: offer.fulfillmentMode,
            destinationLocation: offer.destinationLocation,
            proposedCollectionDate: offer.proposedCollectionDate,
            status: "CONFIRMED",
            paymentArrangementNote:
              "Direct settlement between Buyer and Farmer; zero platform fund custody (Section 19)",
          },
        });

        // 9. Initial OrderStatusEvent milestone
        await tx.orderStatusEvent.create({
          data: {
            orderId: createdOrder.id,
            fromStatus: null,
            toStatus: "CONFIRMED",
            changedById: actorUserId,
            note: "Order confirmed following accepted purchase terms",
          },
        });

        // 10. Audit log entry
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: "ORDER_CREATED",
            entityType: "ORDER",
            entityId: createdOrder.id,
            metadata: {
              orderCode,
              waybillNumber,
              offerId,
              listingId: offer.listingId,
              quantity: offer.quantity,
              totalAmount: Number(offer.totalAmount),
              autoDeclinedOffersCount: autoDeclinedOfferIds.length,
            },
          },
        });

        // Fetch full order with relations
        const fullOrder = await tx.order.findUniqueOrThrow({
          where: { id: createdOrder.id },
          include: orderDetailInclude,
        });

        return {
          order: mapToOrderDetailSummary(fullOrder as unknown as RawOrderWithRelations),
          autoDeclinedOfferIds,
        };
      });
    },

    async getOrderById(orderId: string): Promise<OrderDetailSummary | null> {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: orderDetailInclude,
      });

      if (!order) return null;
      return mapToOrderDetailSummary(order as unknown as RawOrderWithRelations);
    },

    async listOrdersByUser(
      userId: string,
      filter?: OrdersFilterOptions,
    ): Promise<OrderSummary[]> {
      const whereClause: Record<string, unknown> = {};

      if (filter?.role === "farmer") {
        whereClause.farmerId = userId;
      } else if (filter?.role === "buyer") {
        whereClause.buyerId = userId;
      } else {
        whereClause.OR = [{ farmerId: userId }, { buyerId: userId }];
      }

      if (filter?.status) {
        whereClause.status = filter.status;
      }

      const rows = await db.order.findMany({
        where: whereClause,
        include: {
          listing: {
            include: {
              photos: {
                select: { publicUrl: true, isPrimary: true },
              },
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
        },
        orderBy: { createdAt: "desc" },
      });

      return rows.map((r) => mapToOrderSummary(r as unknown as RawOrderWithRelations));
    },

    async updateOrderStatus(
      orderId: string,
      toStatus: string,
      changedById: string,
      note?: string | null,
    ): Promise<OrderDetailSummary> {
      return await db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
        });

        if (!order) {
          throw new NotFoundError("Order not found");
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: toStatus as OrderStatus },
        });

        await tx.orderStatusEvent.create({
          data: {
            orderId,
            fromStatus: order.status,
            toStatus: toStatus as OrderStatus,
            changedById,
            note: note ?? null,
          },
        });

        await tx.auditLog.create({
          data: {
            actorUserId: changedById,
            action: "ORDER_STATUS_UPDATED",
            entityType: "ORDER",
            entityId: orderId,
            metadata: {
              orderCode: order.orderCode,
              fromStatus: order.status,
              toStatus,
              note: note ?? null,
            },
          },
        });

        const fullOrder = await tx.order.findUniqueOrThrow({
          where: { id: orderId },
          include: orderDetailInclude,
        });

        return mapToOrderDetailSummary(fullOrder as unknown as RawOrderWithRelations);
      });
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
      return await db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
        });

        if (!order) {
          throw new NotFoundError("Order not found");
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "CANCELLED",
            cancellationReason: reason,
          },
        });

        await tx.orderStatusEvent.create({
          data: {
            orderId,
            fromStatus: order.status,
            toStatus: "CANCELLED",
            changedById,
            note: `Cancelled: ${reason}`,
          },
        });

        const listing = await tx.produceListing.findUnique({
          where: { id: order.listingId },
        });

        let listingReactivated = false;
        if (listing) {
          const restoredQty = listing.quantity + order.quantity;
          const reactivate = listing.status === "SOLD_OUT";
          listingReactivated = reactivate;

          await tx.produceListing.update({
            where: { id: order.listingId },
            data: {
              quantity: restoredQty,
              status: reactivate ? "ACTIVE" : listing.status,
            },
          });
        }

        await tx.auditLog.create({
          data: {
            actorUserId: changedById,
            action: "ORDER_CANCELLED",
            entityType: "ORDER",
            entityId: orderId,
            metadata: {
              orderCode: order.orderCode,
              reason,
              restoredQuantity: order.quantity,
              listingReactivated,
            },
          },
        });

        const fullOrder = await tx.order.findUniqueOrThrow({
          where: { id: orderId },
          include: orderDetailInclude,
        });

        return {
          order: mapToOrderDetailSummary(fullOrder as unknown as RawOrderWithRelations),
          restoredQuantity: order.quantity,
          listingReactivated,
        };
      });
    },

    async disputeOrder(
      orderId: string,
      reason: string,
      changedById: string,
    ): Promise<OrderDetailSummary> {
      return await db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
        });

        if (!order) {
          throw new NotFoundError("Order not found");
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: "DISPUTED" },
        });

        await tx.orderStatusEvent.create({
          data: {
            orderId,
            fromStatus: order.status,
            toStatus: "DISPUTED",
            changedById,
            note: `Dispute filed: ${reason}`,
          },
        });

        await tx.auditLog.create({
          data: {
            actorUserId: changedById,
            action: "ORDER_DISPUTED",
            entityType: "ORDER",
            entityId: orderId,
            metadata: {
              orderCode: order.orderCode,
              reason,
              previousStatus: order.status,
            },
          },
        });

        const fullOrder = await tx.order.findUniqueOrThrow({
          where: { id: orderId },
          include: orderDetailInclude,
        });

        return mapToOrderDetailSummary(fullOrder as unknown as RawOrderWithRelations);
      });
    },

    async verifyPickupPin(
      orderId: string,
      pin: string,
      actorUserId: string,
    ): Promise<OrderDetailSummary> {
      return await db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
        });

        if (!order) {
          throw new NotFoundError("Order not found");
        }

        if (order.pickupPin !== pin) {
          throw new ValidationError(
            "Invalid pickup verification PIN. Please confirm the 4-digit PIN with the farmer at collection.",
          );
        }

        const now = new Date();
        await tx.order.update({
          where: { id: orderId },
          data: {
            pickupVerifiedAt: now,
            status: "COLLECTED",
          },
        });

        await tx.orderStatusEvent.create({
          data: {
            orderId,
            fromStatus: order.status,
            toStatus: "COLLECTED",
            changedById: actorUserId,
            note: "Farm-gate produce collection verified and authenticated via 4-digit Pickup PIN",
          },
        });

        await tx.auditLog.create({
          data: {
            actorUserId,
            action: "ORDER_PICKUP_VERIFIED",
            entityType: "ORDER",
            entityId: orderId,
            metadata: {
              orderCode: order.orderCode,
              pickupVerifiedAt: now.toISOString(),
            },
          },
        });

        const fullOrder = await tx.order.findUniqueOrThrow({
          where: { id: orderId },
          include: orderDetailInclude,
        });

        return mapToOrderDetailSummary(fullOrder as unknown as RawOrderWithRelations);
      });
    },

    async verifyDeliveryPin(
      orderId: string,
      pin: string,
      actorUserId: string,
    ): Promise<OrderDetailSummary> {
      return await db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
        });

        if (!order) {
          throw new NotFoundError("Order not found");
        }

        if (order.deliveryPin !== pin) {
          throw new ValidationError(
            "Invalid delivery verification PIN. Please confirm the 4-digit PIN with the receiving buyer.",
          );
        }

        const now = new Date();
        await tx.order.update({
          where: { id: orderId },
          data: {
            deliveryVerifiedAt: now,
            status: "DELIVERED",
          },
        });

        await tx.orderStatusEvent.create({
          data: {
            orderId,
            fromStatus: order.status,
            toStatus: "DELIVERED",
            changedById: actorUserId,
            note: "Dropoff delivery verified and authenticated via Buyer 4-digit Delivery PIN",
          },
        });

        await tx.auditLog.create({
          data: {
            actorUserId,
            action: "ORDER_DELIVERY_VERIFIED",
            entityType: "ORDER",
            entityId: orderId,
            metadata: {
              orderCode: order.orderCode,
              deliveryVerifiedAt: now.toISOString(),
            },
          },
        });

        const fullOrder = await tx.order.findUniqueOrThrow({
          where: { id: orderId },
          include: orderDetailInclude,
        });

        return mapToOrderDetailSummary(fullOrder as unknown as RawOrderWithRelations);
      });
    },

    async getWaybillByOrderId(orderId: string): Promise<WaybillSummary | null> {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: {
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
              farmerProfile: {
                select: {
                  lga: true,
                  community: true,
                },
              },
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
        },
      });

      if (!order) return null;

      const pickupLga =
        order.listing?.lga ||
        order.farmer?.farmerProfile?.lga ||
        "Benue Central Hub";
      const pickupCommunity =
        order.listing?.community ||
        order.farmer?.farmerProfile?.community ||
        null;

      return {
        waybillNumber: order.waybillNumber || `WB-${order.orderCode}`,
        orderId: order.id,
        orderCode: order.orderCode,
        cropCode: order.cropCode,
        quantity: order.quantity,
        unitCode: order.unitCode,
        estimatedWeightKg: Number(order.estimatedWeightKg),
        totalAmount: Number(order.totalAmount),
        currency: order.currency,
        corridorRoute: order.corridorRoute,
        estimatedFreightFee:
          order.estimatedFreightFee != null
            ? Number(order.estimatedFreightFee)
            : null,
        pickupLga,
        pickupCommunity,
        destinationLocation: order.destinationLocation,
        farmerName: order.farmer?.fullName || "Farmer",
        farmerPhone: order.farmer?.phoneNumber || "",
        buyerName: order.buyer?.fullName || "Buyer",
        buyerPhone: order.buyer?.phoneNumber || "",
        transporterName: order.transporter?.fullName || null,
        transporterPhone: order.transporter?.phoneNumber || null,
        status: order.status as OrderStatus,
        pickupVerifiedAt: order.pickupVerifiedAt
          ? order.pickupVerifiedAt.toISOString()
          : null,
        deliveryVerifiedAt: order.deliveryVerifiedAt
          ? order.deliveryVerifiedAt.toISOString()
          : null,
        createdAt: order.createdAt.toISOString(),
      };
    },
  };
}

