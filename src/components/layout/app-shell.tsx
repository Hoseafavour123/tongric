"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Home,
  Landmark,
  ShieldCheck,
  Store,
  Truck,
  User,
  Sprout,
  ArrowLeftRight,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useI18n } from "@/components/i18n/i18n-provider";
import { cn } from "@/lib/cn";
import {
  ACCOUNT_NAV_ITEM,
  CORE_NAV_ITEMS,
  type CoreSectionId,
} from "@/lib/navigation";
import { NetworkStatusBanner } from "./network-status-banner";
import { WorkspaceModeSwitch } from "./workspace-mode-provider";
import { NotificationsDialog } from "@/components/notifications/notifications-dialog";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

const SECTION_ICONS: Record<CoreSectionId, typeof Home> = {
  home: Home,
  marketplace: Store,
  orders: ClipboardList,
  logistics: Truck,
  finance: Landmark,
};

export interface AppShellProps {
  activeSection?: CoreSectionId;
  children: ReactNode;
}

/**
 * Primary Tongric responsive shell:
 * - Mobile (< 768px): Compact top header (Brand + Farmer/Buyer toggle + Language + Account)
 *   plus a fixed 5-tab app-like bottom bar (Home, Market, Orders, Transport, Finance).
 * - Desktop (>= 768px): Clean single-row top navigation bar without sidebar bloat.
 */
export function AppShell({ activeSection: activeSectionProp, children }: AppShellProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const pathname = usePathname();

  function resolveActiveSection(): CoreSectionId {
    if (activeSectionProp) return activeSectionProp;
    if (!pathname) return "home";
    if (pathname.startsWith("/market")) return "marketplace";
    if (pathname.startsWith("/orders")) return "orders";
    if (pathname.startsWith("/transport")) return "logistics";
    if (pathname.startsWith("/finance") || pathname.startsWith("/exchange")) return "finance";
    return "home";
  }

  const activeSection = resolveActiveSection();

  const accountLabel = user
    ? user.fullName.trim().split(" ")[0] || user.fullName
    : t(ACCOUNT_NAV_ITEM.labelKey);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Desktop single-row header */}
      <header className="hidden border-b border-gray-200 bg-white md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-700 text-sm font-bold text-white"
              >
                T
              </span>
              <span className="text-lg font-semibold tracking-tight text-gray-900">
                {t("common.appName")}
              </span>
            </Link>

            <nav aria-label="Primary navigation" className="flex items-center gap-5">
              {CORE_NAV_ITEMS.map((item) => {
                const isActive = item.id === activeSection;
                const label = t(item.labelKey);
                return item.enabledInCurrentPhase ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-green-50 text-green-900 underline decoration-green-700 decoration-2 underline-offset-4"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    {label}
                  </Link>
                ) : (
                  <span
                    key={item.id}
                    aria-disabled="true"
                    title={t("common.comingSoon")}
                    className="px-2 py-1.5 text-sm text-gray-400"
                  >
                    {label}
                  </span>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-amber-300 bg-amber-50 text-amber-900 transition-colors hover:bg-amber-100"
                title="Admin Console"
                aria-label="Admin Console"
              >
                <ShieldCheck className="h-4 w-4 text-amber-700" />
              </Link>
            )}
            <WorkspaceModeSwitch />
            {/* Language switcher present in muted styling */}
            <div className="opacity-75 hover:opacity-100 transition-opacity">
              <LanguageSwitcher compact />
            </div>
            {/* Notifications icon-only */}
            {user && <NotificationsDialog compact />}
            {/* Profile icon-only */}
            <Link
              href="/account"
              aria-label={accountLabel}
              title={accountLabel}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-green-700/30 bg-green-50 text-green-900 transition-colors hover:bg-green-100"
            >
              <User className="h-4 w-4 text-green-800" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile compact header */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-gray-200 bg-white px-2.5 sm:px-4 md:hidden">
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-green-700 text-xs font-bold text-white"
          >
            T
          </span>
          <span className="text-sm font-semibold tracking-tight text-gray-900 sm:text-base">
            {t("common.appName")}
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              aria-label="Admin Console"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-amber-300 bg-amber-50 text-amber-900 transition-colors hover:bg-amber-100"
              title="Admin Console"
            >
              <ShieldCheck className="h-4 w-4 text-amber-700" />
            </Link>
          )}
          <WorkspaceModeSwitch compact />
          {/* Language switcher present in muted styling */}
          <div className="opacity-75 hover:opacity-100 transition-opacity">
            <LanguageSwitcher compact />
          </div>
          {/* Notifications icon-only */}
          {user && <NotificationsDialog compact />}
          {/* Profile icon-only */}
          <Link
            href="/account"
            aria-label={accountLabel}
            title={accountLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-green-700/30 bg-green-50 text-green-900 transition-colors hover:bg-green-100"
          >
            <User className="h-4 w-4 text-green-800" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Sub-navbar quick management tabs (only items not already in the main 5 tabs) */}
      <nav aria-label="Quick management tabs" className="border-b border-gray-200 bg-gray-50/70 text-xs">
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-1.5 sm:px-6">
          <Link
            href={user?.role === "BUYER" ? "/profile/buyer" : "/profile"}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1.5 rounded-md px-3 py-1 font-semibold transition-colors whitespace-nowrap",
              pathname?.startsWith("/profile") && !pathname?.startsWith("/profile/verify")
                ? "bg-white text-green-900 shadow-2xs border border-gray-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60",
            )}
          >
            <Sprout className="h-3.5 w-3.5 text-green-700" />
            <span>{user?.role === "BUYER" ? "Buyer Profile" : "Farm Profile"}</span>
          </Link>

          <Link
            href="/profile/verify"
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1.5 rounded-md px-3 py-1 font-semibold transition-colors whitespace-nowrap",
              pathname?.startsWith("/profile/verify")
                ? "bg-white text-green-900 shadow-2xs border border-gray-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60",
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-green-700" />
            <span>ID Verification</span>
          </Link>

          <Link
            href="/exchange"
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1.5 rounded-md px-3 py-1 font-semibold transition-colors whitespace-nowrap",
              pathname?.startsWith("/exchange")
                ? "bg-white text-green-900 shadow-2xs border border-gray-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60",
            )}
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-green-700" />
            <span>Barter Exchange</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-5 sm:px-6 md:pb-12 md:pt-8">
        <NetworkStatusBanner />
        {children}
      </main>

      {/* Mobile app-style 5-tab bottom navigation */}
      <nav
        aria-label="Mobile sections"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-5">
          {CORE_NAV_ITEMS.map((item) => {
            const Icon = SECTION_ICONS[item.id];
            const isActive = item.id === activeSection;
            const label = t(item.labelKey);

            return (
              <li key={item.id} className="min-w-0">
                {item.enabledInCurrentPhase ? (
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-semibold",
                      isActive ? "text-green-800" : "text-gray-700",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-green-700" : "text-gray-600",
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{label}</span>
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] text-gray-400"
                  >
                    <Icon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                    <span className="truncate">{label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
