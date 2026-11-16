"use client";

import Link from "next/link";
import {
  Users,
  Store,
  Truck,
  ShieldCheck,
  Scale,
  ClipboardList,
  History,
  ArrowRight,
  TrendingUp,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { AdminNavBar } from "./admin-nav-bar";
import type { AdminDashboardMetrics } from "@/modules/admin/schemas";

interface AdminDashboardViewProps {
  metrics: AdminDashboardMetrics;
}

export function AdminDashboardView({ metrics }: AdminDashboardViewProps) {
  const metricCards = [
    {
      label: "Total Registered",
      value: metrics.totalUsers,
      subtext: "Across all participant roles",
      icon: Users,
      color: "text-gray-900",
      bg: "bg-gray-100",
    },
    {
      label: "Active Farmers",
      value: metrics.activeFarmers,
      subtext: "Verified & registered growers",
      icon: TrendingUp,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Active Buyers",
      value: metrics.activeBuyers,
      subtext: "Wholesalers, processors, retailers",
      icon: Store,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Active Transporters",
      value: metrics.activeTransporters,
      subtext: "Corridor haulage operators",
      icon: Truck,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Commercial Orders",
      value: metrics.totalOrders,
      subtext: "Executed trade transactions",
      icon: ClipboardList,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending Verifications",
      value: metrics.pendingVerifications,
      subtext: "KYC documents awaiting review",
      icon: ShieldCheck,
      color: metrics.pendingVerifications > 0 ? "text-amber-700" : "text-gray-700",
      bg: metrics.pendingVerifications > 0 ? "bg-amber-50 border border-amber-200" : "bg-gray-50",
      href: "/admin/verifications",
    },
    {
      label: "Active Disputes",
      value: metrics.activeDisputes,
      subtext: "Orders requiring arbitration",
      icon: Scale,
      color: metrics.activeDisputes > 0 ? "text-red-700" : "text-gray-700",
      bg: metrics.activeDisputes > 0 ? "bg-red-50 border border-red-200" : "bg-gray-50",
      href: "/admin/disputes",
    },
    {
      label: "Audit Log Records",
      value: metrics.totalAuditLogs,
      subtext: "Immutable system events logged",
      icon: History,
      color: "text-purple-700",
      bg: "bg-purple-50",
      href: "/admin/audit-logs",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminNavBar
        activeTab="overview"
        pendingVerificationsCount={metrics.pendingVerifications}
        activeDisputesCount={metrics.activeDisputes}
      />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Platform Administration Console
        </h1>
        <p className="text-sm text-gray-600">
          Supervise market participants, arbitrate delivery disputes, inspect audit trails, and review verification credentials.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const content = (
            <Card className="transition-shadow hover:shadow-xs border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </span>
                  {card.href && (
                    <Badge tone="neutral" className="text-[10px] uppercase font-bold">
                      View
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-gray-900">
                  {card.value.toLocaleString("en-US")}
                </div>
                <div className="text-xs font-semibold text-gray-800 mt-0.5">
                  {card.label}
                </div>
                <div className="text-[11px] text-gray-600 mt-0.5 truncate">
                  {card.subtext}
                </div>
              </CardContent>
            </Card>
          );

          return card.href ? (
            <Link key={card.label} href={card.href} className="block">
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {/* Operations Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-green-700" />
              <span>Participant Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <p className="text-xs text-gray-600">
              Search participants by phone or name, view registration profiles, update account statuses (`ACTIVE`, `SUSPENDED`, `LOCKED`), and examine transaction volumes.
            </p>
            <Link
              href="/admin/users"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-800"
            >
              <span>Manage Participants</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Coins className="h-4 w-4 text-green-700" />
              <span>Cooperative Loans Demo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <p className="text-xs text-gray-600">
              Review farmer loan applications, examine verified sales snapshots under NDPA 2023, and register partner credit decisions.
            </p>
            <Link
              href="/admin/finance"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-800"
            >
              <span>Review Loan Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Scale className="h-4 w-4 text-red-700" />
              <span>Dispute Arbitration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <p className="text-xs text-gray-600">
              Review contested orders reported during collection or transit. Arbitrate disputes with documented resolution notes and automated inventory restoration.
            </p>
            <Link
              href="/admin/disputes"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-800"
            >
              <span>Mediate Disputes ({metrics.activeDisputes})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

