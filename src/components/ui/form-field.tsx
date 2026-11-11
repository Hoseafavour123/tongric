import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: (fieldProps: {
    id: string;
    describedBy: string | undefined;
    hasError: boolean;
  }) => ReactNode;
  className?: string;
}

/**
 * Accessible field wrapper enforcing a visible label, optional helper instruction,
 * and aria-linked validation message for low-literacy mobile clarity.
 */
export function FormField({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = htmlFor ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy =
    [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-900"
      >
        <span>{label}</span>
        {required ? (
          <span className="ml-1 text-red-700" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {children({
        id: fieldId,
        describedBy,
        hasError: Boolean(error),
      })}

      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed text-gray-600">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL_BASE =
  "w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

function controlBorder(hasError: boolean): string {
  return hasError
    ? "border-red-600 focus:border-red-700"
    : "border-gray-300 focus:border-green-700";
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function Input({
  hasError = false,
  className,
  ...props
}: InputProps) {
  return (
    <input
      aria-invalid={hasError || undefined}
      className={cn(CONTROL_BASE, "min-h-11", controlBorder(hasError), className)}
      {...props}
    />
  );
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function Textarea({
  hasError = false,
  rows = 3,
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={hasError || undefined}
      className={cn(CONTROL_BASE, "min-h-24", controlBorder(hasError), className)}
      {...props}
    />
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export function Select({
  hasError = false,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <select
      aria-invalid={hasError || undefined}
      className={cn(CONTROL_BASE, "min-h-11", controlBorder(hasError), className)}
      {...props}
    >
      {children}
    </select>
  );
}

