import { describe, expect, it } from "vitest";
import { isStyleguideEnabled } from "@/lib/styleguide-guard";

describe("isStyleguideEnabled", () => {
  it("allows /styleguide in development and test", () => {
    expect(isStyleguideEnabled("development")).toBe(true);
    expect(isStyleguideEnabled("test")).toBe(true);
  });

  it("blocks /styleguide in production", () => {
    expect(isStyleguideEnabled("production")).toBe(false);
  });
});

