"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Plus,
  Store,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/i18n/i18n-provider";
import { useWorkspaceMode } from "@/components/layout/workspace-mode-provider";
import {
  buttonClasses,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatusStepper,
  type StepItem,
} from "@/components/ui";
import { CROP_VISUALS, HERO_FARMER_IMAGE } from "@/lib/crop-visuals";

export function HomeOverview() {
  const { mode } = useWorkspaceMode();
  const { t } = useI18n();
  const { user, isAuthenticated } = useAuth();
  const isFarmer = mode === "farmer";

  const farmerSteps: readonly StepItem[] = [
    {
      id: "list",
      label: "List Produce",
      description: "Post harvest lot with Grade & Unit pricing",
      state: "completed",
    },
    {
      id: "agree",
      label: "Agree Terms",
      description: "Accept buyer offer & assign transport",
      state: "current",
    },
    {
      id: "deliver",
      label: "Delivery & PIN Handover",
      description: "Verify farm-gate release with 4-digit PIN",
      state: "upcoming",
    },
  ];

  const buyerSteps: readonly StepItem[] = [
    {
      id: "discover",
      label: "Discover Lots",
      description: "Filter by 23 Benue LGAs and crop grade",
      state: "completed",
    },
    {
      id: "offer",
      label: "Make Offer",
      description: "Negotiate price, volume, and corridor haulage",
      state: "current",
    },
    {
      id: "receive",
      label: "Confirm Receipt",
      description: "Inspect produce, verify delivery PIN, rate carrier",
      state: "upcoming",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Split Hero Section */}
      <Card className="overflow-hidden border border-green-200/90 bg-white shadow-xs">
        <div className="grid grid-cols-1 items-center md:grid-cols-12">
          {/* Left Column: Minimal Punchy Headline & Primary Actions */}
          <div className="space-y-4 p-6 sm:p-8 md:col-span-7">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                {isAuthenticated && user
                  ? `Welcome back, ${user.fullName.split(" ")[0]}!`
                  : isFarmer
                    ? t("home.farmerTitle")
                    : t("home.buyerTitle")}
              </h1>

              <p className="mt-2 text-sm text-gray-600 sm:text-base leading-relaxed">
                {isFarmer
                  ? t("home.farmerSubtitle")
                  : t("home.buyerSubtitle")}
              </p>
            </div>

            {/* 1-2 Key Actions Only */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {isFarmer ? (
                <>
                  <Link
                    href="/market/create"
                    className={buttonClasses({
                      variant: "primary",
                      size: "md",
                      className: "min-h-[44px] flex items-center gap-2 px-5 font-bold shadow-xs",
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
                      className: "min-h-[44px] flex items-center gap-2 px-4",
                    })}
                  >
                    <Store className="h-4 w-4" />
                    <span>Browse Marketplace</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/market"
                    className={buttonClasses({
                      variant: "primary",
                      size: "md",
                      className: "min-h-[44px] flex items-center gap-2 px-5 font-bold shadow-xs",
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
                      className: "min-h-[44px] flex items-center gap-2 px-4",
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
                  Create Account
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: High-Res Farmer & Agricultural Imagery */}
          <div className="p-4 sm:p-6 md:col-span-5 flex justify-center">
            <div className="relative aspect-4/3 w-full max-w-sm overflow-hidden rounded-2xl border border-green-200/90 bg-green-50 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_FARMER_IMAGE.localPath}
                alt={HERO_FARMER_IMAGE.alt}
                loading="eager"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Benue State Agricultural Produce — Horizontal Scroll Display */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-extrabold text-gray-900 sm:text-xl">
                Benue State Agricultural Produce
              </CardTitle>
              <CardDescription className="text-xs text-gray-600 mt-0.5">
                Swipe across staple crops to view active harvest lots from verified local growers.
              </CardDescription>
            </div>
            <Link
              href="/market"
              className="inline-flex min-h-[36px] items-center gap-1 text-xs font-bold text-green-800 hover:text-green-950 hover:underline"
            >
              <span>View All Lots</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-1">
          <div className="flex gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory">
            {CROP_VISUALS.map((crop) => (
              <Link
                key={crop.code}
                href={`/market?crop=${crop.code}`}
                className="group flex w-40 sm:w-48 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-green-600 hover:shadow-md"
              >
                {/* Crop Photo with Fallbacks */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={crop.localPath}
                    alt={crop.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Crop Name & Category Only (No tags) */}
                <div className="flex items-center justify-between p-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-green-800 transition-colors line-clamp-1">
                      {crop.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">{crop.category}</p>
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700 group-hover:bg-green-700 group-hover:text-white transition-colors">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clean 3-Step Simple Flow Stepper (Minimal & Clear) */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-gray-900">
            {isFarmer ? "Simple 3-Step Farmer Flow" : "Simple 3-Step Buyer Flow"}
          </CardTitle>
          <CardDescription className="text-xs text-gray-600">
            {isFarmer
              ? "How commercial agricultural sales operate on Tongric from farm gate to payment."
              : "How produce sourcing operates on Tongric from enquiry to delivery inspection."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <StatusStepper
            ariaLabel={isFarmer ? "Simple 3-Step Farmer Flow" : "Simple 3-Step Buyer Flow"}
            steps={isFarmer ? farmerSteps : buyerSteps}
          />
        </CardContent>
      </Card>
    </div>
  );
}
