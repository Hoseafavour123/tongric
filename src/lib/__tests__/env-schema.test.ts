import { describe, expect, it } from "vitest";
import { isCloudinaryConfigured, parseEnv } from "../env-schema";

describe("parseEnv", () => {
  it("applies safe defaults when optional keys are omitted", () => {
    const parsed = parseEnv({});
    expect(parsed.NODE_ENV).toBe("development");
    expect(parsed.APP_URL).toBe("http://localhost:3000");
    expect(parsed.NEXT_PUBLIC_APP_NAME).toBe("Tongric");
    expect(parsed.DATABASE_URL).toBeUndefined();
  });

  it("accepts valid custom values including PostgreSQL URLs", () => {
    const parsed = parseEnv({
      NODE_ENV: "production",
      APP_URL: "https://tongric.ng",
      NEXT_PUBLIC_APP_NAME: "Tongric Pilot",
      DATABASE_URL: "postgresql://user:pass@ep-cool-host.neon.tech/tongric?sslmode=require",
    });
    expect(parsed.NODE_ENV).toBe("production");
    expect(parsed.APP_URL).toBe("https://tongric.ng");
    expect(parsed.NEXT_PUBLIC_APP_NAME).toBe("Tongric Pilot");
    expect(parsed.DATABASE_URL).toContain("postgresql://");
  });

  it("treats blank DATABASE_URL as undefined", () => {
    const parsed = parseEnv({ DATABASE_URL: "   " });
    expect(parsed.DATABASE_URL).toBeUndefined();
  });

  it("rejects non-PostgreSQL DATABASE_URL schemes", () => {
    expect(() =>
      parseEnv({
        DATABASE_URL: "mysql://user:pass@localhost:3306/tongric",
      }),
    ).toThrow(/DATABASE_URL/);
  });

  it("throws a clear error when APP_URL is malformed", () => {
    expect(() =>
      parseEnv({
        APP_URL: "not-a-valid-url",
      }),
    ).toThrow(/APP_URL/);
  });

  it("throws when NEXT_PUBLIC_APP_NAME is blank", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_APP_NAME: "   ",
      }),
    ).toThrow(/NEXT_PUBLIC_APP_NAME/);
  });

  it("validates Cloudinary credentials as an all-or-nothing group", () => {
    const empty = parseEnv({});
    expect(isCloudinaryConfigured(empty)).toBe(false);

    const complete = parseEnv({
      CLOUDINARY_CLOUD_NAME: "tongric-demo",
      CLOUDINARY_API_KEY: "123456",
      CLOUDINARY_API_SECRET: "super-secret",
    });
    expect(isCloudinaryConfigured(complete)).toBe(true);

    expect(() =>
      parseEnv({
        CLOUDINARY_CLOUD_NAME: "tongric-demo",
      }),
    ).toThrow(/CLOUDINARY/);
  });
});
