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
import { BENUE_LGAS } from "@/modules/i18n/catalogs";
import type { TranslationKeyId } from "@/modules/i18n";
import type {
  PricingModel,
  TransportProfileSummary,
  VehicleType,
} from "@/modules/profile";

export interface TransportProfileViewProps {
  initialProfile?: TransportProfileSummary | null;
}

const VEHICLE_TYPE_OPTIONS: Array<{
  value: VehicleType;
  labelKey: TranslationKeyId;
}> = [
  {
    value: "MOTORCYCLE_TRICYCLE",
    labelKey: "profile.transporter.vehicle.motorcycleTricycle",
  },
  { value: "PICKUP", labelKey: "profile.transporter.vehicle.pickup" },
  { value: "VAN", labelKey: "profile.transporter.vehicle.van" },
  { value: "TRUCK", labelKey: "profile.transporter.vehicle.truck" },
];

export function TransportProfileView({
  initialProfile,
}: TransportProfileViewProps) {
  const { t } = useI18n();

  const [profile, setProfile] = useState<TransportProfileSummary | null>(
    initialProfile ?? null,
  );
  const [operatorName, setOperatorName] = useState(
    initialProfile?.operatorName ?? "",
  );
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>(
    initialProfile?.vehicleTypes ?? [],
  );
  const [maxCapacityKg, setMaxCapacityKg] = useState(
    initialProfile?.maxCapacityKg ? String(initialProfile.maxCapacityKg) : "",
  );
  const [operatingLgas, setOperatingLgas] = useState<string[]>(
    initialProfile?.operatingLgas ?? [],
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(
    initialProfile?.isAvailable ?? true,
  );
  const [pricingModel, setPricingModel] = useState<PricingModel>(
    initialProfile?.pricingModel ?? "QUOTE_ON_REQUEST",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function toggleVehicleType(type: VehicleType) {
    setVehicleTypes((prev) =>
      prev.includes(type) ? prev.filter((v) => v !== type) : [...prev, type],
    );
  }

  function toggleLga(code: string) {
    setOperatingLgas((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code],
    );
  }

  function selectAllLgas() {
    if (operatingLgas.length === BENUE_LGAS.length) {
      setOperatingLgas([]);
    } else {
      setOperatingLgas(BENUE_LGAS.map((l) => l.code));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!operatorName.trim()) {
      setErrorMessage(t("profile.transporter.operatorNameLabel"));
      return;
    }

    if (vehicleTypes.length === 0) {
      setErrorMessage(t("profile.transporter.missingVehiclesError"));
      return;
    }

    const capacityNum = Number(maxCapacityKg);
    if (!maxCapacityKg || isNaN(capacityNum) || capacityNum < 50 || capacityNum > 50000) {
      setErrorMessage("Maximum capacity must be between 50 kg and 50,000 kg.");
      return;
    }

    if (operatingLgas.length === 0) {
      setErrorMessage(t("profile.transporter.missingRoutesError"));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await resilientFetch<{ profile: TransportProfileSummary }>(
        "/api/profile/transporter",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operatorName: operatorName.trim(),
            vehicleTypes,
            maxCapacityKg: capacityNum,
            operatingLgas,
            isAvailable,
            pricingModel,
          }),
        },
      );

      if (res.ok) {
        setProfile(res.data.profile);
        setSuccessMessage(t("profile.transporter.savedSuccess"));
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMessage(res.error.message || "Failed to save transport profile.");
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
              {t("profile.transporter.title")}
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
            {t("profile.transporter.subtitle")}
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
            {/* Operator or Fleet Business Name */}
            <FormField
              label={t("profile.transporter.operatorNameLabel")}
              htmlFor="transporter-operator-name"
              required
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder={t("profile.transporter.operatorNamePlaceholder")}
                  required
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                />
              )}
            </FormField>

            {/* Vehicle Types in Fleet */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                {t("profile.transporter.vehicleTypesLabel")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {VEHICLE_TYPE_OPTIONS.map((opt) => {
                  const isChecked = vehicleTypes.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                        isChecked
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-medium"
                          : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleVehicleType(opt.value)}
                        className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm">{t(opt.labelKey)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Maximum Load Capacity (kg) */}
            <FormField
              label={t("profile.transporter.capacityLabel")}
              htmlFor="transporter-capacity"
              hint="Between 50 kg (tricycle) and 50,000 kg (large haulage truck)"
              required
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  type="number"
                  min="50"
                  max="50000"
                  step="10"
                  value={maxCapacityKg}
                  onChange={(e) => setMaxCapacityKg(e.target.value)}
                  placeholder={t("profile.transporter.capacityPlaceholder")}
                  required
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                />
              )}
            </FormField>

            {/* Availability Status */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                {t("profile.transporter.availabilityLabel")}
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsAvailable(true)}
                  className={`flex min-h-[44px] flex-1 items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    isAvailable
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {t("profile.transporter.available")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAvailable(false)}
                  className={`flex min-h-[44px] flex-1 items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    !isAvailable
                      ? "border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {t("profile.transporter.unavailable")}
                </button>
              </div>
            </div>

            {/* Pricing Model Preference */}
            <FormField
              label={t("profile.transporter.pricingLabel")}
              htmlFor="transporter-pricing"
              required
            >
              {({ id, describedBy, hasError }) => (
                <Select
                  id={id}
                  value={pricingModel}
                  onChange={(e) =>
                    setPricingModel(e.target.value as PricingModel)
                  }
                  required
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                >
                  <option value="QUOTE_ON_REQUEST">
                    {t("profile.transporter.pricing.quote")}
                  </option>
                  <option value="FIXED_RATE_CARD">
                    {t("profile.transporter.pricing.fixedRate")}
                  </option>
                </Select>
              )}
            </FormField>

            {/* Service Routes in Benue LGAs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-900">
                  {t("profile.transporter.routesLabel")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={selectAllLgas}
                  className="min-h-[44px] text-xs font-semibold text-emerald-700 underline hover:text-emerald-900"
                >
                  {operatingLgas.length === BENUE_LGAS.length
                    ? "Deselect All"
                    : "Select All 23 LGAs"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {BENUE_LGAS.map((lga) => {
                  const isChecked = operatingLgas.includes(lga.code);
                  return (
                    <label
                      key={lga.code}
                      className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border p-2 text-xs transition-colors ${
                        isChecked
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-medium"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleLga(lga.code)}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{lga.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

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
                  ? t("profile.transporter.savingButton")
                  : t("profile.transporter.saveButton")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
