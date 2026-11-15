"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound, Phone } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import {
  Alert,
  Button,
  buttonClasses,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Input,
} from "@/components/ui";
import { resilientFetch } from "@/lib/resilient-fetch";
import { recoverInputSchema } from "@/modules/auth/schemas";

export function RecoverFormView() {
  const { t } = useI18n();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"phoneNumber" | "recoveryCode" | "newPassword" | "confirmNewPassword", string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submitRecover() {
    const payload = {
      phoneNumber,
      recoveryCode,
      newPassword,
      confirmNewPassword,
    };
    const parsed = recoverInputSchema.safeParse(payload);

    if (!parsed.success) {
      const nextErrors: Partial<Record<"phoneNumber" | "recoveryCode" | "newPassword" | "confirmNewPassword", string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !(key in nextErrors)) {
          nextErrors[key as "phoneNumber" | "recoveryCode" | "newPassword" | "confirmNewPassword"] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setServerError(null);
    setCanRetry(false);
    setIsSubmitting(true);

    try {
      const result = await resilientFetch<{ success: boolean; message: string }>("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!result.ok) {
        setServerError(result.error.message);
        setCanRetry(result.canRetry);
        return;
      }

      setSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitRecover();
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md space-y-5">
        <Card className="border-green-300">
          <CardHeader>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              <CardTitle className="text-xl">
                {t("auth.recoverSuccessTitle")}
              </CardTitle>
            </div>
            <CardDescription>
              {t("auth.recoverSuccessBody")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link
              href="/login"
              className={buttonClasses({
                variant: "primary",
                size: "lg",
                fullWidth: true,
              })}
            >
              {t("auth.goToLoginCta")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">
            {t("auth.recoverPageTitle")}
          </CardTitle>
          <CardDescription>
            {t("auth.recoverPageSubtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {serverError ? (
              <Alert
                tone="error"
                title={t("auth.loginErrorTitle")}
                action={
                  canRetry ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={submitRecover}
                      disabled={isSubmitting}
                    >
                      {t("common.retry")}
                    </Button>
                  ) : undefined
                }
              >
                {serverError}
              </Alert>
            ) : null}

            <FormField
              label={t("auth.phoneLabel")}
              required
              hint={t("auth.phoneHint")}
              error={fieldErrors.phoneNumber}
            >
              {({ id, describedBy, hasError }) => (
                <div className="relative">
                  <Input
                    id={id}
                    name="phoneNumber"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={t("auth.phonePlaceholder")}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    aria-describedby={describedBy}
                    aria-invalid={hasError || undefined}
                    hasError={hasError}
                    className="min-h-11 pl-9"
                  />
                  <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
              )}
            </FormField>

            <FormField
              label={t("auth.recoveryCodeLabel")}
              required
              hint={t("auth.recoveryCodeHint")}
              error={fieldErrors.recoveryCode}
            >
              {({ id, describedBy, hasError }) => (
                <div className="relative">
                  <Input
                    id={id}
                    name="recoveryCode"
                    type="text"
                    autoCapitalize="characters"
                    placeholder={t("auth.recoveryCodePlaceholder")}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                    aria-describedby={describedBy}
                    aria-invalid={hasError || undefined}
                    hasError={hasError}
                    className="min-h-11 font-mono tracking-wider pl-9 uppercase"
                  />
                  <KeyRound className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
              )}
            </FormField>

            <FormField
              label={t("auth.newPasswordLabel")}
              required
              hint={t("auth.passwordHint")}
              error={fieldErrors.newPassword}
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  aria-describedby={describedBy}
                  aria-invalid={hasError || undefined}
                  hasError={hasError}
                  className="min-h-11"
                />
              )}
            </FormField>

            <FormField
              label={t("auth.confirmNewPasswordLabel")}
              required
              error={fieldErrors.confirmNewPassword}
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  name="confirmNewPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  aria-describedby={describedBy}
                  aria-invalid={hasError || undefined}
                  hasError={hasError}
                  className="min-h-11"
                />
              )}
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              loadingLabel={t("auth.submittingRecover")}
            >
              {t("auth.submitRecover")}
            </Button>

            <div className="border-t border-gray-100 pt-3 text-center">
              <Link
                href="/login"
                className="text-xs font-medium text-gray-700 underline underline-offset-2 hover:text-green-800"
              >
                {t("auth.alreadyHaveAccountLink")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

