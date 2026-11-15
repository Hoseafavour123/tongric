import { z } from "zod";
import { BENUE_LGAS, PRODUCE_CROP_CATALOG } from "@/modules/i18n/catalogs";

export const VALID_LGA_CODES = new Set(BENUE_LGAS.map((l) => l.code));
export const VALID_CROP_CODES = new Set(PRODUCE_CROP_CATALOG.map((c) => c.code));

export type VerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export const BUYER_TYPES = [
  "PROCESSOR",
  "WHOLESALER",
  "RETAILER",
  "RESTAURANT_HOTEL",
  "INSTITUTIONAL",
] as const;

export type BuyerType = (typeof BUYER_TYPES)[number];

export const VEHICLE_TYPES = [
  "MOTORCYCLE_TRICYCLE",
  "PICKUP",
  "VAN",
  "TRUCK",
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const PRICING_MODELS = [
  "FIXED_RATE_CARD",
  "QUOTE_ON_REQUEST",
] as const;

export type PricingModel = (typeof PRICING_MODELS)[number];

export function normalizeLgaCode(input: string): string | null {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, "-");
  if (VALID_LGA_CODES.has(normalized)) {
    return normalized;
  }
  const matchByName = BENUE_LGAS.find(
    (l) => l.name.toLowerCase() === input.trim().toLowerCase(),
  );
  return matchByName ? matchByName.code : null;
}

export function isValidCropCode(input: string): boolean {
  return VALID_CROP_CODES.has(input.trim().toLowerCase());
}

/* -------------------------------------------------------------------------- */
/* Farmer Profile Schema & Types                                              */
/* -------------------------------------------------------------------------- */

export const farmerProfileSchema = z.object({
  lga: z
    .string({
      required_error: "Please select your Local Government Area (LGA).",
    })
    .trim()
    .transform((val) => normalizeLgaCode(val) ?? "")
    .refine((val) => val.length > 0, {
      message: "Please select a valid Benue State Local Government Area.",
    }),
  community: z
    .string({
      required_error: "Community or village name is required.",
    })
    .trim()
    .min(2, "Community or village name must be at least 2 characters.")
    .max(120, "Community name must be under 120 characters."),
  primaryCrops: z
    .array(z.string().trim().toLowerCase())
    .min(1, "Select at least one crop that you farm.")
    .max(10, "You can select up to 10 crops.")
    .refine((crops) => crops.every((c) => isValidCropCode(c)), {
      message: "One or more selected crops are not in the Benue pilot catalog.",
    })
    .transform((crops) => Array.from(new Set(crops))),
  cooperativeName: z
    .string()
    .trim()
    .max(160, "Cooperative name must be under 160 characters.")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  farmSizeHectares: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === undefined || val === null || val === "") {
        return null;
      }
      const num = typeof val === "number" ? val : parseFloat(val);
      if (Number.isNaN(num) || !Number.isFinite(num) || num <= 0 || num > 10000) {
        return null;
      }
      return Math.round(num * 100) / 100;
    }),
});

export type UpsertFarmerProfileInput = z.infer<typeof farmerProfileSchema>;

export interface RawFarmerProfileInput {
  lga?: unknown;
  community?: unknown;
  primaryCrops?: unknown;
  cooperativeName?: unknown;
  farmSizeHectares?: unknown;
}

export interface FarmerProfileSummary {
  id: string;
  userId: string;
  state: string;
  lga: string;
  community: string;
  primaryCrops: string[];
  cooperativeName: string | null;
  farmSizeHectares: number | null;
  verificationStatus: VerificationStatus;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isComplete: boolean;
}

/* -------------------------------------------------------------------------- */
/* Buyer Profile Schema & Types                                               */
/* -------------------------------------------------------------------------- */

export const buyerProfileSchema = z.object({
  businessName: z
    .string({
      required_error: "Business or buyer name is required.",
    })
    .trim()
    .min(2, "Business name must be at least 2 characters.")
    .max(160, "Business name must be under 160 characters."),
  buyerType: z.enum(BUYER_TYPES, {
    required_error: "Please select your buyer category.",
  }),
  operatingLga: z
    .string({
      required_error: "Please select your operating LGA in Benue State.",
    })
    .trim()
    .transform((val) => normalizeLgaCode(val) ?? "")
    .refine((val) => val.length > 0, {
      message: "Please select a valid Benue State Local Government Area.",
    }),
  primaryMarket: z
    .string()
    .trim()
    .max(120, "Market name must be under 120 characters.")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  cropsSourced: z
    .array(z.string().trim().toLowerCase())
    .min(1, "Select at least one crop that you typically buy.")
    .max(10, "You can select up to 10 crops.")
    .refine((crops) => crops.every((c) => isValidCropCode(c)), {
      message: "One or more selected crops are not in the Benue pilot catalog.",
    })
    .transform((crops) => Array.from(new Set(crops))),
});

