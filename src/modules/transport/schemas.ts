import { z } from "zod";
import type { OrderStatus } from "@/modules/orders/schemas";

export const claimTransportOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export type ClaimTransportOrderInput = z.infer<typeof claimTransportOrderSchema>;

export interface TransportRequestSummary {
  id: string;
  orderCode: string;
  cropCode: string;
  quantity: number;
  unitCode: string;
  estimatedWeightKg: number;
  listingLga: string;
  listingCommunity: string | null;
  destinationLocation: string | null;
  proposedCollectionDate: string | null;
  corridorRoute: string | null;
  estimatedFreightFee: number | null;
  farmerName?: string;
  farmerPhone?: string;
  buyerName?: string;
  buyerPhone?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface TransporterAssignmentSummary extends TransportRequestSummary {
  transporterId: string;
  transporterName?: string;
  transporterPhone?: string;
}

export interface VerifiedTransporterSummary {
  id: string;
  userId: string;
  operatorName: string;
  phoneNumber: string;
  vehicleTypes: string[];
  maxCapacityKg: number;
  operatingLgas: string[];
  isAvailable: boolean;
  pricingModel: string;
  verificationStatus: string;
  verifiedAt: string | null;
  averageRating: number | null;
  reviewCount: number;
}

export const submitCarrierReviewSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5 stars")
    .max(5, "Rating must be between 1 and 5 stars"),
  timelinessScore: z.number().int().min(1).max(5).default(5),
  cargoCareScore: z.number().int().min(1).max(5).default(5),
  communicationScore: z.number().int().min(1).max(5).default(5),
  comment: z
    .string()
    .trim()
    .max(500, "Review remarks must be under 500 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
});

export type SubmitCarrierReviewInput = z.infer<typeof submitCarrierReviewSchema>;

export interface CarrierReviewSummary {
  id: string;
  orderId: string;
  orderCode: string;
  transporterId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  rating: number;
  timelinessScore: number;
  cargoCareScore: number;
  communicationScore: number;
  comment: string | null;
  createdAt: string;
}

export interface TransporterRatingAggregate {
  transporterId: string;
  averageRating: number;
  totalReviews: number;
  avgTimeliness: number;
  avgCargoCare: number;
  avgCommunication: number;
}


