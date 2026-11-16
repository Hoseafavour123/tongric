"use client";

import { useState, useMemo } from "react";
import { ArrowLeftRight, Calculator, Info, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge, FormField, Select, Input } from "@/components/ui";
import { calculateBarterRatio } from "@/modules/barter/barter-calculator.ts";

const CROPS = [
  { code: "yam", name: "Yam Tubers" },
  { code: "soybeans", name: "Soybeans" },
  { code: "maize", name: "Maize (Corn)" },
  { code: "rice", name: "Rice (Paddy)" },
  { code: "cassava", name: "Cassava" },
  { code: "groundnuts", name: "Groundnuts" },
  { code: "tomatoes", name: "Tomatoes" },
  { code: "pepper", name: "Pepper" },
  { code: "cashew", name: "Cashew Nuts" },
  { code: "mangoes", name: "Mangoes" },
];

const UNITS = [
  { code: "bag", name: "50kg Bag" },
  { code: "unit", name: "Single Tuber / Unit" },
  { code: "basket", name: "Standard Basket (~30kg)" },
  { code: "crate", name: "Standard Crate (~25kg)" },
  { code: "basin", name: "Basin (~20kg)" },
  { code: "tonne", name: "Metric Tonne (1,000kg)" },
  { code: "kg", name: "Kilogram (kg)" },
];

export function BarterCalculatorCard() {
  const [offeredCrop, setOfferedCrop] = useState("yam");
  const [offeredQty, setOfferedQty] = useState(50);
  const [offeredUnit, setOfferedUnit] = useState("unit");
  const [requestedCrop, setRequestedCrop] = useState("soybeans");
  const [requestedUnit, setRequestedUnit] = useState("bag");

  const calculation = useMemo(() => {
    if (!offeredQty || offeredQty <= 0) return null;
    return calculateBarterRatio({
      offeredCropCode: offeredCrop,
      offeredQuantity: offeredQty,
      offeredUnitCode: offeredUnit,
      requestedCropCode: requestedCrop,
      requestedUnitCode: requestedUnit,
    });
  }, [offeredCrop, offeredQty, offeredUnit, requestedCrop, requestedUnit]);

  return (
    <Card className="border-green-200 bg-white shadow-xs">
      <CardHeader className="border-b border-gray-100 bg-green-50/40 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-green-100 p-2 text-green-800">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-gray-900">
                Produce Barter Ratio Calculator
              </CardTitle>
              <p className="text-xs text-gray-600">
                Fair-market swap baseline for Benue harvest commodities
              </p>
            </div>
          </div>
          <Badge tone="green">Non-Custodial Tool</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-4">
        {/* Input Selector Columns */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Offered Leg */}
          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-700 text-[10px] text-white">1</span>
              <span>Crop You Have (Offering)</span>
            </div>

            <FormField label="Offered Commodity" required>
              {({ id, describedBy }) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  value={offeredCrop}
                  onChange={(e) => setOfferedCrop(e.target.value)}
                  className="min-h-[44px] bg-white text-sm"
                >
                  {CROPS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Quantity" required>
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    type="number"
                    min="1"
                    aria-describedby={describedBy}
                    value={offeredQty}
                    onChange={(e) => setOfferedQty(Math.max(1, Number(e.target.value) || 1))}
                    className="min-h-[44px] bg-white text-sm"
                  />
                )}
              </FormField>

              <FormField label="Unit" required>
                {({ id, describedBy }) => (
                  <Select
                    id={id}
                    aria-describedby={describedBy}
                    value={offeredUnit}
                    onChange={(e) => setOfferedUnit(e.target.value)}
                    className="min-h-[44px] bg-white text-sm"
                  >
                    {UNITS.map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.name}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            </div>
          </div>

          {/* Requested Leg */}
          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-700 text-[10px] text-white">2</span>
              <span>Crop You Need (In Return)</span>
            </div>

            <FormField label="Requested Commodity" required>
              {({ id, describedBy }) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  value={requestedCrop}
                  onChange={(e) => setRequestedCrop(e.target.value)}
                  className="min-h-[44px] bg-white text-sm"
                >
                  {CROPS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            <FormField label="Requested Unit" required>
              {({ id, describedBy }) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  value={requestedUnit}
                  onChange={(e) => setRequestedUnit(e.target.value)}
                  className="min-h-[44px] bg-white text-sm"
                >
                  {UNITS.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.name}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </div>
        </div>

        {/* Calculation Result */}
        {calculation && (
          <div className="rounded-xl border border-green-300 bg-green-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-green-700 p-1.5 text-white">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-green-900 uppercase">
                    Suggested Fair-Parity Swap
                  </span>
                  <span className="text-xs text-green-800">
                    Ratio: 1 {offeredUnit} ≈ {calculation.recommendedExchangeRatio} {requestedUnit}
                  </span>
                </div>

                <div className="text-xl font-black text-green-950 sm:text-2xl">
                  {offeredQty} {offeredUnit} of {offeredCrop} ≈ {calculation.suggestedCounterpartQuantity} {requestedUnit} of {requestedCrop}
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1 text-xs text-green-900 sm:grid-cols-2">
                  <div>
                    <span className="text-green-700">Est. Offered Baseline Value:</span>{" "}
                    <strong>₦{calculation.estimatedOfferedValueNgn.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-green-700">Requested Unit Baseline:</span>{" "}
                    <strong>₦{calculation.estimatedRequestedUnitValueNgn.toLocaleString()} / {requestedUnit}</strong>
                  </div>
                </div>

                <p className="border-t border-green-200/70 pt-2 text-xs text-green-800">
                  <Info className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
                  {calculation.fairValueEquivalenceNote}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-md bg-amber-50 p-2.5 text-xs text-amber-900">
          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-700" />
          <span>
            <strong>Section 19 Compliance Notice:</strong> Ratios are calculated from standard Benue agricultural harvest baselines. Swap quantities and fulfillment terms are agreed directly between farmers with zero platform fund custody.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

