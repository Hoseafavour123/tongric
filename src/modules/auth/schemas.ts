import { z } from "zod";
import { normalizeNigerianPhone } from "./phone";

export const PUBLIC_REGISTRATION_ROLES = [
  "FARMER",
  "BUYER",
  "TRANSPORT_PROVIDER",
] as const;

export const ALL_USER_ROLES = [
  "FARMER",
  "BUYER",
  "TRANSPORT_PROVIDER",
  "ADMIN",
] as const;

export type PublicRegistrationRole = (typeof PUBLIC_REGISTRATION_ROLES)[number];
export type AuthUserRole = (typeof ALL_USER_ROLES)[number];

export const ACCOUNT_STATUSES = ["ACTIVE", "SUSPENDED", "LOCKED"] as const;
export type AuthAccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const CONSENT_TYPES = [
  "TERMS_AND_PRIVACY",
  "OPTIONAL_UPDATES",
] as const;
export type AuthConsentType = (typeof CONSENT_TYPES)[number];

export const NDPA_PRIVACY_POLICY_VERSION = "2026-11-v1" as const;

const WEAK_PASSWORDS = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "87654321",
  "00000000",
  "11111111",
  "password",
  "password1",
  "qwerty123",
  "tongric123",
  "admin123",
]);

export function normalizeEmailInput(rawEmail: string | null | undefined): string | null {
  if (typeof rawEmail !== "string") {
    return null;
  }
  const trimmed = rawEmail.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

export function isWeakPassword(password: string): boolean {
  const lowered = password.trim().toLowerCase();
  if (WEAK_PASSWORDS.has(lowered)) {
    return true;
  }
  return /^(.)\1+$/.test(lowered);
}

const rawRegisterFieldsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, " "))
    .refine((value) => value.length >= 2 && value.length <= 100, {
      message: "Full name must be between 2 and 100 characters",
    }),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Nigerian phone number is required"),
  email: z.string().trim().max(254).optional().nullable(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
  confirmPassword: z.string().optional(),
  role: z.string().trim().min(1, "Please select an account role"),
  preferredLanguageCode: z.string().trim().max(12).optional().nullable(),
  acceptedPrivacyPolicy: z.boolean(),
  acceptedOptionalUpdates: z.boolean().optional().default(false),
});

export const registerInputSchema = rawRegisterFieldsSchema.superRefine(
  (data, ctx) => {
    if (!normalizeNigerianPhone(data.phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneNumber"],
        message: "Enter a valid Nigerian phone number (e.g. 08031234567 or +2348031234567)",
      });
    }

    const normalizedEmail = normalizeEmailInput(data.email);
    if (
      normalizedEmail !== null &&
      !z.string().email().safeParse(normalizedEmail).success
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Enter a valid email address or leave it blank",
      });
    }

    if (isWeakPassword(data.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Choose a stronger password that is harder to guess",
      });
    }

    if (
      data.confirmPassword !== undefined &&
      data.password !== data.confirmPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }

    if (data.acceptedPrivacyPolicy !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["acceptedPrivacyPolicy"],
        message: "You must accept the Tongric Terms and NDPA Privacy Notice to continue",
      });
    }

    const upperRole = data.role.toUpperCase();
    if (
      upperRole !== "ADMIN" &&
      !PUBLIC_REGISTRATION_ROLES.includes(upperRole as PublicRegistrationRole)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["role"],
        message: "Select Farmer, Buyer, or Transport Provider",
      });
    }
  },
);

export type RawRegisterInput = z.input<typeof registerInputSchema>;
export type ParsedRegisterInput = z.infer<typeof registerInputSchema>;

export const loginInputSchema = z.object({
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  password: z.string().min(1, "Password is required"),
}).superRefine((data, ctx) => {
  if (!normalizeNigerianPhone(data.phoneNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phoneNumber"],
      message: "Enter a valid Nigerian phone number (e.g. 08031234567)",
    });
  }
});

export type RawLoginInput = z.input<typeof loginInputSchema>;
export type ParsedLoginInput = z.infer<typeof loginInputSchema>;

export const recoverInputSchema = z.object({
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  recoveryCode: z.string().trim().min(1, "Recovery code is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
  confirmNewPassword: z.string().min(1, "Confirm your new password"),
}).superRefine((data, ctx) => {
  if (!normalizeNigerianPhone(data.phoneNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phoneNumber"],
      message: "Enter a valid Nigerian phone number",
    });
  }

  if (isWeakPassword(data.newPassword)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["newPassword"],
      message: "Choose a stronger password that is harder to guess",
    });
  }

  if (data.newPassword !== data.confirmNewPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmNewPassword"],
      message: "Passwords do not match",
    });
  }
});

export type RawRecoverInput = z.input<typeof recoverInputSchema>;
export type ParsedRecoverInput = z.infer<typeof recoverInputSchema>;