export type UpsertBuyerProfileInput = z.infer<typeof buyerProfileSchema>;

export interface RawBuyerProfileInput {
  businessName?: unknown;
  buyerType?: unknown;
  operatingLga?: unknown;
  primaryMarket?: unknown;
  cropsSourced?: unknown;
}

export interface BuyerProfileSummary {
  id: string;
  userId: string;
  businessName: string;
  buyerType: BuyerType;
  state: string;
  operatingLga: string;
  primaryMarket: string | null;
  cropsSourced: string[];
  verificationStatus: VerificationStatus;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isComplete: boolean;
}

/* -------------------------------------------------------------------------- */
/* Transport Provider Profile Schema & Types                                 */
/* -------------------------------------------------------------------------- */

export const transportProfileSchema = z.object({
  operatorName: z
    .string({
      required_error: "Operator or fleet business name is required.",
    })
    .trim()
    .min(2, "Operator name must be at least 2 characters.")
    .max(160, "Operator name must be under 160 characters."),
  vehicleTypes: z
    .array(z.enum(VEHICLE_TYPES))
    .min(1, "Select at least one vehicle type in your fleet.")
    .transform((items) => Array.from(new Set(items))),
  maxCapacityKg: z.coerce
    .number({
      required_error: "Maximum load capacity in kilograms is required.",
    })
    .int("Capacity must be a whole number of kilograms.")
    .min(50, "Capacity must be at least 50 kg.")
    .max(50000, "Capacity cannot exceed 50,000 kg (50 tonnes)."),
  operatingLgas: z
    .array(z.string().trim().toLowerCase())
    .min(1, "Select at least one operating LGA where you provide transport.")
    .max(23, "You can select up to 23 Benue LGAs.")
    .transform((lgas) =>
      Array.from(
        new Set(
          lgas
            .map((l) => normalizeLgaCode(l))
            .filter((l): l is string => Boolean(l)),
        ),
      ),
    )
    .refine((lgas) => lgas.length > 0, {
      message: "Select at least one valid Benue State Local Government Area.",
    }),
  isAvailable: z.boolean().default(true),
  pricingModel: z.enum(PRICING_MODELS).default("QUOTE_ON_REQUEST"),
});

export type UpsertTransportProfileInput = z.infer<typeof transportProfileSchema>;

export interface RawTransportProfileInput {
  operatorName?: unknown;
  vehicleTypes?: unknown;
  maxCapacityKg?: unknown;
  operatingLgas?: unknown;
  isAvailable?: unknown;
  pricingModel?: unknown;
}

export interface TransportProfileSummary {
  id: string;
  userId: string;
  operatorName: string;
  vehicleTypes: VehicleType[];
  maxCapacityKg: number;
  operatingLgas: string[];
  isAvailable: boolean;
  pricingModel: PricingModel;
  verificationStatus: VerificationStatus;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isComplete: boolean;
}

/* -------------------------------------------------------------------------- */
/* Verification Document Submission & Review Schemas & Types                 */
/* -------------------------------------------------------------------------- */

export const DOCUMENT_TYPES = [
  "NATIONAL_ID",
  "VOTERS_CARD",
  "DRIVERS_LICENSE",
  "CAC_CERTIFICATE",
  "COOPERATIVE_LETTER",
  "COMMUNITY_ATTESTATION",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const verificationSubmissionSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES, {
    required_error: "Document type is required.",
  }),
  documentNumber: z
    .string()
    .trim()
    .max(100, "Document number must be under 100 characters.")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
});

export type VerificationSubmissionInput = z.infer<
  typeof verificationSubmissionSchema
>;

export const adminReviewSchema = z.object({
  decision: z.enum(["VERIFY", "REJECT"], {
    required_error: "Review decision must be VERIFY or REJECT.",
  }),
  reason: z
    .string()
    .trim()
    .max(500, "Review note must be under 500 characters.")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
});

export type AdminReviewInput = z.infer<typeof adminReviewSchema>;

export interface VerificationDocumentSummary {
  id: string;
  userId: string;
  documentType: DocumentType;
  documentNumber: string | null;
  fileStoragePath: string;
  fileMimeType: string;
  fileSizeBytes: number;
  notes: string | null;
  status: VerificationStatus;
  reviewedByUserId: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminVerificationQueueItem
  extends VerificationDocumentSummary {
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    role: string;
  };
  previewUrl?: string;
}
