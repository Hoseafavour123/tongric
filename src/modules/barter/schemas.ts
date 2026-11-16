import { z } from "zod";

export const exchangeItemTypeEnum = z.enum(["CROP", "SEED", "TOOL", "EQUIPMENT"]);
export type ExchangeItemType = z.infer<typeof exchangeItemTypeEnum>;

export const exchangeListingStatusEnum = z.enum(["OPEN", "AGREED", "COMPLETED", "CANCELLED"]);
export type ExchangeListingStatus = z.infer<typeof exchangeListingStatusEnum>;

export const exchangeOfferStatusEnum = z.enum(["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]);
export type ExchangeOfferStatus = z.infer<typeof exchangeOfferStatusEnum>;

export const exchangeAgreementStatusEnum = z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]);
export type ExchangeAgreementStatus = z.infer<typeof exchangeAgreementStatusEnum>;

export const createExchangeListingSchema = z.object({
  offeredItemType: exchangeItemTypeEnum.default("CROP"),
  offeredCropId: z.string().trim().optional().nullable(),
  offeredTitle: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  offeredDescription: z.string().trim().min(5, "Description must be at least 5 characters").max(1000),
  offeredQty: z.number().positive("Quantity must be greater than 0"),
  offeredUnit: z.string().trim().min(1, "Unit is required").max(50),
  desiredDescription: z.string().trim().min(3, "Desired items description is required").max(1000),
  desiredQty: z.number().positive("Desired quantity must be greater than 0").optional().nullable(),
  desiredUnit: z.string().trim().max(50).optional().nullable(),
  locationLga: z.string().trim().min(2, "LGA is required").max(60),
});

export type CreateExchangeListingInput = z.infer<typeof createExchangeListingSchema>;

export const exchangeListingFilterSchema = z.object({
  status: exchangeListingStatusEnum.optional(),
  locationLga: z.string().trim().optional(),
  itemType: exchangeItemTypeEnum.optional(),
  search: z.string().trim().optional(),
  farmerId: z.string().trim().optional(),
});

export type ExchangeListingFilter = z.infer<typeof exchangeListingFilterSchema>;

export const createExchangeOfferSchema = z.object({
  offeredItemDescription: z.string().trim().min(3, "Offered item description must be at least 3 characters").max(1000),
  offeredQty: z.number().positive("Quantity must be greater than 0"),
  offeredUnit: z.string().trim().min(1, "Unit is required").max(50),
  message: z.string().trim().max(500).optional().nullable(),
});

export type CreateExchangeOfferInput = z.infer<typeof createExchangeOfferSchema>;

export const calculateBarterRatioSchema = z.object({
  offeredCropCode: z.string().trim().min(1, "Offered crop code is required"),
  offeredQuantity: z.number().positive("Quantity must be greater than 0"),
  offeredUnitCode: z.string().trim().min(1, "Offered unit code is required"),
  requestedCropCode: z.string().trim().min(1, "Requested crop code is required"),
  requestedUnitCode: z.string().trim().min(1, "Requested unit code is required"),
});

export type CalculateBarterRatioInput = z.infer<typeof calculateBarterRatioSchema>;

export interface ExchangeListingSummary {
  id: string;
  ownerFarmerId: string;
  ownerFarmerName: string;
  ownerFarmerPhone: string;
  offeredItemType: ExchangeItemType;
  offeredCropId: string | null;
  offeredTitle: string;
  offeredDescription: string;
  offeredQty: number;
  offeredUnit: string;
  desiredDescription: string;
  desiredQty: number | null;
  desiredUnit: string | null;
  locationLga: string;
  status: ExchangeListingStatus;
  offersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeOfferSummary {
  id: string;
  listingId: string;
  proposerFarmerId: string;
  proposerFarmerName: string;
  proposerFarmerPhone: string;
  offeredItemDescription: string;
  offeredQty: number;
  offeredUnit: string;
  message: string | null;
  status: ExchangeOfferStatus;
  createdAt: string;
}

export interface ExchangeAgreementSummary {
  id: string;
  listingId: string;
  listingTitle: string;
  offerId: string;
  farmerAId: string;
  farmerAName: string;
  farmerAPhone: string;
  farmerBId: string;
  farmerBName: string;
  farmerBPhone: string;
  termsSummary: string;
  farmerAConfirmedAt: string | null;
  farmerBConfirmedAt: string | null;
  status: ExchangeAgreementStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BarterCalculationResult {
  offeredCropCode: string;
  offeredQuantity: number;
  offeredUnitCode: string;
  requestedCropCode: string;
  requestedUnitCode: string;
  estimatedOfferedValueNgn: number;
  estimatedRequestedUnitValueNgn: number;
  recommendedExchangeRatio: number;
  suggestedCounterpartQuantity: number;
  fairValueEquivalenceNote: string;
}

