import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-green-700 text-white border border-green-700 hover:bg-green-800 active:bg-green-900 disabled:bg-green-200 disabled:border-green-200 disabled:text-green-800",
  secondary:
    "bg-green-50 text-green-900 border border-green-300 hover:bg-green-100 active:bg-green-200 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400",
  ghost:
    "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-400",
  danger:
    "bg-red-700 text-white border border-red-700 hover:bg-red-800 active:bg-red-900 disabled:bg-red-200 disabled:border-red-200 disabled:text-red-800",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3 py-2 text-xs",
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-5 py-3 text-base",
};

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && "w-full",
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  loadingLabel,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

