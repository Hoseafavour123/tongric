"use client";

import { useState } from "react";
import { Check, Globe } from "lucide-react";
import { Alert, Badge, Button, Dialog } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useI18n } from "./i18n-provider";
import { LowDataSwitch } from "@/components/layout/low-data-provider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const {
    locale,
    languages,
    isUpdating,
    switchError,
    t,
    setLocale,
    clearSwitchError,
  } = useI18n();
  const [open, setOpen] = useState(false);

  const hasPartialCoverage = languages.some(
    (lang) => lang.validatedCount < lang.totalKeyCount,
  );

  const handleSelect = async (code: string) => {
    const ok = await setLocale(code);
    if (ok) {
      setOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          clearSwitchError();
          setOpen(true);
        }}
        aria-label={t("nav.language")}
        title={t("nav.language")}
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-md border border-gray-300 bg-white font-medium text-gray-800 hover:bg-gray-50 cursor-pointer",
          compact ? "min-h-8 px-2 text-xs" : "min-h-9 px-2.5 text-xs sm:text-sm",
        )}
      >
        <Globe className="h-3.5 w-3.5 text-green-700" aria-hidden="true" />
        <span className="uppercase">{locale}</span>
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("i18n.dialogTitle")}
        description={t("i18n.dialogSubtitle")}
      >
        <div className="space-y-4">
          {hasPartialCoverage ? (
            <Alert tone="info" title={t("nav.language")}>
              {t("i18n.fallbackNotice")}
            </Alert>
          ) : null}

          {switchError ? (
            <Alert tone="error" title={t("errors.network")}>
              {switchError}
            </Alert>
          ) : null}

          <div className="space-y-2">
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
                  onClick={() => void handleSelect(lang.code)}
                  className={cn(
                    "flex min-h-12 w-full items-center justify-between gap-3 rounded-md border px-3.5 py-2.5 text-left transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
                    isSelected
                      ? "border-green-700 bg-green-50 text-green-950"
                      : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{lang.nativeName}</p>
                    <p className="text-xs text-gray-600">{lang.name}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={isFullyReady ? "green" : "neutral"}>
                      {isFullyReady
                        ? t("i18n.readyBadge")
                        : t("i18n.reviewProgressBadge", {
                            count: lang.validatedCount,
                            total: lang.totalKeyCount,
                          })}
                    </Badge>
                    {isSelected ? (
                      <Check
                        className="h-4 w-4 text-green-700"
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          <LowDataSwitch />

          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isUpdating}
            >
              {t("common.close")}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

