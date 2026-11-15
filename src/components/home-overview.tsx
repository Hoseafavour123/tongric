"use client";

import Link from "next/link";
import { FirstVisitLanguagePrompt } from "@/components/i18n/first-visit-language-prompt";
import { useI18n } from "@/components/i18n/i18n-provider";
import { LowDataSwitch } from "@/components/layout/low-data-provider";
import { useWorkspaceMode } from "@/components/layout/workspace-mode-provider";
import {
  Alert,
  Badge,
  buttonClasses,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatusStepper,
  type StepItem,
} from "@/components/ui";

export function HomeOverview() {
  const { mode } = useWorkspaceMode();
  const { t } = useI18n();
  const isFarmer = mode === "farmer";

  const farmerSteps: readonly StepItem[] = [
    {
      id: "list",
      label: t("home.stepFarmerListLabel"),
      description: t("home.stepFarmerListDesc"),
      state: "completed",
    },
    {
      id: "agree",
      label: t("home.stepFarmerAgreeLabel"),
      description: t("home.stepFarmerAgreeDesc"),
      state: "current",
    },
    {
      id: "deliver",
      label: t("home.stepFarmerDeliverLabel"),
      description: t("home.stepFarmerDeliverDesc"),
      state: "upcoming",
    },
  ];

  const buyerSteps: readonly StepItem[] = [
    {
      id: "discover",
      label: t("home.stepBuyerSearchLabel"),
      description: t("home.stepBuyerSearchDesc"),
      state: "completed",
    },
    {
      id: "offer",
      label: t("home.stepBuyerOfferLabel"),
      description: t("home.stepBuyerOfferDesc"),
      state: "current",
    },
    {
      id: "receive",
      label: t("home.stepBuyerReceiveLabel"),
      description: t("home.stepBuyerReceiveDesc"),
      state: "upcoming",
    },
  ];

  return (
    <div className="space-y-6">
      <FirstVisitLanguagePrompt />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone="green">
              {isFarmer ? t("mode.farmerBadge") : t("mode.buyerBadge")}
            </Badge>
            <Badge tone="neutral">{t("home.pilotBadge")}</Badge>
          </div>
          <CardTitle className="mt-3 text-xl sm:text-2xl">
            {isFarmer ? t("home.farmerTitle") : t("home.buyerTitle")}
          </CardTitle>
          <CardDescription>
            {isFarmer ? t("home.farmerSubtitle") : t("home.buyerSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert tone="info" title={t("home.foundationAlertTitle")}>
            {t("home.foundationAlertBody")}
          </Alert>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className={buttonClasses({ variant: "primary", size: "md" })}
            >
              {t("auth.registerPageTitle")}
            </Link>
            <Link
              href="/privacy"
              className={buttonClasses({ variant: "ghost", size: "md" })}
            >
              {t("auth.readPrivacyLink")}
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {isFarmer ? t("home.farmerFlowTitle") : t("home.buyerFlowTitle")}
            </CardTitle>
            <CardDescription>{t("home.flowSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusStepper
              ariaLabel={
                isFarmer ? t("home.farmerFlowTitle") : t("home.buyerFlowTitle")
              }
              steps={isFarmer ? farmerSteps : buyerSteps}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("home.mobileTitle")}</CardTitle>
            <CardDescription>{t("home.mobileSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>{t("home.mobileDesc1")}</p>
            <p>{t("home.mobileDesc2")}</p>
            <LowDataSwitch className="mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
