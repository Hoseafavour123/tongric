import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "green" | "amber" | "red" | "blue";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-gray-100 text-gray-800 border-gray-200",
  green: "bg-green-50 text-green-900 border-green-200",
  amber: "bg-amber-50 text-amber-900 border-amber-200",
  red: "bg-red-50 text-red-900 border-red-200",
  blue: "bg-blue-50 text-blue-900 border-blue-200",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

