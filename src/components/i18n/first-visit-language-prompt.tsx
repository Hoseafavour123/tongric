"use client";

import { Globe } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { useI18n } from "./i18n-provider";

export function FirstVisitLanguagePrompt() {
  const {
    locale,
    languages,
    hasExplicitLocale,
    isUpdating,
    switchError,
    t,
    setLocale,
  } = useI18n();

  if (hasExplicitLocale) {
    return null;
  }

  return (
    <Card
      id="first-visit-language-prompt"
      className="border-green-200 bg-green-50/40"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-green-700" aria-hidden="true" />
            <CardTitle>{t("i18n.promptTitle")}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={isUpdating}
            onClick={() => void setLocale("en")}
          >
            {t("i18n.keepEnglish")}
          </Button>
        </div>
        <CardDescription>{t("i18n.promptBody")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {switchError ? (
          <Alert tone="error" title={t("errors.network")}>
            {switchError}
          </Alert>
        ) : null}

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {languages.map((lang) => {
            const isSelected = lang.code === locale;
            const isFullyReady =
              lang.totalKeyCount > 0 &&
              lang.validatedCount >= lang.totalKeyCount;

            return (
              <button
                key={lang.code}
                type="button"
                disabled={isUpdating}
                onClick={() => void setLocale(lang.code)}
                className={cn(
                  "flex min-h-14 flex-col items-start justify-center gap-1 rounded-md border bg-white px-3 py-2 text-left transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
                  isSelected
                    ? "border-green-700 ring-1 ring-green-700"
                    : "border-gray-300 hover:border-green-600 hover:bg-green-50/50",
                )}
              >
                <span className="text-sm font-semibold text-gray-900">
                  {lang.nativeName}
                </span>
                <Badge tone={isFullyReady ? "green" : "neutral"}>
                  {isFullyReady
                    ? t("i18n.readyBadge")
                    : t("i18n.reviewProgressBadge", {
                        count: lang.validatedCount,
                        total: lang.totalKeyCount,
                      })}
                </Badge>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

