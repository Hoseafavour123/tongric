"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Accessible lightweight modal built on the browser-native <dialog> element
 * so focus trapping and Escape handling require zero external UI runtime.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-gray-200 bg-white p-0 text-gray-900 shadow-lg backdrop:bg-gray-900/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 id={titleId} className="text-base font-semibold text-gray-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-xs text-gray-600">{description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}

