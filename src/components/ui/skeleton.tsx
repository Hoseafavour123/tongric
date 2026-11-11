import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
    />
  );
}

export function Spinner({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-2 text-sm text-gray-700", className)}
    >
      <Loader2 className="h-4 w-4 animate-spin text-green-700" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

