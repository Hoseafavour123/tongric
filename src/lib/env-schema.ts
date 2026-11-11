import { z } from "zod";

const postgresUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value.startsWith("postgresql://") || value.startsWith("postgres://"),
    "DATABASE_URL must start with postgresql:// or postgres://",
  )
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return Boolean(parsed.hostname);
    } catch {
      return false;
    }
  }, "DATABASE_URL must be a valid PostgreSQL connection URL");

const optionalNonEmpty = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    APP_URL: z
      .string()
      .url("APP_URL must be a valid URL (e.g. http://localhost:3000)")
      .default("http://localhost:3000"),
    NEXT_PUBLIC_APP_NAME: z
      .string()
      .trim()
      .min(1, "NEXT_PUBLIC_APP_NAME cannot be empty")
      .default("Tongric"),
    DATABASE_URL: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      postgresUrlSchema.optional(),
    ),
    CLOUDINARY_CLOUD_NAME: optionalNonEmpty,
    CLOUDINARY_API_KEY: optionalNonEmpty,
    CLOUDINARY_API_SECRET: optionalNonEmpty,
  })
  .superRefine((data, ctx) => {
    const cloudinaryValues = [
      data.CLOUDINARY_CLOUD_NAME,
      data.CLOUDINARY_API_KEY,
      data.CLOUDINARY_API_SECRET,
    ];
    const providedCount = cloudinaryValues.filter(Boolean).length;
    if (providedCount > 0 && providedCount < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CLOUDINARY_CLOUD_NAME"],
        message:
          "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must all be provided together",
      });
    }
  });

export type AppEnv = z.infer<typeof envSchema>;

export function isCloudinaryConfigured(env: AppEnv): boolean {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET,
  );
}

/**
 * Validates raw environment variables against the Tongric config schema.
 * Throws a readable error summarizing invalid or missing keys.
 */
export function parseEnv(
  source: Record<string, string | undefined> = process.env,
): AppEnv {
  const result = envSchema.safeParse({
    NODE_ENV: source.NODE_ENV,
    APP_URL: source.APP_URL,
    NEXT_PUBLIC_APP_NAME: source.NEXT_PUBLIC_APP_NAME,
    DATABASE_URL: source.DATABASE_URL,
    CLOUDINARY_CLOUD_NAME: source.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: source.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: source.CLOUDINARY_API_SECRET,
  });

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid Tongric environment configuration: ${details}`);
  }

  return result.data;
}
