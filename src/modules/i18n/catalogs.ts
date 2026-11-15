import type { TranslationKeyId } from "./base-dictionary.ts";

export type CropCategoryGroup =
  | "horticulture"
  | "tuber"
  | "grain_legume"
  | "tree_crop"
  | "other";

export interface CropCatalogItem {
  code: string;
  labelKey: TranslationKeyId;
  isPerishable: boolean;
  category: CropCategoryGroup;
}

export const PRODUCE_CROP_CATALOG: readonly CropCatalogItem[] = [
  {
    code: "tomatoes",
    labelKey: "crop.tomatoes",
    isPerishable: true,
    category: "horticulture",
  },
  {
    code: "pepper",
    labelKey: "crop.pepper",
    isPerishable: true,
    category: "horticulture",
  },
  {
    code: "mangoes",
    labelKey: "crop.mangoes",
    isPerishable: true,
    category: "tree_crop",
  },
  {
    code: "cashew",
    labelKey: "crop.cashew",
    isPerishable: false,
    category: "tree_crop",
  },
  {
    code: "yam",
    labelKey: "crop.yam",
    isPerishable: false,
    category: "tuber",
  },
  {
    code: "cassava",
    labelKey: "crop.cassava",
    isPerishable: true,
    category: "tuber",
  },
  {
    code: "rice",
    labelKey: "crop.rice",
    isPerishable: false,
    category: "grain_legume",
  },
  {
    code: "maize",
    labelKey: "crop.maize",
    isPerishable: false,
    category: "grain_legume",
  },
  {
    code: "soybeans",
    labelKey: "crop.soybeans",
    isPerishable: false,
    category: "grain_legume",
  },
  {
    code: "other",
    labelKey: "crop.other",
    isPerishable: false,
    category: "other",
  },
] as const;

export type ProduceCropCode = (typeof PRODUCE_CROP_CATALOG)[number]["code"];

export interface ProduceUnitItem {
  code: string;
  labelKey: TranslationKeyId;
  defaultKgEstimate: number | null;
}

export const PRODUCE_UNIT_CATALOG: readonly ProduceUnitItem[] = [
  { code: "basket", labelKey: "unit.basket", defaultKgEstimate: 30 },
  { code: "bag", labelKey: "unit.bag", defaultKgEstimate: 50 },
  { code: "crate", labelKey: "unit.crate", defaultKgEstimate: 25 },
  { code: "basin", labelKey: "unit.basin", defaultKgEstimate: 20 },
  { code: "kg", labelKey: "unit.kg", defaultKgEstimate: 1 },
  { code: "tonne", labelKey: "unit.tonne", defaultKgEstimate: 1000 },
  { code: "unit", labelKey: "unit.unit", defaultKgEstimate: null },
] as const;

export type ProduceUnitCode = (typeof PRODUCE_UNIT_CATALOG)[number]["code"];

/**
 * Estimates total shipment weight in kilograms for logistics capacity matching.
 * Uses an explicit per-unit weight override when provided, falling back to the
 * unit's standard estimate (or null for variable "unit" lots with no weight given).
 */
export function estimateWeightKg(
  quantity: number,
  unitCode: string,
  customKgPerUnit?: number | null,
): number | null {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }

  if (customKgPerUnit !== undefined && customKgPerUnit !== null) {
    if (!Number.isFinite(customKgPerUnit) || customKgPerUnit <= 0) {
      return null;
    }
    return Math.round(quantity * customKgPerUnit * 10) / 10;
  }

  const unit = PRODUCE_UNIT_CATALOG.find((item) => item.code === unitCode);
  if (!unit || unit.defaultKgEstimate === null) {
    return null;
  }

  return Math.round(quantity * unit.defaultKgEstimate * 10) / 10;
}

export interface LgaDefinition {
  code: string;
  name: string;
  state: "Benue";
}

/**
 * All 23 official Local Government Areas (LGAs) of Benue State, Nigeria.
 */
export const BENUE_LGAS: readonly LgaDefinition[] = [
  { code: "ado", name: "Ado", state: "Benue" },
  { code: "agatu", name: "Agatu", state: "Benue" },
  { code: "apa", name: "Apa", state: "Benue" },
  { code: "buruku", name: "Buruku", state: "Benue" },
  { code: "gboko", name: "Gboko", state: "Benue" },
  { code: "guma", name: "Guma", state: "Benue" },
  { code: "gwer-east", name: "Gwer East", state: "Benue" },
  { code: "gwer-west", name: "Gwer West", state: "Benue" },
  { code: "katsina-ala", name: "Katsina-Ala", state: "Benue" },
  { code: "konshisha", name: "Konshisha", state: "Benue" },
  { code: "kwande", name: "Kwande", state: "Benue" },
  { code: "logo", name: "Logo", state: "Benue" },
  { code: "makurdi", name: "Makurdi", state: "Benue" },
  { code: "obi", name: "Obi", state: "Benue" },
  { code: "ogbadibo", name: "Ogbadibo", state: "Benue" },
  { code: "ohimini", name: "Ohimini", state: "Benue" },
  { code: "oju", name: "Oju", state: "Benue" },
  { code: "okpokwu", name: "Okpokwu", state: "Benue" },
  { code: "otukpo", name: "Otukpo", state: "Benue" },
  { code: "tarka", name: "Tarka", state: "Benue" },
  { code: "ukum", name: "Ukum", state: "Benue" },
  { code: "ushongo", name: "Ushongo", state: "Benue" },
  { code: "vandeikya", name: "Vandeikya", state: "Benue" },
] as const;

export const ORDER_STATUS_LABEL_KEYS = {
  CONFIRMED: "status.order.confirmed",
  TRANSPORT_REQUESTED: "status.order.transportRequested",
  TRANSPORT_ASSIGNED: "status.order.transportAssigned",
  COLLECTED: "status.order.collected",
  IN_TRANSIT: "status.order.inTransit",
  DELIVERED: "status.order.delivered",
  COMPLETED: "status.order.completed",
  CANCELLED: "status.order.cancelled",
  DISPUTED: "status.order.disputed",
} as const satisfies Record<string, TranslationKeyId>;

export const DELIVERY_MILESTONE_LABEL_KEYS = {
  TRANSPORT_REQUESTED: "status.delivery.requested",
  PROVIDER_CONFIRMED: "status.delivery.providerConfirmed",
  PRODUCE_COLLECTED: "status.delivery.collected",
  SHIPMENT_DISPATCHED: "status.delivery.dispatched",
  PRODUCE_DELIVERED: "status.delivery.delivered",
  BUYER_CONFIRMED_RECEIPT: "status.delivery.buyerConfirmed",
} as const satisfies Record<string, TranslationKeyId>;

export const VERIFICATION_STATUS_LABEL_KEYS = {
  UNVERIFIED: "status.verification.unverified",
  PENDING: "status.verification.pending",
  VERIFIED: "status.verification.verified",
  REJECTED: "status.verification.rejected",
} as const satisfies Record<string, TranslationKeyId>;

