"use client";

import { useState } from "react";
import { ShieldCheck, UserCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button, Select, Badge, Card, CardContent } from "@/components/ui";
import { resilientFetch } from "@/lib/resilient-fetch";
import { useI18n } from "@/components/i18n/i18n-provider";

export interface DemoAccount {
  id: string;
  name: string;
  roleLabel: string;
  phoneNumber: string;
  role: "ADMIN" | "FARMER" | "BUYER" | "TRANSPORT_PROVIDER";
  description: string;
  targetRedirect: string;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    id: "reviewer",
    name: "Grant Reviewer / Judge",
    roleLabel: "Grant Judge (Admin)",
    phoneNumber: "08088888888",
    role: "ADMIN",
    description: "Full administrative oversight, dispute mediation, user verification, and financial monitoring.",
    targetRedirect: "/",
  },
  {
    id: "admin",
    name: "Oche Idoko (Pilot Coordinator)",
    roleLabel: "Platform Administrator",
    phoneNumber: "08099999999",
    role: "ADMIN",
    description: "System coordinator with complete audit logs and farmer verification review authority.",
    targetRedirect: "/",
  },
  {
    id: "farmer",
    name: "Terna Aondover (Gboko Smallholder)",
    roleLabel: "Verified Smallholder Farmer",
    phoneNumber: "08011111111",
    role: "FARMER",
    description: "Active farm-gate producer with listed yam/soybeans harvests and pending trade agreements.",
    targetRedirect: "/",
  },
  {
    id: "buyer",
    name: "Emeka Okonkwo (AgroVentures Ltd)",
    roleLabel: "Commercial Wholesale Buyer",
    phoneNumber: "08022222222",
    role: "BUYER",
    description: "Commercial aggregator with purchase offers and contracted logistics dispatches.",
    targetRedirect: "/",
  },
  {
    id: "transporter",
    name: "Danladi Ibrahim (Benue Express)",
    roleLabel: "Verified Logistics Carrier",
    phoneNumber: "08033333333",
    role: "TRANSPORT_PROVIDER",
    description: "Corridor fleet operator with active cargo dispatch and waybill fulfillment runs.",
    targetRedirect: "/",
  },
] as const;

export function JudgeQuickLogin({
  defaultSelected = "reviewer",
  className = "",
}: {
  defaultSelected?: string;
  className?: string;
}) {
  const { setLocale } = useI18n();

  const [selectedId, setSelectedId] = useState<string>(defaultSelected);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = DEMO_ACCOUNTS.find((a) => a.id === selectedId) || DEMO_ACCOUNTS[0]!;

  async function handleDirectLogin() {
    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await resilientFetch<{
        user: {
          id: string;
          fullName: string;
          role: string;
          preferredLanguageCode?: string;
        };
      }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: selectedAccount.phoneNumber,
          password: "Password123!",
        }),
      });

      if (!response.ok) {
        setError(response.error.message || "Failed to log in with demo account.");
        return;
      }

      if (response.data.user.preferredLanguageCode) {
        await setLocale(response.data.user.preferredLanguageCode);
      }

      if (typeof window !== "undefined") {
        window.location.href = selectedAccount.targetRedirect;
      }
    } catch {
      setError("Network or server connection failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <Card className={`border-2 border-green-600/80 bg-green-50/50 shadow-sm ${className}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-green-200/80 pb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-green-700 text-white shadow-2xs">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-gray-900 sm:text-base">
              Reviewer &amp; Admin Quick Login
            </h2>
            <p className="text-xs text-gray-600">
              Select an account below for direct evaluation access.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="judge-account-select" className="block text-xs font-bold text-gray-700">
            Account:
          </label>
          <Select
            id="judge-account-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full min-h-[42px] bg-white font-medium text-gray-900 border-gray-300"
          >
            {DEMO_ACCOUNTS.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} — {acc.roleLabel}
              </option>
            ))}
          </Select>
        </div>

        {selectedAccount && (
          <div className="rounded-lg border border-green-200 bg-white p-2.5 text-xs space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="font-bold text-gray-900">{selectedAccount.name}</span>
              <Badge tone="green">{selectedAccount.roleLabel}</Badge>
            </div>
            <div className="text-[11px] text-gray-600 font-mono">
              Phone: <strong className="text-gray-800">{selectedAccount.phoneNumber}</strong> &bull; Password: <strong className="text-gray-800">Password123!</strong>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs font-semibold text-red-700 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </p>
        )}

        <Button
          type="button"
          variant="primary"
          onClick={handleDirectLogin}
          disabled={isLoggingIn}
          className="w-full min-h-[42px] flex items-center justify-center gap-2 text-sm font-bold shadow-xs cursor-pointer"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" />
              <span>Log In as {selectedAccount.roleLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
