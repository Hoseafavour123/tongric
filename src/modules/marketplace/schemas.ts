import { z } from "zod";
import {
  BENUE_LGAS,
  PRODUCE_CROP_CATALOG,
  PRODUCE_UNIT_CATALOG,
} from "@/modules/i18n/catalogs";

const validCropCodes = PRODUCE_CROP_CATALOG.map((c) => c.code) as [
  string,
  ...string[],
];
const validUnitCodes = PRODUCE_UNIT_CATALOG.map((u) => u.code) as [
  string,
  ...string[],
];
const validLgaCodes = BENUE_LGAS.map((l) => l.code) as [string, ...string[]];

export const produceGradeEnum = z.enum(["GRADE_A", "GRADE_B", "GRADE_C"]);
export type ProduceGrade = z.infer<typeof produceGradeEnum>;

export const listingStatusEnum = z.enum([
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "SOLD_OUT",
  "CANCELLED",
]);
export type ListingStatus = z.infer<typeof listingStatusEnum>;

export const availabilityStatusEnum = z.enum([
  "AVAILABLE_NOW",
  "UPCOMING_HARVEST",
]);
export type AvailabilityStatus = z.infer<typeof availabilityStatusEnum>;

export const listingPhotoInputSchema = z.object({
  fileStoragePath: z.string().min(1, "Storage path is required"),
  publicUrl: z.string().url("Valid image URL is required"),
  mimeType: z.string().regex(/^image\/(jpeg|png|webp)$/, "Invalid image type"),
  sizeBytes: z.number().int().positive("File size must be positive"),
  isPrimary: z.boolean().default(false),
});
export type ListingPhotoInput = z.infer<typeof listingPhotoInputSchema>;

export const createListingSchema = z
  .object({
    cropCode: z.enum(validCropCodes, {
      errorMap: () => ({ message: "Please select a valid crop from the catalog" }),
    }),
    grade: produceGradeEnum.default("GRADE_B"),
    quantity: z.coerce
      .number()
      .int("Quantity must be a whole number")
      .positive("Quantity must be at least 1"),
    unitCode: z.enum(validUnitCodes, {
      errorMap: () => ({ message: "Please select a valid packaging unit" }),
    }),
    pricePerUnit: z.coerce
      .number()
      .positive("Price must be greater than ₦0"),
    currency: z.string().default("NGN"),
    minOrderQuantity: z.coerce
      .number()
      .int("MOQ must be a whole number")
      .positive("MOQ must be at least 1")
      .default(1),
    isNegotiable: z.boolean().default(true),
    availabilityStatus: availabilityStatusEnum.default("AVAILABLE_NOW"),
    harvestDate: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
    state: z.literal("Benue").default("Benue"),
    lga: z.enum(validLgaCodes, {
      errorMap: () => ({ message: "Please select an LGA in Benue State" }),
    }),
    community: z
      .string()
      .trim()
      .min(2, "Community or town must be at least 2 characters")
      .max(100, "Community name is too long"),
    description: z
      .string()
      .trim()
      .max(1000, "Description must be under 1000 characters")
      .optional()
      .nullable()
      .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
    photos: z.array(listingPhotoInputSchema).max(4, "Up to 4 photos permitted").default([]),
  })
  .refine(
    (data) => {
      if (data.availabilityStatus === "UPCOMING_HARVEST") {
        return !!data.harvestDate;
      }
      return true;
    },
    {
      message: "Estimated harvest date is required for upcoming harvests",
      path: ["harvestDate"],
    },
  )
  .refine((data) => data.minOrderQuantity <= data.quantity, {
    message: "Minimum order quantity cannot exceed total available quantity",
    path: ["minOrderQuantity"],
  });

export type CreateListingInput = z.infer<typeof createListingSchema>;

export interface ListingPhotoSummary {
  id: string;
  listingId: string;
  fileStoragePath: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
  isPrimary: boolean;
  createdAt: string;
}

export type ListingSortOption = "newest" | "price_asc" | "price_desc" | "quantity_desc";

export interface ProduceListingSummary {
  id: string;
  farmerId: string;
  farmerName?: string;
  farmerPhone?: string;
  farmerVerificationStatus?: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  cooperativeName?: string | null;
  title: string;
  cropCode: string;
  cropCategory: string;
  grade: ProduceGrade;
  quantity: number;
  unitCode: string;
  estimatedWeightKg: number;
  pricePerUnit: number;
  currency: string;
  minOrderQuantity: number;
  isNegotiable: boolean;
  availabilityStatus: AvailabilityStatus;
  harvestDate: string | null;
  state: string;
  lga: string;
  community: string;
  description: string | null;
  status: ListingStatus;
  primaryPhotoUrl: string | null;
  photos: ListingPhotoSummary[];
  createdAt: string;
  updatedAt: string;
}

