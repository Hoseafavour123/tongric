import type { ReactNode } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Home,
  Landmark,
  Store,
  Truck,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  ACCOUNT_NAV_ITEM,
  CORE_NAV_ITEMS,
  type CoreSectionId,
} from "@/lib/navigation";
import { NetworkStatusBanner } from "./network-status-banner";
import { WorkspaceModeSwitch } from "./workspace-mode-provider";

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
 * - Mobile (< 768px): Compact top header (Brand + Farmer/Buyer toggle + Account slot)
 *   plus a fixed 5-tab app-like bottom bar (Home, Market, Orders, Transport, Finance).
 * - Desktop (>= 768px): Clean single-row top navigation bar without sidebar bloat.
 */
export function AppShell({ activeSection = "home", children }: AppShellProps) {
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
                Tongric
              </span>
            </Link>

            <nav aria-label="Primary navigation" className="flex items-center gap-5">
              {CORE_NAV_ITEMS.map((item) => {
                const isActive = item.id === activeSection;
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
                    {item.defaultLabel}
                  </Link>
                ) : (
                  <span
                    key={item.id}
                    aria-disabled="true"
                    title="Available in upcoming phases"
                    className="px-2 py-1.5 text-sm text-gray-400"
                  >
                    {item.defaultLabel}
                  </span>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <WorkspaceModeSwitch />
            <span
              aria-disabled="true"
              title="Account and language arrive in Phases 2–3"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-400"
            >
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{ACCOUNT_NAV_ITEM.defaultLabel}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Mobile compact header */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 sm:px-4 md:hidden">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-green-700 text-xs font-bold text-white"
          >
            T
          </span>
          <span className="text-base font-semibold tracking-tight text-gray-900">
            Tongric
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <WorkspaceModeSwitch compact />
          <span
            aria-label="Account coming in Phase 3"
            aria-disabled="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400"
          >
            <User className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </header>

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
                    <span className="truncate">{item.defaultLabel}</span>
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] text-gray-400"
                  >
                    <Icon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                    <span className="truncate">{item.defaultLabel}</span>
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

