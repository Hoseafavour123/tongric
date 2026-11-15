"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { useLowDataMode } from "@/components/layout/low-data-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export interface LowDataImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Optional explicit override for deterministic rendering/tests. */
  forceLowData?: boolean;
}

/**
 * Mobile-data-conscious image component: renders lazily normally, or defers
 * downloading behind a clear "Load photo" button when Low-Data Mode is active.
 */
export function LowDataImage({
  src,
  alt,
  className,
  imgClassName,
  forceLowData,
}: LowDataImageProps) {
  const { lowDataEnabled } = useLowDataMode();
  const { t } = useI18n();
  const [revealed, setRevealed] = useState(false);

  const shouldDefer = (forceLowData ?? lowDataEnabled) && !revealed;

  if (shouldDefer) {
    return (
      <div
        className={cn(
          "flex min-h-36 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-center",
          className,
        )}
      >
        <ImageIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
        <p className="text-xs text-gray-600">{t("lowData.photoDeferredNote")}</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setRevealed(true)}
        >
          {t("lowData.loadPhotoButton")}
        </Button>
      </div>
    );
  }

  return (
    // Uses standard <img> with lazy decoding for external/Cloudinary and local URLs
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("h-auto w-full rounded-md object-cover", imgClassName, className)}
    />
  );
}

