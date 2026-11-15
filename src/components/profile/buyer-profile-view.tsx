"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Select,
} from "@/components/ui";
import { resilientFetch } from "@/lib/resilient-fetch";
import {
  BENUE_LGAS,
  PRODUCE_CROP_CATALOG,
} from "@/modules/i18n/catalogs";
import type { TranslationKeyId } from "@/modules/i18n";
import type { BuyerProfileSummary, BuyerType } from "@/modules/profile";

export interface BuyerProfileViewProps {
  initialProfile?: BuyerProfileSummary | null;
}

const BUYER_TYPE_OPTIONS: Array<{
  value: BuyerType;
  labelKey: TranslationKeyId;
}> = [
  { value: "PROCESSOR", labelKey: "profile.buyer.type.processor" },
  { value: "WHOLESALER", labelKey: "profile.buyer.type.wholesaler" },
  { value: "RETAILER", labelKey: "profile.buyer.type.retailer" },
  { value: "RESTAURANT_HOTEL", labelKey: "profile.buyer.type.restaurantHotel" },
  { value: "INSTITUTIONAL", labelKey: "profile.buyer.type.institutional" },
];

export function BuyerProfileView({ initialProfile }: BuyerProfileViewProps) {
  const { t } = useI18n();

  const [profile, setProfile] = useState<BuyerProfileSummary | null>(
    initialProfile ?? null,
  );
  const [businessName, setBusinessName] = useState(
    initialProfile?.businessName ?? "",
  );
  const [buyerType, setBuyerType] = useState<BuyerType | "">(
    initialProfile?.buyerType ?? "",
  );
  const [operatingLga, setOperatingLga] = useState(
    initialProfile?.operatingLga ?? "",
  );
  const [primaryMarket, setPrimaryMarket] = useState(
    initialProfile?.primaryMarket ?? "",
  );
  const [cropsSourced, setCropsSourced] = useState<string[]>(
    initialProfile?.cropsSourced ?? [],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function toggleCrop(cropCode: string) {
    setCropsSourced((prev) =>
      prev.includes(cropCode)
        ? prev.filter((c) => c !== cropCode)
        : [...prev, cropCode],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!businessName.trim()) {
      setErrorMessage(t("profile.buyer.businessNameLabel"));
      return;
    }

    if (!buyerType) {
      setErrorMessage(t("profile.buyer.typePlaceholder"));
      return;
    }

    if (!operatingLga) {
      setErrorMessage(t("profile.buyer.lgaPlaceholder"));
      return;
    }

    if (cropsSourced.length === 0) {
      setErrorMessage(t("profile.buyer.missingCropsError"));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await resilientFetch<{ profile: BuyerProfileSummary }>(
        "/api/profile/buyer",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName: businessName.trim(),
            buyerType,
            operatingLga,
            primaryMarket: primaryMarket.trim() || null,
            cropsSourced,
          }),
        },
      );

      if (res.ok) {
        setProfile(res.data.profile);
        setSuccessMessage(t("profile.buyer.savedSuccess"));
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMessage(res.error.message || "Failed to save buyer profile.");
      }
    } catch {
      setErrorMessage(
        "Network connection interrupted. Please check your data and retry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Top Navigation Link */}
      <div className="mb-4">
        <Link
          href="/account"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-emerald-800 hover:text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("profile.farmer.backToAccount")}</span>
        </Link>
      </div>

      {/* Main Card */}
      <Card className="border border-gray-200 shadow-xs">
        <CardHeader className="space-y-2 border-b border-gray-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl font-bold text-gray-900">
              {t("profile.buyer.title")}
            </CardTitle>
            <div className="flex items-center gap-2">
              {profile?.isComplete ? (
                <Badge tone="green" className="text-xs">
                  {t("profile.status.complete")}
                </Badge>
              ) : (
                <Badge tone="amber" className="text-xs">
                  {t("profile.status.incomplete")}
                </Badge>
              )}
              {profile?.verificationStatus === "VERIFIED" ? (
                <Badge tone="green" className="text-xs">
                  {t("profile.status.verified")}
                </Badge>
              ) : (
                <Badge tone="neutral" className="text-xs">
                  {t("profile.status.unverified")}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {t("profile.buyer.subtitle")}
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          {successMessage && (
            <div className="mb-6">
              <Alert tone="success" title={successMessage} />
            </div>
          )}

          {errorMessage && (
            <div className="mb-6">
              <Alert tone="error" title={errorMessage} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business / Organization Name */}
            <FormField
              label={t("profile.buyer.businessNameLabel")}
              htmlFor="buyer-business-name"
              required
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={t("profile.buyer.businessNamePlaceholder")}
                  required
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                />
              )}
            </FormField>

            {/* Buyer Category */}
            <FormField
              label={t("profile.buyer.typeLabel")}
              htmlFor="buyer-type-select"
              required
            >
              {({ id, describedBy, hasError }) => (
                <Select
                  id={id}
                  value={buyerType}
                  onChange={(e) => setBuyerType(e.target.value as BuyerType)}
                  required
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                >
                  <option value="">
                    -- {t("profile.buyer.typePlaceholder")} --
                  </option>
                  {BUYER_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            {/* Fixed Pilot Region Note */}
            <div className="rounded-md border border-emerald-100 bg-emerald-50/70 p-3 text-xs text-emerald-900">
              <span className="font-semibold">{t("profile.farmer.stateLabel")}: </span>
              {t("profile.farmer.stateValue")}
            </div>

            {/* Operating LGA Selector */}
            <FormField
              label={t("profile.buyer.lgaLabel")}
              htmlFor="buyer-lga-select"
              required
            >
              {({ id, describedBy, hasError }) => (
                <Select
                  id={id}
                  value={operatingLga}
                  onChange={(e) => setOperatingLga(e.target.value)}
                  required
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                >
                  <option value="">
                    -- {t("profile.buyer.lgaPlaceholder")} --
                  </option>
                  {BENUE_LGAS.map((lgaItem) => (
                    <option key={lgaItem.code} value={lgaItem.code}>
                      {lgaItem.name}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            {/* Primary Market or Collection Point */}
            <FormField
              label={t("profile.buyer.marketLabel")}
              htmlFor="buyer-primary-market"
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  type="text"
                  value={primaryMarket}
                  onChange={(e) => setPrimaryMarket(e.target.value)}
                  placeholder={t("profile.buyer.marketPlaceholder")}
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                />
              )}
            </FormField>

            {/* Produce Sourced (Crops) */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-gray-900">
                {t("profile.buyer.cropsLabel")}{" "}
                <span className="text-red-500">*</span>
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PRODUCE_CROP_CATALOG.map((crop) => {
                  const isChecked = cropsSourced.includes(crop.code);
                  return (
                    <label
                      key={crop.code}
                      className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-colors ${
                        isChecked
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950"
                          : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCrop(crop.code)}
                        className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{t(crop.labelKey)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full min-h-[44px]"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t("profile.buyer.savingButton")
                  : t("profile.buyer.saveButton")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
