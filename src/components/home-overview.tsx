"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  MapPin,
  Plus,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Store,
  Truck,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { FirstVisitLanguagePrompt } from "@/components/i18n/first-visit-language-prompt";
import { useI18n } from "@/components/i18n/i18n-provider";
import { LowDataSwitch } from "@/components/layout/low-data-provider";
import { useWorkspaceMode } from "@/components/layout/workspace-mode-provider";
import {
  Badge,
  buttonClasses,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatusStepper,
  type StepItem,
} from "@/components/ui";
import { PRODUCE_CROP_CATALOG } from "@/modules/i18n/catalogs";

export function HomeOverview() {
  const { mode } = useWorkspaceMode();
  const { t } = useI18n();
  const { user, isAuthenticated } = useAuth();
  const isFarmer = mode === "farmer";

  const farmerSteps: readonly StepItem[] = [
    {
      id: "list",
      label: t("home.stepFarmerListLabel"),
      description: t("home.stepFarmerListDesc"),
      state: "completed",
    },
    {
      id: "agree",
      label: t("home.stepFarmerAgreeLabel"),
      description: t("home.stepFarmerAgreeDesc"),
      state: "current",
    },
    {
      id: "deliver",
      label: t("home.stepFarmerDeliverLabel"),
      description: t("home.stepFarmerDeliverDesc"),
      state: "upcoming",
    },
  ];

  const buyerSteps: readonly StepItem[] = [
    {
      id: "discover",
      label: t("home.stepBuyerSearchLabel"),
      description: t("home.stepBuyerSearchDesc"),
      state: "completed",
    },
    {
      id: "offer",
      label: t("home.stepBuyerOfferLabel"),
      description: t("home.stepBuyerOfferDesc"),
      state: "current",
    },
    {
      id: "receive",
      label: t("home.stepBuyerReceiveLabel"),
      description: t("home.stepBuyerReceiveDesc"),
      state: "upcoming",
    },
  ];

  const popularCrops = PRODUCE_CROP_CATALOG.slice(0, 6);

  return (
    <div className="space-y-6">
      <FirstVisitLanguagePrompt />

      {/* Hero / Overview Banner */}
      <Card className="border border-green-200 bg-white shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge tone="green">
                {isFarmer ? t("mode.farmerBadge") : t("mode.buyerBadge")}
              </Badge>
              {isAuthenticated && user ? (
                <Badge tone="neutral" className="capitalize">
                  {user.role.toLowerCase()}
                </Badge>
              ) : null}
            </div>
            <Badge tone="neutral">{t("home.pilotBadge")}</Badge>
          </div>

          <CardTitle className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            {isAuthenticated && user
              ? `Welcome back, ${user.fullName.split(" ")[0]}!`
              : isFarmer
                ? t("home.farmerTitle")
                : t("home.buyerTitle")}
          </CardTitle>

          <CardDescription className="text-sm text-gray-600 sm:text-base">
            {isFarmer ? t("home.farmerSubtitle") : t("home.buyerSubtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-0">
          {/* Main Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {isFarmer ? (
              <>
                <Link
                  href="/market/create"
                  className={buttonClasses({
                    variant: "primary",
                    size: "md",
                    className: "min-h-[44px] flex items-center gap-2 px-5",
                  })}
                >
                  <Plus className="h-5 w-5" />
                  <span>Sell Produce / List Batch</span>
                </Link>
                <Link
                  href="/market"
                  className={buttonClasses({
                    variant: "secondary",
                    size: "md",
                    className: "min-h-[44px] flex items-center gap-2",
                  })}
                >
                  <Store className="h-4 w-4" />
                  <span>Browse Marketplace</span>
                </Link>
                <Link
                  href="/orders"
                  className={buttonClasses({
                    variant: "ghost",
                    size: "md",
                    className: "min-h-[44px] flex items-center gap-2",
                  })}
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>My Orders &amp; Offers</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/market"
                  className={buttonClasses({
                    variant: "primary",
                    size: "md",
                    className: "min-h-[44px] flex items-center gap-2 px-5",
                  })}
                >
                  <Store className="h-5 w-5" />
                  <span>Explore Produce Market</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/orders"
                  className={buttonClasses({
                    variant: "secondary",
                    size: "md",
                    className: "min-h-[44px] flex items-center gap-2",
                  })}
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>My Purchase Orders</span>
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <Link
                href="/register"
                className={buttonClasses({
                  variant: "ghost",
                  size: "md",
                  className: "min-h-[44px]",
                })}
              >
                {t("auth.registerPageTitle")}
              </Link>
            )}
          </div>

          {/* Quick Flow Shortcuts */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Quick Management
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <Link
                href={isFarmer ? "/profile" : "/profile/buyer"}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100"
              >
                {isFarmer ? (
                  <Sprout className="h-3.5 w-3.5 text-green-700" />
                ) : (
                  <ShoppingBag className="h-3.5 w-3.5 text-green-700" />
                )}
                <span>{isFarmer ? "My Farm Profile" : "Buyer Sourcing Profile"}</span>
              </Link>

              <Link
                href="/profile/verify"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-green-700" />
                <span>Verification &amp; ID Upload</span>
              </Link>

              <Link
                href="/transport"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100"
              >
                <Truck className="h-3.5 w-3.5 text-green-700" />
                <span>Logistics &amp; Transport Hub</span>
              </Link>

              <Link
                href="/finance"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100"
              >
                <UserCheck className="h-3.5 w-3.5 text-green-700" />
                <span>Section 19 Payment Policy</span>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benue Priority Crops Fast-Discovery */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-gray-900">
              Benue State Agricultural Produce
            </CardTitle>
            <Link
              href="/market"
              className="text-xs font-semibold text-green-700 hover:text-green-900 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <CardDescription className="text-xs text-gray-600">
            Select a priority crop to discover live batches from verified local producers.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="flex flex-wrap gap-2">
            {popularCrops.map((crop) => (
              <Link
                key={crop.code}
                href={`/market?crop=${crop.code}`}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 transition-colors hover:border-green-600 hover:bg-green-50 hover:text-green-950"
              >
                <span>{t(crop.labelKey)}</span>
                {crop.isPerishable && (
                  <span className="rounded bg-amber-100 px-1 py-0.2 text-[10px] font-medium text-amber-800">
                    Perishable
                  </span>
                )}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stepper & Low-Data Guidance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900">
              {isFarmer ? t("home.farmerFlowTitle") : t("home.buyerFlowTitle")}
            </CardTitle>
            <CardDescription className="text-xs text-gray-600">
              {t("home.flowSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusStepper
              ariaLabel={
                isFarmer ? t("home.farmerFlowTitle") : t("home.buyerFlowTitle")
              }
              steps={isFarmer ? farmerSteps : buyerSteps}
            />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900">
              {t("home.mobileTitle")}
            </CardTitle>
            <CardDescription className="text-xs text-gray-600">
              {t("home.mobileSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-gray-700">
            <p>{t("home.mobileDesc1")}</p>
            <p>{t("home.mobileDesc2")}</p>
            <div className="pt-2">
              <LowDataSwitch />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benue Pilot Trust & Integrity Badges */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3.5">
          <MapPin className="h-5 w-5 shrink-0 text-green-700" />
          <div className="text-xs">
            <h4 className="font-bold text-gray-900">23 Benue LGAs</h4>
            <p className="text-gray-600 mt-0.5">
              Direct farm-gate aggregation in Makurdi, Gboko, Otukpo, and rural farming hubs.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3.5">
          <Scale className="h-5 w-5 shrink-0 text-green-700" />
          <div className="text-xs">
            <h4 className="font-bold text-gray-900">3-Tier Quality Grading</h4>
            <p className="text-gray-600 mt-0.5">
              Standardized Grade A (Premium), Grade B (Market), and Grade C (Bulk Processing).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3.5">
          <ShieldCheck className="h-5 w-5 shrink-0 text-green-700" />
          <div className="text-xs">
            <h4 className="font-bold text-gray-900">Section 19 Zero Custody</h4>
            <p className="text-gray-600 mt-0.5">
              Safe, direct settlement between Buyer and Farmer with verifiable digital trade receipts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
