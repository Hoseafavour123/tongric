"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  ShoppingBag,
  Sprout,
  Truck,
} from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import {
  Alert,
  Badge,
  Button,
  buttonClasses,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Select,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { createIdempotencyKey } from "@/lib/idempotency";
import { resilientFetch } from "@/lib/resilient-fetch";
import type { RegistrationResult } from "@/modules/auth/auth-core";
import {
  NDPA_PRIVACY_POLICY_VERSION,
  registerInputSchema,
  type PublicRegistrationRole,
} from "@/modules/auth/schemas";
import type { TranslationKeyId } from "@/modules/i18n/base-dictionary";

interface RoleOption {
  role: PublicRegistrationRole;
  titleKey: TranslationKeyId;
  descKey: TranslationKeyId;
  Icon: typeof Sprout;
}

const ROLE_OPTIONS: readonly RoleOption[] = [
  {
    role: "FARMER",
    titleKey: "auth.roleFarmerTitle",
    descKey: "auth.roleFarmerDesc",
    Icon: Sprout,
  },
  {
    role: "BUYER",
    titleKey: "auth.roleBuyerTitle",
    descKey: "auth.roleBuyerDesc",
    Icon: ShoppingBag,
  },
  {
    role: "TRANSPORT_PROVIDER",
    titleKey: "auth.roleTransporterTitle",
    descKey: "auth.roleTransporterDesc",
    Icon: Truck,
  },
];

type FieldErrors = Partial<
  Record<
    | "fullName"
    | "phoneNumber"
    | "email"
    | "password"
    | "confirmPassword"
    | "role"
    | "acceptedPrivacyPolicy",
    string
  >
>;

export function RegisterFormView() {
  const { t, locale, languages, setLocale } = useI18n();

  const [role, setRole] = useState<PublicRegistrationRole>("FARMER");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [languageOverride, setLanguageOverride] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [acceptedOptionalUpdates, setAcceptedOptionalUpdates] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptKey, setAttemptKey] = useState(() => createIdempotencyKey());

  const [registration, setRegistration] = useState<RegistrationResult | null>(
    null,
  );
  const [recoveryAck, setRecoveryAck] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const preferredLanguageCode = languageOverride ?? locale;

  function resetAttemptKey() {
    setAttemptKey(createIdempotencyKey());
  }

  async function handleLanguageSelect(nextCode: string) {
    setLanguageOverride(nextCode);
    resetAttemptKey();
    await setLocale(nextCode);
  }

  async function submitRegistration() {
    const payload = {
      fullName,
      phoneNumber,
      email: email.trim() ? email.trim() : null,
      password,
      confirmPassword,
      role,
      preferredLanguageCode,
      acceptedPrivacyPolicy,
      acceptedOptionalUpdates,
    };

    const parsed = registerInputSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !(key in nextErrors)) {
          nextErrors[key as keyof FieldErrors] = issue.message;
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
      const result = await resilientFetch<RegistrationResult>(
        "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          idempotencyKey: attemptKey,
        },
      );

      if (!result.ok) {
        setServerError(result.error.message);
        setCanRetry(result.canRetry);
        return;
      }

      setRegistration(result.data);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitRegistration();
  }

  async function handleCopyRecoveryCode() {
    if (!registration) {
      return;
    }
    try {
      await navigator.clipboard.writeText(registration.recoveryCode);
      setCopiedCode(true);
    } catch {
      setCopiedCode(false);
    }
  }

  if (registration) {
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <Card className="border-green-300">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge tone="green">{registration.user.role}</Badge>
              <Badge tone="neutral">{registration.consentPolicyVersion}</Badge>
            </div>
            <CardTitle className="mt-3 text-xl sm:text-2xl">
              {t("auth.recoveryCardTitle")}
            </CardTitle>
            <CardDescription>
              {t("auth.recoveryCardSubtitle", {
                phone: registration.user.phoneNumber,
              })}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="rounded-lg border-2 border-green-700 bg-green-50 p-4 text-center">
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-900">
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                <span>{registration.user.fullName}</span>
              </div>
              <p
                data-testid="recovery-code-value"
                className="select-all font-mono text-2xl font-bold tracking-wider text-green-950 sm:text-3xl"
              >
                {registration.recoveryCode}
              </p>
              <div className="mt-3 flex justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyRecoveryCode}
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      <span>{t("auth.copiedRecoveryCode")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      <span>{t("auth.copyRecoveryCode")}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Alert tone="warning" title={t("auth.recoveryWarningTitle")}>
              {t("auth.recoveryWarningBody")}
            </Alert>

            <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-white p-3.5 text-sm text-gray-900">
              <input
                type="checkbox"
                checked={recoveryAck}
                onChange={(e) => setRecoveryAck(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-green-700"
              />
              <span className="font-medium leading-snug">
                {t("auth.recoveryAcknowledgeLabel")}
              </span>
            </label>

            <div>
              {recoveryAck ? (
                <Link
                  href="/"
                  className={buttonClasses({
                    variant: "primary",
                    size: "lg",
                    fullWidth: true,
                  })}
                >
                  {t("auth.continueHomeCta")}
                </Link>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled
                >
                  {t("auth.continueHomeCta")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Card>
        <CardHeader>
          <Badge tone="green">NDPA 2023</Badge>
          <CardTitle className="mt-3 text-xl sm:text-2xl">
            {t("auth.registerPageTitle")}
          </CardTitle>
          <CardDescription>{t("auth.registerPageSubtitle")}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {serverError ? (
              <Alert
                tone="error"
                title={t("auth.registerErrorTitle")}
                action={
                  canRetry ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={submitRegistration}
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

            <fieldset className="space-y-2.5">
              <legend className="text-sm font-medium text-gray-900">
                {t("auth.roleSectionLabel")}{" "}
                <span className="text-red-700" aria-hidden="true">
                  *
                </span>
              </legend>

              <div className="grid gap-2.5">
                {ROLE_OPTIONS.map(({ role: optionRole, titleKey, descKey, Icon }) => {
                  const selected = role === optionRole;
                  return (
                    <label
                      key={optionRole}
                      className={cn(
                        "flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors",
                        selected
                          ? "border-green-700 bg-green-50"
                          : "border-gray-300 bg-white hover:border-green-600",
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={optionRole}
                        checked={selected}
                        onChange={() => {
                          setRole(optionRole);
                          resetAttemptKey();
                        }}
                        className="mt-1 h-4 w-4 shrink-0 accent-green-700"
                      />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                          selected
                            ? "bg-green-700 text-white"
                            : "bg-green-50 text-green-800",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-gray-900">
                          {t(titleKey)}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-gray-600">
                          {t(descKey)}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <p className="text-xs text-gray-600">{t("auth.dualViewTip")}</p>
            </fieldset>

            <FormField
              label={t("auth.fullNameLabel")}
              required
              error={fieldErrors.fullName}
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder={t("auth.fullNamePlaceholder")}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    resetAttemptKey();
                  }}
                  aria-describedby={describedBy}
                  aria-invalid={hasError || undefined}
                  hasError={hasError}
                  className="min-h-11"
                />
              )}
            </FormField>

            <FormField
              label={t("auth.phoneLabel")}
              required
              hint={t("auth.phoneHint")}
              error={fieldErrors.phoneNumber}
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  name="phoneNumber"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t("auth.phonePlaceholder")}
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    resetAttemptKey();
                  }}
                  aria-describedby={describedBy}
                  aria-invalid={hasError || undefined}
                  hasError={hasError}
                  className="min-h-11"
                />
              )}
            </FormField>

            <FormField
              label={t("auth.emailLabel")}
              hint={t("auth.emailHint")}
              error={fieldErrors.email}
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    resetAttemptKey();
                  }}
                  aria-describedby={describedBy}
                  aria-invalid={hasError || undefined}
                  hasError={hasError}
                  className="min-h-11"
                />
              )}
            </FormField>

            <FormField label={t("auth.languageLabel")}>
              {({ id }) => (
                <Select
                  id={id}
                  name="preferredLanguageCode"
                  value={preferredLanguageCode}
                  onChange={(e) => {
                    void handleLanguageSelect(e.target.value);
                  }}
                  className="min-h-11"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                      {lang.nativeName !== lang.name ? ` (${lang.name})` : ""}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            <FormField
              label={t("auth.passwordLabel")}
              required
              hint={t("auth.passwordHint")}
              error={fieldErrors.password}
            >
              {({ id, describedBy, hasError }) => (
                <div className="flex items-center gap-2">
                  <Input
                    id={id}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      resetAttemptKey();
                    }}
                    aria-describedby={describedBy}
                    aria-invalid={hasError || undefined}
                    hasError={hasError}
                    className="min-h-11 flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? t("auth.hidePassword")
                        : t("auth.showPassword")
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="text-xs">
                      {showPassword
                        ? t("auth.hidePassword")
                        : t("auth.showPassword")}
                    </span>
                  </Button>
                </div>
              )}
            </FormField>

            <FormField
              label={t("auth.confirmPasswordLabel")}
              required
              error={fieldErrors.confirmPassword}
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    resetAttemptKey();
                  }}
                  aria-describedby={describedBy}
                  aria-invalid={hasError || undefined}
                  hasError={hasError}
                  className="min-h-11"
                />
              )}
            </FormField>

            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {t("auth.ndpaConsentTitle")}
                </h3>
                <Link
                  href="/privacy"
                  className="text-xs font-semibold text-green-800 underline underline-offset-2 hover:text-green-900"
                >
                  {t("auth.readPrivacyLink")}
                </Link>
              </div>

              <label
                className={cn(
                  "flex min-h-12 cursor-pointer items-start gap-3 rounded-md border bg-white p-3 text-sm",
                  fieldErrors.acceptedPrivacyPolicy
                    ? "border-red-600"
                    : "border-gray-300",
                )}
              >
                <input
                  type="checkbox"
                  name="acceptedPrivacyPolicy"
                  checked={acceptedPrivacyPolicy}
                  onChange={(e) => {
                    setAcceptedPrivacyPolicy(e.target.checked);
                    resetAttemptKey();
                  }}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-green-700"
                />
                <span className="space-y-1">
                  <span className="block font-medium text-gray-900">
                    {t("auth.ndpaRequiredLabel", {
                      version: NDPA_PRIVACY_POLICY_VERSION,
                    })}{" "}
                    <span className="text-red-700" aria-hidden="true">
                      *
                    </span>
                  </span>
                  <span className="block text-xs leading-relaxed text-gray-600">
                    {t("auth.ndpaRequiredHint")}
                  </span>
                </span>
              </label>
              {fieldErrors.acceptedPrivacyPolicy ? (
                <p role="alert" className="text-xs font-medium text-red-700">
                  {fieldErrors.acceptedPrivacyPolicy}
                </p>
              ) : null}

              <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-800">
                <input
                  type="checkbox"
                  name="acceptedOptionalUpdates"
                  checked={acceptedOptionalUpdates}
                  onChange={(e) => {
                    setAcceptedOptionalUpdates(e.target.checked);
                    resetAttemptKey();
                  }}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-green-700"
                />
                <span className="leading-snug">{t("auth.ndpaOptionalLabel")}</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              loadingLabel={t("auth.submittingRegister")}
            >
              {t("auth.submitRegister")}
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

