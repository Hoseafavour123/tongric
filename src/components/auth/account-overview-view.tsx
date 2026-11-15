"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileCheck,
  ListChecks,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Truck,
  User,
} from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import {
  Alert,
  Badge,
  Button,
  buttonClasses,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingSkeleton,
} from "@/components/ui";
import { resilientFetch } from "@/lib/resilient-fetch";
import { formatNigerianPhoneLocal } from "@/modules/auth/phone";

interface CurrentUserData {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  role: string;
  accountStatus: string;
  preferredLanguageCode: string;
  createdAt: string;
}

export function AccountOverviewView({ initialUser }: { initialUser?: CurrentUserData | null }) {
  const { t } = useI18n();
  const router = useRouter();

  const [user, setUser] = useState<CurrentUserData | null>(initialUser ?? null);
  const [loading, setLoading] = useState(initialUser === undefined);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialUser !== undefined) return;

    let active = true;
    resilientFetch<{ user: CurrentUserData }>("/api/auth/me")
      .then((res) => {
        if (!active) return;
        if (res.ok) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialUser]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await resilientFetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      setError("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <LoadingSkeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg py-6">
        <EmptyState
          icon={<User className="h-6 w-6" aria-hidden="true" />}
          title={t("auth.notLoggedInTitle")}
          description={t("auth.notLoggedInBody")}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className={buttonClasses({ variant: "primary", size: "md" })}
              >
                {t("auth.submitLogin")}
              </Link>
              <Link
                href="/register"
                className={buttonClasses({ variant: "secondary", size: "md" })}
              >
                {t("auth.submitRegister")}
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone="green">{user.role}</Badge>
            <Badge tone="neutral">
              {user.accountStatus === "ACTIVE"
                ? t("auth.statusActive")
                : t("auth.statusSuspended")}
            </Badge>
          </div>
          <CardTitle className="mt-2 text-xl sm:text-2xl">
            {user.fullName}
          </CardTitle>
          <CardDescription>
            {formatNigerianPhoneLocal(user.phoneNumber)}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error ? (
            <Alert tone="error" title={error} />
          ) : null}

          <div className="grid gap-2 text-sm">
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-600">{t("auth.phoneLabel")}</span>
              <span className="font-medium text-gray-900">{formatNigerianPhoneLocal(user.phoneNumber)}</span>
            </div>

            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-600">{t("auth.emailLabel")}</span>
              <span className="font-medium text-gray-900">{user.email || "—"}</span>
            </div>

            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-600">{t("auth.languageLabel")}</span>
              <span className="font-medium uppercase text-gray-900">{user.preferredLanguageCode}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 underline underline-offset-2 hover:text-green-900"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>{t("auth.readPrivacyLink")}</span>
            </Link>

            <Button
              variant="danger"
              size="sm"
              loading={isLoggingOut}
              loadingLabel={t("auth.loggingOut")}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>{t("auth.logoutButton")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {user.role === "FARMER" || user.role === "ADMIN" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t("profile.farmer.statusCardTitle")}</CardTitle>
            </div>
            <CardDescription>
              {t("profile.farmer.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/profile"
              className={buttonClasses({ variant: "secondary", size: "md", className: "w-full" })}
            >
              <Sprout className="h-4 w-4" aria-hidden="true" />
              <span>{t("profile.farmer.editProfileCta")}</span>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {user.role === "BUYER" || user.role === "ADMIN" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t("profile.buyer.statusCardTitle")}</CardTitle>
            </div>
            <CardDescription>
              {t("profile.buyer.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/profile/buyer"
              className={buttonClasses({ variant: "secondary", size: "md", className: "w-full" })}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span>{t("profile.buyer.editProfileCta")}</span>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {user.role === "TRANSPORT_PROVIDER" || user.role === "ADMIN" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t("profile.transporter.statusCardTitle")}</CardTitle>
            </div>
            <CardDescription>
              {t("profile.transporter.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/profile/transporter"
              className={buttonClasses({ variant: "secondary", size: "md", className: "w-full" })}
            >
              <Truck className="h-4 w-4" aria-hidden="true" />
              <span>{t("profile.transporter.editProfileCta")}</span>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* Identity & Market Verification Card (All Roles) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("profile.verify.accountCardTitle")}</CardTitle>
          </div>
          <CardDescription>
            {t("profile.verify.accountCardSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Link
            href="/profile/verify"
            className={buttonClasses({ variant: "secondary", size: "md", className: "w-full" })}
          >
            <FileCheck className="h-4 w-4" aria-hidden="true" />
            <span>{t("profile.verify.viewDocumentCta")}</span>
          </Link>
        </CardContent>
      </Card>

      {/* Administrator Verification Queue Shortcut */}
      {user.role === "ADMIN" ? (
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-emerald-950">
                {t("admin.verify.title")}
              </CardTitle>
            </div>
            <CardDescription className="text-emerald-800">
              {t("admin.verify.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/admin/verifications"
              className={buttonClasses({ variant: "primary", size: "md", className: "w-full" })}
            >
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              <span>Review Pending Verifications</span>
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

