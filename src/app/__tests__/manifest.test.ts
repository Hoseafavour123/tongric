import { describe, expect, it } from "vitest";
import manifest from "../manifest";

describe("PWA manifest", () => {
  it("exposes valid Tongric standalone PWA metadata and icons", () => {
    const data = manifest();
    expect(data.short_name).toBe("Tongric");
    expect(data.display).toBe("standalone");
    expect(data.background_color).toBe("#ffffff");
    expect(data.theme_color).toBe("#15803d");
    expect(data.start_url).toBe("/");
    expect(data.icons?.length).toBeGreaterThanOrEqual(2);
    expect(data.icons?.some((icon) => icon.sizes === "192x192")).toBe(true);
    expect(data.icons?.some((icon) => icon.sizes === "512x512")).toBe(true);
  });
});

