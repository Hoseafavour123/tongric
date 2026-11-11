"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

export function OfflineRetryButton() {
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
      <span>Try Again</span>
    </Button>
  );
}

