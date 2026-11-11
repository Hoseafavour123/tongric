import { describe, expect, it } from "vitest";
import { parseEnv } from "../env-schema";

describe("parseEnv", () => {
  it("applies safe defaults when optional keys are omitted", () => {
    const parsed = parseEnv({});
    expect(parsed.NODE_ENV).toBe("development");
    expect(parsed.APP_URL).toBe("http://localhost:3000");
    expect(parsed.NEXT_PUBLIC_APP_NAME).toBe("Tongric");
  });

  it("accepts valid custom values", () => {
    const parsed = parseEnv({
      NODE_ENV: "production",
      APP_URL: "https://tongric.ng",
      NEXT_PUBLIC_APP_NAME: "Tongric Pilot",
    });
    expect(parsed.NODE_ENV).toBe("production");
    expect(parsed.APP_URL).toBe("https://tongric.ng");
    expect(parsed.NEXT_PUBLIC_APP_NAME).toBe("Tongric Pilot");
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
});

