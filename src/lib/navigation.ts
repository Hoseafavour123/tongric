/**
 * Navigation contract for Tongric's responsive shell:
 * - Mobile (< 768px): Bottom tab bar with up to 5 core app sections.
 * - Desktop (>= 768px): Simple top navigation bar.
 *
 * Feature 1.3 implements the full AppShell using this contract as domain routes
 * come online in Phases 3–9.
 */
export type CoreSectionId =
  | "home"
  | "marketplace"
  | "orders"
  | "logistics"
  | "account";

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
    id: "account",
    labelKey: "nav.account",
    defaultLabel: "Account",
    href: "/account",
    enabledInCurrentPhase: false,
  },
] as const;

