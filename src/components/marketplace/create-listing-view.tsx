"use client";

import { useState, useId, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, Loader2, Trash2 } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import {
  Alert,
  Badge,
  Button,
  buttonClasses,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Select,
} from "@/components/ui";
import { resilientFetch } from "@/lib/resilient-fetch";
import { compressImageFile } from "@/lib/media/image-compressor";
import {
  BENUE_LGAS,
  PRODUCE_CROP_CATALOG,
  PRODUCE_UNIT_CATALOG,
  estimateWeightKg,
} from "@/modules/i18n/catalogs";
import type {
  ListingPhotoInput,
  ProduceListingSummary,
  ProduceGrade,
  AvailabilityStatus,
} from "@/modules/marketplace";

export interface CreateListingViewProps {
  defaultLga?: string;
  defaultCommunity?: string;
  onListingCreated?: (listing: ProduceListingSummary) => void;
}

export function CreateListingView({
  defaultLga = "",
  defaultCommunity = "",
  onListingCreated,
}: CreateListingViewProps) {
  const { t } = useI18n();

  const [cropCode, setCropCode] = useState("");
  const [grade, setGrade] = useState<ProduceGrade>("GRADE_B");
  const [quantity, setQuantity] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [minOrderQuantity, setMinOrderQuantity] = useState("1");
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [availabilityStatus, setAvailabilityStatus] =
    useState<AvailabilityStatus>("AVAILABLE_NOW");
  const [harvestDate, setHarvestDate] = useState("");
  const [lga, setLga] = useState(defaultLga);
  const [community, setCommunity] = useState(defaultCommunity);
  const [description, setDescription] = useState("");

  const [photos, setPhotos] = useState<ListingPhotoInput[]>([]);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdListing, setCreatedListing] = useState<ProduceListingSummary | null>(null);

  const fileInputId = useId();
  const negotiableInputId = useId();
  const descInputId = useId();

  // Dynamic live weight estimation
  const parsedQty = Number.parseInt(quantity, 10);
  const estimatedTotalKg =
    !Number.isNaN(parsedQty) && parsedQty > 0 && unitCode
      ? estimateWeightKg(parsedQty, unitCode)
      : null;

  async function handlePhotoSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= 4) {
      setErrorMessage(t("marketplace.create.photosDesc"));
      return;
    }

    setErrorMessage(null);
    setIsCompressingPhoto(true);

    try {
      const compressionResult = await compressImageFile(file, {
        maxDimension: 1280,
        maxBytes: 200 * 1024,
      });

      const formData = new FormData();
      formData.append("file", compressionResult.file);

      const response = await resilientFetch<{ photo: ListingPhotoInput }>(
        "/api/marketplace/listings/photos",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(response.error.message || "Failed to upload photo.");
      }

      const uploadedPhoto: ListingPhotoInput = {
        fileStoragePath: response.data.photo.fileStoragePath,
        publicUrl: response.data.photo.publicUrl,
        mimeType: response.data.photo.mimeType,
        sizeBytes: response.data.photo.sizeBytes,
        isPrimary: photos.length === 0,
      };

      setPhotos((prev) => [...prev, uploadedPhoto]);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Photo upload failed. Please try again.",
      );
    } finally {
      setIsCompressingPhoto(false);
      e.target.value = "";
    }
  }

  function handleRemovePhoto(indexToRemove: number) {
    setPhotos((prev) => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      if (filtered.length > 0 && !filtered.some((p) => p.isPrimary)) {
        const first = filtered[0];
        if (first) {
          first.isPrimary = true;
        }
      }
      return filtered;
    });
  }

  function handleSetPrimaryPhoto(indexToSet: number) {
    setPhotos((prev) =>
      prev.map((photo, idx) => ({
        ...photo,
        isPrimary: idx === indexToSet,
      })),
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!cropCode) {
      setErrorMessage(t("marketplace.create.errorCrop"));
      return;
    }

    const qtyNumber = Number.parseInt(quantity, 10);
    if (Number.isNaN(qtyNumber) || qtyNumber <= 0) {
      setErrorMessage(t("marketplace.create.errorQuantity"));
      return;
    }

    if (!unitCode) {
      setErrorMessage(t("marketplace.create.errorUnit"));
      return;
    }

    const priceNumber = Number.parseFloat(pricePerUnit);
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      setErrorMessage(t("marketplace.create.errorPrice"));
      return;
    }

    const moqNumber = Number.parseInt(minOrderQuantity, 10);
    if (Number.isNaN(moqNumber) || moqNumber <= 0 || moqNumber > qtyNumber) {
      setErrorMessage(t("marketplace.create.errorMinOrder"));
      return;
    }

    if (availabilityStatus === "UPCOMING_HARVEST" && !harvestDate) {
      setErrorMessage(t("marketplace.create.errorHarvestDate"));
      return;
    }

    if (!lga) {
      setErrorMessage(t("marketplace.create.errorLga"));
      return;
    }

    if (!community.trim() || community.trim().length < 2) {
      setErrorMessage(t("marketplace.create.errorCommunity"));
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        cropCode,
        grade,
        quantity: qtyNumber,
        unitCode,
        pricePerUnit: priceNumber,
        currency: "NGN",
        minOrderQuantity: moqNumber,
        isNegotiable,
        availabilityStatus,
        harvestDate: availabilityStatus === "UPCOMING_HARVEST" ? harvestDate : null,
        state: "Benue",
        lga,
        community: community.trim(),
        description: description.trim() || null,
        photos,
      };

      const res = await resilientFetch<{ listing: ProduceListingSummary }>(
        "/api/marketplace/listings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        throw new Error(res.error.message || "Failed to publish listing.");
      }

      setCreatedListing(res.data.listing);
      if (onListingCreated) {
        onListingCreated(res.data.listing);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An error occurred while creating listing.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdListing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <Alert
          tone="success"
          title={t("marketplace.create.successMessage")}
        >
          {createdListing.title} is now active and visible to buyers across Nigeria.
        </Alert>

        <Card className="border border-green-200 bg-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Listing Reference:</span>
              <span className="font-mono text-sm font-semibold text-gray-900">
                {createdListing.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Quantity & Price:</span>
              <span className="font-medium text-gray-900">
                {createdListing.quantity} {createdListing.unitCode} @ ₦
                {createdListing.pricePerUnit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Farm Location:</span>
              <span className="font-medium text-gray-900">
                {createdListing.community}, {createdListing.lga} LGA
              </span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/market"
                className={buttonClasses({
                  variant: "primary",
                  className: "flex-1 min-h-[44px]",
                })}
              >
                {t("marketplace.create.viewListing")}
              </Link>
              <Button
                variant="ghost"
                className="flex-1 min-h-[44px]"
                onClick={() => {
                  setCreatedListing(null);
                  setQuantity("");
                  setPricePerUnit("");
                  setDescription("");
                  setPhotos([]);
                }}
              >
                {t("marketplace.nav.createListing")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      {/* Navigation header */}
      <div className="flex items-center gap-2">
        <Link
          href="/market"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-green-800 min-h-[44px] px-2 text-sm font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t("marketplace.nav.title")}</span>
        </Link>
      </div>

      {/* Main card */}
      <Card className="border border-gray-200 bg-white shadow-xs">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {t("marketplace.create.title")}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {t("marketplace.create.subtitle")}
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <Alert tone="error" title={errorMessage} />
            )}

            {/* Produce Crop */}
            <FormField
              label={t("marketplace.create.cropLabel")}
              htmlFor="crop-select"
              required
            >
              {({ id, describedBy, hasError }) => (
                <Select
                  id={id}
                  value={cropCode}
                  onChange={(e) => setCropCode(e.target.value)}
                  className="min-h-[44px] text-base"
                  hasError={hasError}
                  aria-describedby={describedBy}
                  required
                >
                  <option value="">{t("marketplace.create.cropPlaceholder")}</option>
                  {PRODUCE_CROP_CATALOG.map((crop) => (
                    <option key={crop.code} value={crop.code}>
                      {crop.code.charAt(0).toUpperCase() + crop.code.slice(1)} (
                      {crop.category.replace("_", " ")})
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            {/* Quality Grade Cards */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                {t("marketplace.create.gradeLabel")} <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    value: "GRADE_A" as ProduceGrade,
                    title: t("marketplace.create.gradeA"),
                    desc: t("marketplace.create.gradeADesc"),
                  },
                  {
                    value: "GRADE_B" as ProduceGrade,
                    title: t("marketplace.create.gradeB"),
                    desc: t("marketplace.create.gradeBDesc"),
                  },
                  {
                    value: "GRADE_C" as ProduceGrade,
                    title: t("marketplace.create.gradeC"),
                    desc: t("marketplace.create.gradeCDesc"),
                  },
                ].map((item) => {
                  const isSelected = grade === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setGrade(item.value)}
                      className={`min-h-[44px] text-left p-3.5 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-green-700 bg-green-50 shadow-xs"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                          {item.title}
                        </span>
                        <input
                          type="radio"
                          name="produceGrade"
                          checked={isSelected}
                          onChange={() => setGrade(item.value)}
                          className="h-4 w-4 text-green-700 focus:ring-green-600 accent-green-700"
                          aria-label={item.title}
                        />
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity and Packaging Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label={t("marketplace.create.quantityLabel")}
                htmlFor="qty-input"
                required
              >
                {({ id, describedBy, hasError }) => (
                  <Input
                    id={id}
                    type="number"
                    min="1"
                    step="1"
                    placeholder={t("marketplace.create.quantityPlaceholder")}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="min-h-[44px] text-base"
                    hasError={hasError}
                    aria-describedby={describedBy}
                    required
                  />
                )}
              </FormField>

              <FormField
                label={t("marketplace.create.unitLabel")}
                htmlFor="unit-select"
                required
              >
                {({ id, describedBy, hasError }) => (
                  <Select
                    id={id}
                    value={unitCode}
                    onChange={(e) => setUnitCode(e.target.value)}
                    className="min-h-[44px] text-base"
                    hasError={hasError}
                    aria-describedby={describedBy}
                    required
                  >
                    <option value="">{t("marketplace.create.unitPlaceholder")}</option>
                    {PRODUCE_UNIT_CATALOG.map((unit) => (
                      <option key={unit.code} value={unit.code}>
                        {unit.code.charAt(0).toUpperCase() + unit.code.slice(1)}{" "}
                        {unit.defaultKgEstimate ? `(~${unit.defaultKgEstimate} kg)` : ""}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            </div>

            {/* Live estimated weight indicator */}
            {estimatedTotalKg !== null && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between text-sm text-green-900">
                <span className="font-medium">{t("marketplace.create.estimatedWeight")}:</span>
                <span className="font-bold">
                  {estimatedTotalKg.toLocaleString()} kg (~{(estimatedTotalKg / 1000).toFixed(2)} tonnes)
                </span>
              </div>
            )}

            {/* Price and MOQ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label={t("marketplace.create.pricePerUnitLabel")}
                htmlFor="price-input"
                required
              >
                {({ id, describedBy, hasError }) => (
                  <Input
                    id={id}
                    type="number"
                    min="1"
                    step="any"
                    placeholder={t("marketplace.create.pricePlaceholder")}
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    className="min-h-[44px] text-base"
                    hasError={hasError}
                    aria-describedby={describedBy}
                    required
                  />
                )}
              </FormField>

              <FormField
                label={t("marketplace.create.minOrderQuantityLabel")}
                htmlFor="moq-input"
                required
              >
                {({ id, describedBy, hasError }) => (
                  <Input
                    id={id}
                    type="number"
                    min="1"
                    max={quantity || undefined}
                    step="1"
                    placeholder={t("marketplace.create.minOrderQuantityPlaceholder")}
                    value={minOrderQuantity}
                    onChange={(e) => setMinOrderQuantity(e.target.value)}
                    className="min-h-[44px] text-base"
                    hasError={hasError}
                    aria-describedby={describedBy}
                    required
                  />
                )}
              </FormField>
            </div>

            {/* Price Negotiable Toggle */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <label
                htmlFor={negotiableInputId}
                className="flex items-start gap-3 cursor-pointer"
              >
                <input
                  id={negotiableInputId}
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="h-5 w-5 mt-0.5 rounded border-gray-300 text-green-700 focus:ring-green-600 accent-green-700"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-gray-900">
                    {t("marketplace.create.negotiableLabel")}
                  </span>
                  <p className="text-xs text-gray-600">
                    {t("marketplace.create.negotiableDesc")}
                  </p>
                </div>
              </label>
            </div>

            {/* Produce Availability */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                {t("marketplace.create.availabilityLabel")} <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAvailabilityStatus("AVAILABLE_NOW")}
                  className={`min-h-[44px] text-left p-3.5 rounded-lg border-2 transition-all cursor-pointer ${
                    availabilityStatus === "AVAILABLE_NOW"
                      ? "border-green-700 bg-green-50 shadow-xs"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  aria-pressed={availabilityStatus === "AVAILABLE_NOW"}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                      {t("marketplace.create.availableNow")}
                    </span>
                    <input
                      type="radio"
                      name="availabilityStatus"
                      checked={availabilityStatus === "AVAILABLE_NOW"}
                      onChange={() => setAvailabilityStatus("AVAILABLE_NOW")}
                      className="h-4 w-4 text-green-700 focus:ring-green-600 accent-green-700"
                      aria-label={t("marketplace.create.availableNow")}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    {t("marketplace.create.availableNowDesc")}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAvailabilityStatus("UPCOMING_HARVEST")}
                  className={`min-h-[44px] text-left p-3.5 rounded-lg border-2 transition-all cursor-pointer ${
                    availabilityStatus === "UPCOMING_HARVEST"
                      ? "border-green-700 bg-green-50 shadow-xs"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  aria-pressed={availabilityStatus === "UPCOMING_HARVEST"}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                      {t("marketplace.create.upcomingHarvest")}
                    </span>
                    <input
                      type="radio"
                      name="availabilityStatus"
                      checked={availabilityStatus === "UPCOMING_HARVEST"}
                      onChange={() => setAvailabilityStatus("UPCOMING_HARVEST")}
                      className="h-4 w-4 text-green-700 focus:ring-green-600 accent-green-700"
                      aria-label={t("marketplace.create.upcomingHarvest")}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    {t("marketplace.create.upcomingHarvestDesc")}
                  </p>
                </button>
              </div>

              {/* Conditional harvest date for upcoming produce */}
              {availabilityStatus === "UPCOMING_HARVEST" && (
                <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <FormField
                    label={t("marketplace.create.harvestDateLabel")}
                    htmlFor="harvest-date-input"
                    required
                  >
                    {({ id, describedBy, hasError }) => (
                      <Input
                        id={id}
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={harvestDate}
                        onChange={(e) => setHarvestDate(e.target.value)}
                        className="min-h-[44px] text-base bg-white"
                        hasError={hasError}
                        aria-describedby={describedBy}
                        required
                      />
                    )}
                  </FormField>
                </div>
              )}
            </div>

            {/* Farm Location */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {t("marketplace.create.locationSection")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label={t("marketplace.create.lgaLabel")}
                  htmlFor="lga-select"
                  required
                >
                  {({ id, describedBy, hasError }) => (
                    <Select
                      id={id}
                      value={lga}
                      onChange={(e) => setLga(e.target.value)}
                      className="min-h-[44px] text-base"
                      hasError={hasError}
                      aria-describedby={describedBy}
                      required
                    >
                      <option value="">{t("marketplace.create.lgaPlaceholder")}</option>
                      {BENUE_LGAS.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.name} LGA
                        </option>
                      ))}
                    </Select>
                  )}
                </FormField>

                <FormField
                  label={t("marketplace.create.communityLabel")}
                  htmlFor="community-input"
                  required
                >
                  {({ id, describedBy, hasError }) => (
                    <Input
                      id={id}
                      placeholder={t("marketplace.create.communityPlaceholder")}
                      value={community}
                      onChange={(e) => setCommunity(e.target.value)}
                      className="min-h-[44px] text-base"
                      hasError={hasError}
                      aria-describedby={describedBy}
                      required
                    />
                  )}
                </FormField>
              </div>
            </div>

            {/* Description (Optional) */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label htmlFor={descInputId} className="block text-sm font-semibold text-gray-900">
                {t("marketplace.create.descriptionLabel")}
              </label>
              <textarea
                id={descInputId}
                rows={3}
                maxLength={1000}
                placeholder={t("marketplace.create.descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900 focus:border-green-600 focus:outline-hidden focus:ring-1 focus:ring-green-600"
              />
            </div>

            {/* Produce Photos */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  {t("marketplace.create.photosLabel")}
                </label>
                <p className="text-xs text-gray-600 mt-0.5">
                  {t("marketplace.create.photosDesc")}
                </p>
              </div>

              {/* Photo thumbnails */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.fileStoragePath}
                      className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex flex-col"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.publicUrl}
                        alt={`Produce photo ${idx + 1}`}
                        className="h-28 w-full object-cover"
                      />
                      <div className="p-2 bg-white flex items-center justify-between gap-1 border-t border-gray-100">
                        {photo.isPrimary ? (
                          <Badge tone="green" className="text-xs">
                            {t("marketplace.create.primaryPhotoBadge")}
                          </Badge>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryPhoto(idx)}
                            className="text-xs text-gray-600 hover:text-green-800 underline min-h-[32px] px-1"
                          >
                            Set Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="min-h-[32px] min-w-[32px] flex items-center justify-center text-red-600 hover:text-red-800 rounded p-1 cursor-pointer"
                          aria-label={`Remove photo ${idx + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {photos.length < 4 && (
                <div>
                  <input
                    id={fileInputId}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelected}
                    disabled={isCompressingPhoto}
                    className="sr-only"
                  />
                  <label
                    htmlFor={fileInputId}
                    className={`min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-green-600 cursor-pointer transition-colors ${
                      isCompressingPhoto ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isCompressingPhoto ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-green-700" />
                        <span>{t("marketplace.create.compressingPhoto")}</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5 text-gray-600" />
                        <span>{t("marketplace.create.addPhoto")}</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || isCompressingPhoto}
                className="w-full sm:flex-1 min-h-[44px] text-base font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>{t("marketplace.create.submitting")}</span>
                  </>
                ) : (
                  <span>{t("marketplace.create.submitButton")}</span>
                )}
              </Button>

              <Link
                href="/market"
                className={buttonClasses({
                  variant: "ghost",
                  className: "w-full sm:w-auto min-h-[44px]",
                })}
              >
                {t("common.cancel")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
