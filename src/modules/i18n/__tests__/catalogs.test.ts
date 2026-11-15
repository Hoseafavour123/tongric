import { describe, expect, it } from "vitest";
import { BASE_TRANSLATIONS, getDefaultDictionary } from "../base-dictionary";
import {
  BENUE_LGAS,
  DELIVERY_MILESTONE_LABEL_KEYS,
  estimateWeightKg,
  ORDER_STATUS_LABEL_KEYS,
  PRODUCE_CROP_CATALOG,
  PRODUCE_UNIT_CATALOG,
  VERIFICATION_STATUS_LABEL_KEYS,
} from "../catalogs";

describe("structured translatable catalogs", () => {
  it("contains all 23 unique Benue State LGAs", () => {
    expect(BENUE_LGAS).toHaveLength(23);
    const codes = new Set(BENUE_LGAS.map((lga) => lga.code));
    expect(codes.size).toBe(23);
    expect(codes.has("gboko")).toBe(true);
    expect(codes.has("makurdi")).toBe(true);
    expect(codes.has("otukpo")).toBe(true);
  });

  it("includes perishable Benue crops and links every catalog key to BASE_TRANSLATIONS", () => {
    const tomatoes = PRODUCE_CROP_CATALOG.find((c) => c.code === "tomatoes");
    const yam = PRODUCE_CROP_CATALOG.find((c) => c.code === "yam");
    expect(tomatoes?.isPerishable).toBe(true);
    expect(yam?.isPerishable).toBe(false);

    const allReferencedKeys = [
      ...PRODUCE_CROP_CATALOG.map((c) => c.labelKey),
      ...PRODUCE_UNIT_CATALOG.map((u) => u.labelKey),
      ...Object.values(ORDER_STATUS_LABEL_KEYS),
      ...Object.values(DELIVERY_MILESTONE_LABEL_KEYS),
      ...Object.values(VERIFICATION_STATUS_LABEL_KEYS),
    ];

    for (const key of allReferencedKeys) {
      expect(Object.prototype.hasOwnProperty.call(BASE_TRANSLATIONS, key)).toBe(
        true,
      );
    }
  });

  it("estimates shipment weights accurately for local Benue units", () => {
    expect(estimateWeightKg(10, "basket")).toBe(300);
    expect(estimateWeightKg(4, "bag")).toBe(200);
    expect(estimateWeightKg(10, "basket", 35)).toBe(350);
    expect(estimateWeightKg(12, "unit")).toBeNull();
    expect(estimateWeightKg(12, "unit", 4.5)).toBe(54);
    expect(estimateWeightKg(-5, "kg")).toBeNull();
    expect(estimateWeightKg(10, "unknown_unit")).toBeNull();
  });

  it("keeps the full English translation dictionary payload compact under 35 KB", () => {
    const serialized = JSON.stringify(getDefaultDictionary());
    expect(Buffer.byteLength(serialized, "utf8")).toBeLessThan(35 * 1024);
  });
});

