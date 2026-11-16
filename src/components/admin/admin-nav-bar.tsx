"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Scale, ShieldCheck, History, Coins } from "lucide-react";
import { cn } from "@/lib/cn";

interface AdminNavBarProps {
  activeTab: "overview" | "users" | "disputes" | "verifications" | "audit" | "finance";
  pendingVerificationsCount?: number;
  activeDisputesCount?: number;
  loanApplicationsCount?: number;
}

export function AdminNavBar({
  activeTab,
  pendingVerificationsCount,
  activeDisputesCount,
  loanApplicationsCount,
}: AdminNavBarProps) {
  const pathname = usePathname();

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      isActive: activeTab === "overview" || pathname === "/admin",
    },
    {
      id: "users",
      label: "Users",
      href: "/admin/users",
      icon: Users,
      isActive: activeTab === "users" || pathname?.startsWith("/admin/users"),
    },
    {
      id: "disputes",
      label: "Disputes",
      href: "/admin/disputes",
      icon: Scale,
      badge: activeDisputesCount,
      isActive: activeTab === "disputes" || pathname?.startsWith("/admin/disputes"),
    },
    {
      id: "verifications",
      label: "Verifications",
      href: "/admin/verifications",
      icon: ShieldCheck,
      badge: pendingVerificationsCount,
      isActive: activeTab === "verifications" || pathname?.startsWith("/admin/verifications"),
    },
    {
      id: "finance",
      label: "Cooperative Loans",
      href: "/admin/finance",
      icon: Coins,
      badge: loanApplicationsCount,
      isActive: activeTab === "finance" || pathname?.startsWith("/admin/finance"),
    },
    {
      id: "audit",
      label: "Audit Trail",
      href: "/admin/audit-logs",
      icon: History,
      isActive: activeTab === "audit" || pathname?.startsWith("/admin/audit-logs"),
    },
  ];

  return (
    <nav
      aria-label="Admin console navigation"
      className="flex items-center gap-1.5 overflow-x-auto border-b border-gray-200 pb-2 mb-6"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap",
              tab.isActive
                ? "bg-green-700 text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={cn(
                  "ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-extrabold",
                  tab.isActive
                    ? "bg-white text-green-800"
                    : "bg-amber-600 text-white",
                )}
              >
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

