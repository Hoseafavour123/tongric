"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  FormField,
  Input,
  Textarea,
  Select,
} from "@/components/ui";
import { BENUE_LGAS, PRODUCE_CROP_CATALOG, PRODUCE_UNIT_CATALOG } from "@/modules/i18n/catalogs.ts";

export function CreateBarterListingView() {
  const [offeredItemType, setOfferedItemType] = useState<"CROP" | "SEED" | "TOOL" | "EQUIPMENT">("CROP");
  const [offeredCropId, setOfferedCropId] = useState("");
  const [offeredTitle, setOfferedTitle] = useState("");
  const [offeredDescription, setOfferedDescription] = useState("");
  const [offeredQty, setOfferedQty] = useState<number | "">("");
  const [offeredUnit, setOfferedUnit] = useState("bag");
  const [desiredDescription, setDesiredDescription] = useState("");
  const [desiredQty, setDesiredQty] = useState<number | "">("");
  const [desiredUnit, setDesiredUnit] = useState("bag");
  const [locationLga, setLocationLga] = useState("Makurdi");

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <Link
          href="/exchange"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Post Barter Listing
          </h1>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {/* Section 1: What You Are Offering */}
        <Card className="border-gray-200 bg-white shadow-xs">
          <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-3 px-4">
            <CardTitle className="text-sm font-bold text-gray-900">
              What You Are Offering
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Category" required>
                {({ id, describedBy }) => (
                  <Select
                    id={id}
                    aria-describedby={describedBy}
                    value={offeredItemType}
                    onChange={(e) => setOfferedItemType(e.target.value as "CROP" | "SEED" | "TOOL" | "EQUIPMENT")}
                    className="min-h-[44px] bg-white text-sm"
                  >
                    <option value="CROP">Harvest Produce</option>
                    <option value="SEED">Seeds & Seedlings</option>
                    <option value="TOOL">Farm Tools & Implements</option>
                    <option value="EQUIPMENT">Machinery / Gear</option>
                  </Select>
                )}
              </FormField>

              {offeredItemType === "CROP" && (
                <FormField label="Standard Crop">
                  {({ id, describedBy }) => (
                    <Select
                      id={id}
                      aria-describedby={describedBy}
                      value={offeredCropId}
                      onChange={(e) => setOfferedCropId(e.target.value)}
                      className="min-h-[44px] bg-white text-sm"
                    >
                      <option value="">Select standard crop (optional)</option>
                      {PRODUCE_CROP_CATALOG.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code.toUpperCase()}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormField>
              )}
            </div>

            <FormField label="Listing Title" required>
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  placeholder="e.g. 50 Tubers of White Yam"
                  value={offeredTitle}
                  onChange={(e) => setOfferedTitle(e.target.value)}
                  className="min-h-[44px] bg-white text-sm"
                />
              )}
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Quantity" required>
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    type="number"
                    min="1"
                    aria-describedby={describedBy}
                    placeholder="e.g. 50"
                    value={offeredQty}
                    onChange={(e) => setOfferedQty(e.target.value ? Number(e.target.value) : "")}
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
                    {PRODUCE_UNIT_CATALOG.map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.code}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            </div>

            <FormField label="Description (Optional)">
              {({ id, describedBy }) => (
                <Textarea
                  id={id}
                  aria-describedby={describedBy}
                  rows={2}
                  placeholder="e.g. Freshly harvested, zero rot, ready for pickup."
                  value={offeredDescription}
                  onChange={(e) => setOfferedDescription(e.target.value)}
                  className="bg-white text-sm"
                />
              )}
            </FormField>
          </CardContent>
        </Card>

        {/* Section 2: What You Want in Exchange */}
        <Card className="border-gray-200 bg-white shadow-xs">
          <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-3 px-4">
            <CardTitle className="text-sm font-bold text-gray-900">
              What You Want In Return
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <FormField label="Desired Items" required>
              {({ id, describedBy }) => (
                <Textarea
                  id={id}
                  aria-describedby={describedBy}
                  rows={2}
                  placeholder="e.g. 2 bags of clean soybeans, or 3 bags of maize seed."
                  value={desiredDescription}
                  onChange={(e) => setDesiredDescription(e.target.value)}
                  className="bg-white text-sm"
                />
              )}
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Desired Quantity (Optional)">
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    type="number"
                    min="1"
                    aria-describedby={describedBy}
                    placeholder="e.g. 2"
                    value={desiredQty}
                    onChange={(e) => setDesiredQty(e.target.value ? Number(e.target.value) : "")}
                    className="min-h-[44px] bg-white text-sm"
                  />
                )}
              </FormField>

              <FormField label="Desired Unit (Optional)">
                {({ id, describedBy }) => (
                  <Select
                    id={id}
                    aria-describedby={describedBy}
                    value={desiredUnit}
                    onChange={(e) => setDesiredUnit(e.target.value)}
                    className="min-h-[44px] bg-white text-sm"
                  >
                    {PRODUCE_UNIT_CATALOG.map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.code}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Farm Location */}
        <Card className="border-gray-200 bg-white shadow-xs">
          <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-3 px-4">
            <CardTitle className="text-sm font-bold text-gray-900">
              Pickup Location
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <FormField label="Local Government Area (LGA)" required>
              {({ id, describedBy }) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  value={locationLga}
                  onChange={(e) => setLocationLga(e.target.value)}
                  className="min-h-[44px] bg-white text-sm"
                >
                  {BENUE_LGAS.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.code} LGA
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 flex items-start gap-2">
          <Info className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
          <span>Demonstration mode: listing publication is currently disabled for pilot review.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Link
            href="/exchange"
            className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <Button
            type="button"
            variant="primary"
            disabled={true}
            className="min-h-[44px] px-6 flex items-center gap-2 font-bold cursor-not-allowed opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Publish Barter Listing</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
