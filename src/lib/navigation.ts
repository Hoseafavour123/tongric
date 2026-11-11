/**
 * Navigation contract for Tongric's responsive shell:
 * - Mobile (< 768px): Bottom tab bar with 5 core app sections
 *   (Home, Market, Orders, Transport, Finance).
 * - Desktop (>= 768px): Simple single-row top navigation bar + header Account slot.
 */
export type CoreSectionId =
  | "home"
  | "marketplace"
  | "orders"
  | "logistics"
  | "finance";

export interface CoreNavItem {
  id: CoreSectionId;
  labelKey: string;
  defaultLabel: string;
  href: string;
  enabledInCurrentPhase: boolean;
}

export const CORE_NAV_ITEMS: readonly CoreNavItem[] = [
  {
    id: "home",
    labelKey: "nav.home",
    defaultLabel: "Home",
    href: "/",
    enabledInCurrentPhase: true,
  },
  {
    id: "marketplace",
    labelKey: "nav.marketplace",
    defaultLabel: "Market",
    href: "/marketplace",
    enabledInCurrentPhase: false,
  },
  {
    id: "orders",
    labelKey: "nav.orders",
    defaultLabel: "Orders",
    href: "/orders",
    enabledInCurrentPhase: false,
  },
  {
    id: "logistics",
    labelKey: "nav.logistics",
    defaultLabel: "Transport",
    href: "/transport",
    enabledInCurrentPhase: false,
  },
  {
    id: "finance",
    labelKey: "nav.finance",
    defaultLabel: "Finance",
    href: "/finance",
    enabledInCurrentPhase: false,
  },
] as const;

export const ACCOUNT_NAV_ITEM = {
  id: "account",
  labelKey: "nav.account",
  defaultLabel: "Account",
  href: "/account",
  enabledInCurrentPhase: false,
} as const;
