"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, RotateCcw } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { PRODUCE_CROP_CATALOG, BENUE_LGAS } from "@/modules/i18n/catalogs";

export interface ProduceFilterState {
  crop?: string;
  lga?: string;
  grade?: string;
  availability?: string;
  sort?: string;
}

export interface ProduceFilterBarProps {
  initialFilters?: ProduceFilterState;
  onFilterChange?: (filters: ProduceFilterState) => void;
}

export function ProduceFilterBar({
  initialFilters = {},
  onFilterChange,
}: ProduceFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  const currentCrop = searchParams.get("crop") ?? initialFilters.crop ?? "";
  const currentLga = searchParams.get("lga") ?? initialFilters.lga ?? "";
  const currentGrade = searchParams.get("grade") ?? initialFilters.grade ?? "";
  const currentAvailability =
    searchParams.get("availability") ?? initialFilters.availability ?? "";
  const currentSort = searchParams.get("sort") ?? initialFilters.sort ?? "newest";

  const hasActiveFilters = Boolean(
    currentCrop ||
      currentLga ||
      currentGrade ||
      currentAvailability ||
      (currentSort && currentSort !== "newest"),
  );

  function updateQuery(updates: Partial<ProduceFilterState>) {
    const nextState: ProduceFilterState = {
      crop: updates.crop !== undefined ? updates.crop : currentCrop,
      lga: updates.lga !== undefined ? updates.lga : currentLga,
      grade: updates.grade !== undefined ? updates.grade : currentGrade,
      availability:
        updates.availability !== undefined
          ? updates.availability
          : currentAvailability,
      sort: updates.sort !== undefined ? updates.sort : currentSort,
    };

    const params = new URLSearchParams();
    if (nextState.crop) params.set("crop", nextState.crop);
    if (nextState.lga) params.set("lga", nextState.lga);
    if (nextState.grade) params.set("grade", nextState.grade);
    if (nextState.availability) params.set("availability", nextState.availability);
    if (nextState.sort && nextState.sort !== "newest") {
      params.set("sort", nextState.sort);
    }

    onFilterChange?.(nextState);

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(url, { scroll: false });
    });
  }

  function handleReset() {
    onFilterChange?.({});
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-2xs">
      {/* Top Header & Reset */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <Filter className="h-4 w-4 text-green-700" />
          <span>Filter & Sort Produce</span>
          {isPending && (
            <span className="text-xs text-gray-500 font-normal animate-pulse">
              Updating...
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-green-800 hover:text-green-900 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("marketplace.filter.reset")}</span>
          </button>
        )}
      </div>

      {/* Crop Filter Chips (Horizontal Scroll) */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-gray-700">Crop Category</span>
        <div
          role="region"
          aria-label="Crops filter chips"
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin"
        >
          <button
            type="button"
            onClick={() => updateQuery({ crop: "" })}
            className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
              !currentCrop
                ? "bg-green-800 text-white border-green-850"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {t("marketplace.filter.allCrops")}
          </button>

          {PRODUCE_CROP_CATALOG.map((item) => {
            const isSelected = currentCrop === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => updateQuery({ crop: isSelected ? "" : item.code })}
                className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                  isSelected
                    ? "bg-green-800 text-white border-green-850"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {t(item.labelKey)}
                {item.isPerishable && (
                  <span
                    className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded ${
                      isSelected
                        ? "bg-green-700 text-green-100"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    Perishable
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Facet Dropdowns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Benue LGA Selector */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="filter-lga" className="text-xs font-semibold text-gray-700">
            Benue LGA
          </label>
          <select
            id="filter-lga"
            value={currentLga}
            onChange={(e) => updateQuery({ lga: e.target.value })}
            className="min-h-[44px] w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
          >
            <option value="">{t("marketplace.filter.allLgas")}</option>
            {BENUE_LGAS.map((lga) => (
              <option key={lga.code} value={lga.name}>
                {lga.name} LGA
              </option>
            ))}
          </select>
        </div>

        {/* Quality Grade Selector */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="filter-grade" className="text-xs font-semibold text-gray-700">
            Quality Grade
          </label>
          <select
            id="filter-grade"
            value={currentGrade}
            onChange={(e) => updateQuery({ grade: e.target.value })}
            className="min-h-[44px] w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
          >
            <option value="">{t("marketplace.filter.allGrades")}</option>
            <option value="GRADE_A">Grade A (Premium)</option>
            <option value="GRADE_B">Grade B (Standard Market)</option>
            <option value="GRADE_C">Grade C (Processing / Bulk)</option>
          </select>
        </div>

        {/* Availability Selector */}
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="filter-availability"
            className="text-xs font-semibold text-gray-700"
          >
            Availability
          </label>
          <select
            id="filter-availability"
            value={currentAvailability}
            onChange={(e) => updateQuery({ availability: e.target.value })}
            className="min-h-[44px] w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
          >
            <option value="">{t("marketplace.filter.allAvailability")}</option>
            <option value="AVAILABLE_NOW">{t("marketplace.filter.availableNow")}</option>
            <option value="UPCOMING_HARVEST">
              {t("marketplace.filter.upcomingHarvest")}
            </option>
          </select>
        </div>

        {/* Sort Selector */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="filter-sort" className="text-xs font-semibold text-gray-700">
            Sort Order
          </label>
          <select
            id="filter-sort"
            value={currentSort}
            onChange={(e) => updateQuery({ sort: e.target.value })}
            className="min-h-[44px] w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
          >
            <option value="newest">{t("marketplace.filter.sortNewest")}</option>
            <option value="price_asc">{t("marketplace.filter.sortPriceAsc")}</option>
            <option value="price_desc">{t("marketplace.filter.sortPriceDesc")}</option>
            <option value="quantity_desc">{t("marketplace.filter.sortQtyDesc")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}

