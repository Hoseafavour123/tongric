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
import type { FarmerProfileSummary } from "@/modules/profile";

export interface FarmerProfileViewProps {
  initialProfile?: FarmerProfileSummary | null;
}

export function FarmerProfileView({ initialProfile }: FarmerProfileViewProps) {
  const { t } = useI18n();

  const [profile, setProfile] = useState<FarmerProfileSummary | null>(
    initialProfile ?? null,
  );
  const [lga, setLga] = useState(initialProfile?.lga ?? "");
  const [community, setCommunity] = useState(initialProfile?.community ?? "");
  const [primaryCrops, setPrimaryCrops] = useState<string[]>(
    initialProfile?.primaryCrops ?? [],
  );
  const [cooperativeName, setCooperativeName] = useState(
    initialProfile?.cooperativeName ?? "",
  );
  const [farmSizeHectares, setFarmSizeHectares] = useState(
    initialProfile?.farmSizeHectares !== null &&
      initialProfile?.farmSizeHectares !== undefined
      ? String(initialProfile.farmSizeHectares)
      : "",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function toggleCrop(cropCode: string) {
    setPrimaryCrops((prev) =>
      prev.includes(cropCode)
        ? prev.filter((c) => c !== cropCode)
        : [...prev, cropCode],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!lga) {
      setErrorMessage(t("profile.farmer.lgaPlaceholder"));
      return;
    }

    if (!community.trim()) {
      setErrorMessage(t("profile.farmer.communityLabel"));
      return;
    }

    if (primaryCrops.length === 0) {
      setErrorMessage(t("profile.farmer.missingCropsError"));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await resilientFetch<{ profile: FarmerProfileSummary }>(
        "/api/profile/farmer",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lga,
            community: community.trim(),
            primaryCrops,
            cooperativeName: cooperativeName.trim() || null,
            farmSizeHectares: farmSizeHectares ? Number(farmSizeHectares) : null,
          }),
        },
      );

      if (res.ok) {
        setProfile(res.data.profile);
        setSuccessMessage(t("profile.farmer.savedSuccess"));
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMessage(res.error.message || "Failed to save farm profile.");
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
              {t("profile.farmer.title")}
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
            {t("profile.farmer.subtitle")}
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
            {/* Fixed Pilot Region Note */}
            <div className="rounded-md border border-emerald-100 bg-emerald-50/70 p-3 text-xs text-emerald-900">
              <span className="font-semibold">{t("profile.farmer.stateLabel")}: </span>
              {t("profile.farmer.stateValue")}
            </div>

            {/* Benue LGA Selector */}
            <FormField
              label={t("profile.farmer.lgaLabel")}
              htmlFor="farmer-lga-select"
              required
            >
              {({ id, describedBy, hasError }) => (
                <Select
                  id={id}
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  required
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                >
                  <option value="">
                    -- {t("profile.farmer.lgaPlaceholder")} --
                  </option>
                  {BENUE_LGAS.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            {/* Community / Village Input */}
            <FormField
              label={t("profile.farmer.communityLabel")}
              htmlFor="farmer-community-input"
              required
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  type="text"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  placeholder={t("profile.farmer.communityPlaceholder")}
                  required
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                />
              )}
            </FormField>

            {/* Crops Checkboxes */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-gray-900">
                {t("profile.farmer.cropsLabel")} <span className="text-red-600">*</span>
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PRODUCE_CROP_CATALOG.map((crop) => {
                  const isChecked = primaryCrops.includes(crop.code);
                  return (
                    <label
                      key={crop.code}
                      className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-colors ${
                        isChecked
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950"
                          : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCrop(crop.code)}
                        className="h-5 w-5 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>{t(crop.labelKey)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Cooperative / Association (Optional) */}
            <FormField
              label={t("profile.farmer.coopLabel")}
              htmlFor="farmer-coop-input"
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  type="text"
                  value={cooperativeName}
                  onChange={(e) => setCooperativeName(e.target.value)}
                  placeholder={t("profile.farmer.coopPlaceholder")}
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                />
              )}
            </FormField>

            {/* Farm Size in Hectares (Optional) */}
            <FormField
              label={t("profile.farmer.sizeLabel")}
              htmlFor="farmer-size-input"
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10000"
                  value={farmSizeHectares}
                  onChange={(e) => setFarmSizeHectares(e.target.value)}
                  placeholder={t("profile.farmer.sizePlaceholder")}
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                />
              )}
            </FormField>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="h-12 w-full text-base font-semibold"
              >
                {isSubmitting
                  ? t("profile.farmer.savingButton")
                  : t("profile.farmer.saveButton")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
