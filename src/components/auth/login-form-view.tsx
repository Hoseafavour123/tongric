"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Input,
} from "@/components/ui";
import { resilientFetch } from "@/lib/resilient-fetch";
import { loginInputSchema } from "@/modules/auth/schemas";
import { JudgeQuickLogin } from "./judge-quick-login";

interface LoginResponseData {
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    accountStatus: string;
    preferredLanguageCode: string;
  };
}

export function getDefaultRoleRedirect(role?: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "FARMER":
      return "/market";
    case "BUYER":
      return "/market";
    case "TRANSPORT_PROVIDER":
      return "/transport";
    default:
      return "/";
  }
}

export function LoginFormView({ redirectPath = "/" }: { redirectPath?: string }) {
  const { t, setLocale } = useI18n();
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"phoneNumber" | "password", string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitLogin() {
    const payload = { phoneNumber, password };
    const parsed = loginInputSchema.safeParse(payload);

    if (!parsed.success) {
      const nextErrors: Partial<Record<"phoneNumber" | "password", string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !(key in nextErrors)) {
          nextErrors[key as "phoneNumber" | "password"] = issue.message;
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
      const result = await resilientFetch<LoginResponseData>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!result.ok) {
        setServerError(result.error.message);
        setCanRetry(result.canRetry);
        return;
      }

      if (result.data.user.preferredLanguageCode) {
        await setLocale(result.data.user.preferredLanguageCode);
      }

      const hasExplicitRedirect =
        Boolean(redirectPath) &&
        redirectPath.startsWith("/") &&
        !redirectPath.startsWith("//") &&
        redirectPath !== "/";

      const destination = hasExplicitRedirect
        ? redirectPath
        : getDefaultRoleRedirect(result.data.user.role);

      router.push(destination);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitLogin();
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      {/* Grant Reviewer & Judge Direct Login Dropdown */}
      <JudgeQuickLogin />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">
            {t("auth.loginPageTitle")}
          </CardTitle>
          <CardDescription>
            {t("auth.loginPageSubtitle")}
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
                      onClick={submitLogin}
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
              label={t("auth.passwordLabel")}
              required
              error={fieldErrors.password}
            >
              {({ id, describedBy, hasError }) => (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      id={id}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-describedby={describedBy}
                      aria-invalid={hasError || undefined}
                      hasError={hasError}
                      className="min-h-11 pl-9"
                    />
                    <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="text-xs">
                      {showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                    </span>
                  </Button>
                </div>
              )}
            </FormField>

            <div className="flex items-center justify-end">
              <Link
                href="/recover"
                className="text-xs font-semibold text-green-800 underline underline-offset-2 hover:text-green-900"
              >
                {t("auth.forgotPasswordLink")}
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              loadingLabel={t("auth.submittingLogin")}
            >
              {t("auth.submitLogin")}
            </Button>

            <div className="border-t border-gray-100 pt-3 text-center">
              <Link
                href="/register"
                className="text-xs font-medium text-gray-700 underline underline-offset-2 hover:text-green-800"
              >
                {t("auth.needAccountLink")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

