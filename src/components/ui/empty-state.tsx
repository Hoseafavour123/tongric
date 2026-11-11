import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-800">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-600">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

