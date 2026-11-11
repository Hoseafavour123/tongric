import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

export type AlertTone = "info" | "success" | "warning" | "error";

const ALERT_STYLES: Record<
  AlertTone,
  { container: string; iconColor: string; titleColor: string }
> = {
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-950",
    iconColor: "text-blue-700",
    titleColor: "text-blue-950",
  },
  success: {
    container: "border-green-200 bg-green-50 text-green-950",
    iconColor: "text-green-700",
    titleColor: "text-green-950",
  },
  warning: {
    container: "border-amber-300 bg-amber-50 text-amber-950",
    iconColor: "text-amber-700",
    titleColor: "text-amber-950",
  },
  error: {
    container: "border-red-300 bg-red-50 text-red-950",
    iconColor: "text-red-700",
    titleColor: "text-red-950",
  },
};

const ALERT_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
} as const;

export interface AlertProps {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: AlertProps) {
  const styles = ALERT_STYLES[tone];
  const Icon = ALERT_ICONS[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border p-4",
        styles.container,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn("mt-0.5 h-5 w-5 shrink-0", styles.iconColor)}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className={cn("text-sm font-semibold", styles.titleColor)}>
            {title}
          </p>
          {children ? (
            <div className="text-sm leading-relaxed">{children}</div>
          ) : null}
          {action ? <div className="pt-2">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

