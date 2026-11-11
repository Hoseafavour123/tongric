import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type StepState = "completed" | "current" | "upcoming";

export interface StepItem {
  id: string;
  label: string;
  description?: string;
  state: StepState;
}

/**
 * Mobile-friendly vertical progress stepper designed for Order and
 * 6-step Delivery milestone tracking.
 */
export function StatusStepper({
  steps,
  ariaLabel = "Progress steps",
  className,
}: {
  steps: readonly StepItem[];
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <ol aria-label={ariaLabel} className={cn("space-y-4", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.id}
            aria-current={step.state === "current" ? "step" : undefined}
            className="relative flex gap-3"
          >
            {!isLast ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-3.5 top-7 h-[calc(100%-0.5rem)] w-0.5",
                  step.state === "completed" ? "bg-green-700" : "bg-gray-200",
                )}
              />
            ) : null}

            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                step.state === "completed" &&
                  "border-green-700 bg-green-700 text-white",
                step.state === "current" &&
                  "border-green-700 bg-green-50 text-green-900 ring-2 ring-green-200",
                step.state === "upcoming" &&
                  "border-gray-300 bg-white text-gray-500",
              )}
            >
              {step.state === "completed" ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </span>

            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.state === "upcoming" ? "text-gray-500" : "text-gray-900",
                )}
              >
                {step.label}
              </p>
              {step.description ? (
                <p className="mt-0.5 text-xs text-gray-600">
                  {step.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

