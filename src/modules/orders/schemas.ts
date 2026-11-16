import { z } from "zod";

export const offerStatusEnum = z.enum([
  "PENDING",
  "COUNTERED",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "WITHDRAWN",
]);

export type OfferStatus = z.infer<typeof offerStatusEnum>;

export const fulfillmentModeEnum = z.enum([
  "BUYER_ARRANGES_PICKUP",
  "FARMER_ARRANGES_DELIVERY",
  "TONGRIC_LOGISTICS_REQUEST",
]);

export type FulfillmentMode = z.infer<typeof fulfillmentModeEnum>;

export const offerResponseActionEnum = z.enum([
  "ACCEPT",
  "DECLINE",
  "COUNTER",
  "WITHDRAW",
]);

export type OfferResponseAction = z.infer<typeof offerResponseActionEnum>;

export const createOfferSchema = z.object({
  listingId: z.string().trim().min(2, "Invalid listing ID"),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1"),
  unitPrice: z.coerce
    .number()
    .positive("Proposed unit price must be greater than ₦0"),
  fulfillmentMode: fulfillmentModeEnum.default("BUYER_ARRANGES_PICKUP"),
  destinationLocation: z
    .string()
    .trim()
    .max(200, "Destination address must be under 200 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  proposedCollectionDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  note: z
    .string()
    .trim()
    .max(1000, "Note must be under 1000 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const respondOfferSchema = z
  .object({
    action: offerResponseActionEnum,
    proposedQuantity: z.coerce
      .number()
      .int()
      .positive("Counter quantity must be greater than 0")
      .optional()
      .nullable(),
    proposedUnitPrice: z.coerce
      .number()
      .positive("Counter unit price must be greater than ₦0")
      .optional()
      .nullable(),
    note: z
      .string()
      .trim()
      .max(1000, "Note must be under 1000 characters")
      .optional()
      .nullable()
      .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  })
  .refine(
    (data) => {
      if (data.action === "COUNTER") {
        return (
          data.proposedQuantity !== undefined &&
          data.proposedQuantity !== null &&
          data.proposedUnitPrice !== undefined &&
          data.proposedUnitPrice !== null
        );
      }
      return true;
    },
    {
      message: "Counter-offer requires both proposed quantity and proposed unit price",
      path: ["proposedUnitPrice"],
    },
  );

export type RespondOfferInput = z.infer<typeof respondOfferSchema>;

export interface OfferMessageSummary {
  id: string;
  offerId: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  action: string;
  proposedQuantity: number | null;
  proposedUnitPrice: number | null;
  note: string | null;
  createdAt: string;
}

export interface CommercialOfferSummary {
  id: string;
  offerCode: string;
  listingId: string;
  listingTitle?: string;
  cropCode?: string;
  isPerishable?: boolean;
  primaryPhotoUrl?: string | null;
  buyerId: string;
  buyerName?: string;
  buyerPhone?: string;
  farmerId: string;
  farmerName?: string;
  farmerPhone?: string;
  status: OfferStatus;
  quantity: number;
  unitCode: string;
  unitPrice: number;
  currency: string;
  totalAmount: number;
  fulfillmentMode: FulfillmentMode;
  destinationLocation: string | null;
  proposedCollectionDate: string | null;
  expiresAt: string;
  isExpired: boolean;
  counterRoundCount: number;
  lastActionById: string;
  lastActionByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommercialOfferDetailSummary extends CommercialOfferSummary {
  listingQuantity: number;
  listingUnitPrice: number;
  listingMinOrderQuantity: number;
  listingLga: string;
  listingCommunity: string;
  messages: OfferMessageSummary[];
}

export const orderStatusEnum = z.enum([
  "CONFIRMED",
  "TRANSPORT_REQUESTED",
  "TRANSPORT_ASSIGNED",
  "COLLECTED",
  "IN_TRANSIT",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
]);

export type OrderStatus = z.infer<typeof orderStatusEnum>;

export interface OrderStatusEventSummary {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedById: string;
  changedByName?: string;
  note: string | null;
  createdAt: string;
}

export interface OrderSummary {
  id: string;
  orderCode: string;
  offerId: string;
  listingId: string;
  listingTitle?: string;
  cropCode: string;
  primaryPhotoUrl?: string | null;
  isPerishable?: boolean;
  farmerId: string;
  farmerName?: string;
  farmerPhone?: string;
  buyerId: string;
  buyerName?: string;
  buyerPhone?: string;
  quantity: number;
  unitCode: string;
  estimatedWeightKg: number;
  unitPrice: number;
  currency: string;
  totalAmount: number;
  fulfillmentMode: FulfillmentMode;
  destinationLocation: string | null;
  proposedCollectionDate: string | null;
  status: OrderStatus;
  paymentArrangementNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetailSummary extends OrderSummary {
  listingLga?: string;
  listingCommunity?: string;
  farmerAddress?: string;
  cancellationReason?: string | null;
  statusEvents: OrderStatusEventSummary[];
}

export const updateOrderStatusSchema = z.object({
  toStatus: orderStatusEnum,
  note: z
    .string()
    .trim()
    .max(500, "Note must be under 500 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const cancelOrderSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Cancellation reason must be at least 5 characters")
    .max(500, "Cancellation reason must be under 500 characters"),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export const disputeOrderSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Dispute reason must be at least 5 characters")
    .max(500, "Dispute reason must be under 500 characters"),
});

export type DisputeOrderInput = z.infer<typeof disputeOrderSchema>;



