import { BarterCalculationResult, CalculateBarterRatioInput } from "./schemas.ts";

/**
 * Standard harvest season baseline reference prices (in NGN) per unit for Benue state agricultural commodities.
 * These act as fair-value reference anchors for rural non-custodial barter calculation.
 */
export const BENUE_CROP_BASELINE_PRICES_NGN: Record<string, Record<string, number>> = {
  yam: {
    unit: 1200,      // Per large tuber
    basket: 36000,   // Per basket (~30kg)
    crate: 30000,
    bag: 45000,
    tonne: 900000,
    kg: 900,
    basin: 18000,
  },
  soybeans: {
    bag: 45000,      // 50kg bag
    basin: 18000,
    kg: 900,
    tonne: 900000,
    basket: 27000,
    crate: 22500,
    unit: 900,
  },
  maize: {
    bag: 38000,      // 50kg bag
    basin: 15200,
    kg: 760,
    tonne: 760000,
    basket: 22800,
    crate: 19000,
    unit: 760,
  },
  rice: {
    bag: 42000,      // 50kg bag paddy
    basin: 16800,
    kg: 840,
    tonne: 840000,
    basket: 25200,
    crate: 21000,
    unit: 840,
  },
  cassava: {
    bag: 22000,      // 50kg bag tubers/chunks
    basin: 8800,
    kg: 440,
    tonne: 440000,
    basket: 13200,
    crate: 11000,
    unit: 440,
  },
  groundnuts: {
    bag: 50000,      // 50kg bag
    basin: 20000,
    kg: 1000,
    tonne: 1000000,
    basket: 30000,
    crate: 25000,
    unit: 1000,
  },
  tomatoes: {
    crate: 25000,    // Standard wooden crate
    basket: 30000,
    basin: 15000,
    bag: 40000,
    kg: 1000,
    tonne: 1000000,
    unit: 1000,
  },
  pepper: {
    bag: 30000,      // 50kg sack
    basket: 18000,
    basin: 12000,
    crate: 15000,
    kg: 600,
    tonne: 600000,
    unit: 600,
  },
  cashew: {
    bag: 60000,      // 50kg raw nuts
    basin: 24000,
    kg: 1200,
    tonne: 1200000,
    basket: 36000,
    crate: 30000,
    unit: 1200,
  },
  mangoes: {
    basket: 18000,   // Standard raffia basket
    crate: 15000,
    basin: 9000,
    bag: 25000,
    kg: 600,
    tonne: 600000,
    unit: 600,
  },
  other: {
    bag: 30000,
    basket: 18000,
    basin: 12000,
    crate: 15000,
    kg: 600,
    tonne: 600000,
    unit: 600,
  },
};

/**
 * Resolves baseline unit price in NGN for a given crop code and unit code.
 * Falls back to ₦1,000 / unit if unknown.
 */
export function getBaselineUnitPriceNgn(cropCode: string, unitCode: string): number {
  const normalizedCrop = cropCode.toLowerCase().trim();
  const normalizedUnit = unitCode.toLowerCase().trim();

  const fallbackTable = BENUE_CROP_BASELINE_PRICES_NGN.other ?? { bag: 30000, kg: 600 };
  const cropTable = BENUE_CROP_BASELINE_PRICES_NGN[normalizedCrop] ?? fallbackTable;
  const price = cropTable[normalizedUnit];

  if (price && price > 0) {
    return price;
  }

  // Fallback to kg rate or unit default
  return cropTable.kg ? cropTable.kg * 10 : 1000;
}

/**
 * Computes fair-value barter equivalence between two agricultural crops.
 */
export function calculateBarterRatio(input: CalculateBarterRatioInput): BarterCalculationResult {
  const offeredUnitPrice = getBaselineUnitPriceNgn(input.offeredCropCode, input.offeredUnitCode);
  const requestedUnitPrice = getBaselineUnitPriceNgn(input.requestedCropCode, input.requestedUnitCode);

  const estimatedOfferedValueNgn = Math.round(input.offeredQuantity * offeredUnitPrice);
  const recommendedExchangeRatio = Math.round((offeredUnitPrice / requestedUnitPrice) * 100) / 100;
  const suggestedCounterpartQuantity = Math.round((estimatedOfferedValueNgn / requestedUnitPrice) * 10) / 10;

  const fairValueEquivalenceNote = `${input.offeredQuantity} ${input.offeredUnitCode} of ${input.offeredCropCode} (est. ₦${estimatedOfferedValueNgn.toLocaleString()}) equates to approx ${suggestedCounterpartQuantity} ${input.requestedUnitCode} of ${input.requestedCropCode} at standard Benue harvest baseline parity.`;

  return {
    offeredCropCode: input.offeredCropCode,
    offeredQuantity: input.offeredQuantity,
    offeredUnitCode: input.offeredUnitCode,
    requestedCropCode: input.requestedCropCode,
    requestedUnitCode: input.requestedUnitCode,
    estimatedOfferedValueNgn,
    estimatedRequestedUnitValueNgn: requestedUnitPrice,
    recommendedExchangeRatio,
    suggestedCounterpartQuantity,
    fairValueEquivalenceNote,
  };
}

