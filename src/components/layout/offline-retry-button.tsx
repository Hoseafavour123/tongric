"use client";

import { RefreshCw } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui";

export function OfflineRetryButton() {
  const { t } = useI18n();

  return (
    <Button
      variant="primary"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }}
    >
      <RefreshCw className="h-4 w-4" aria-hidden="true" />
      <span>{t("common.retry")}</span>
    </Button>
  );
}
