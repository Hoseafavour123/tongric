"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import {
  Badge,
  buttonClasses,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { NDPA_PRIVACY_POLICY_VERSION } from "@/modules/auth/schemas";

export function PrivacyNoticeView() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone="green">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              <span>NDPA 2023</span>
            </Badge>
            <Badge tone="neutral">
              {t("privacy.policyVersionBadge", {
                version: NDPA_PRIVACY_POLICY_VERSION,
              })}
            </Badge>
          </div>
          <CardTitle className="mt-3 text-xl sm:text-2xl">
            {t("privacy.pageTitle")}
          </CardTitle>
          <CardDescription>{t("privacy.pageIntro")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 text-sm leading-relaxed text-gray-800">
          <section className="space-y-1.5">
            <h3 className="font-semibold text-gray-900">
              {t("privacy.sectionCollectTitle")}
            </h3>
            <p>{t("privacy.sectionCollectBody")}</p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-gray-900">
              {t("privacy.sectionUseTitle")}
            </h3>
            <p>{t("privacy.sectionUseBody")}</p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-gray-900">
              {t("privacy.sectionProtectionTitle")}
            </h3>
            <p>{t("privacy.sectionProtectionBody")}</p>
          </section>

          <div className="pt-2">
            <Link
              href="/register"
              className={buttonClasses({ variant: "secondary", size: "md" })}
            >
              {t("privacy.backToRegister")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

