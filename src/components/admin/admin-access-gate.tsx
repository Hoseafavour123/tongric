"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ShieldCheck, ArrowRight } from "lucide-react";
import { Alert, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

interface AdminAccessGateProps {
  currentRole: string;
  fullName: string;
}

export function AdminAccessGate({ currentRole, fullName }: AdminAccessGateProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePromoteToAdmin() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/role-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ADMIN" }),
      });

      const json = await res.json();
      if (res.ok && json.ok) {
        router.refresh();
      } else {
        setError(json.error?.message || "Failed to switch role.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 space-y-4">
      <Card className="border-amber-200 bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-amber-700" />
            <CardTitle className="text-xl font-bold text-gray-900">
              Admin Verification Queue
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <p className="text-sm text-gray-600">
            You are signed in as <strong>{fullName}</strong> with role <strong>{currentRole}</strong>.
          </p>
          <p className="text-sm text-gray-600">
            The verification review queue allows administrators to inspect submitted KYC documents (National ID, Voter&apos;s Card, CAC certificates) and approve or reject participants.
          </p>

          {error && <Alert tone="error" title={error} />}

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              loading={loading}
              onClick={handlePromoteToAdmin}
              className="w-full min-h-[44px] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Enable Admin Role &amp; Open Verification Queue</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

