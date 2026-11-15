import { describe, expect, it, vi } from "vitest";
import {
  calculateScaledDimensions,
  compressImageFile,
  type CanvasRasterizer,
} from "../image-compressor";

describe("image compression & scaling helpers", () => {
  it("scales oversized images proportionally without upscaling small images", () => {
    expect(calculateScaledDimensions(4000, 3000, 1280)).toEqual({
      width: 1280,
      height: 960,
      resized: true,
    });
    expect(calculateScaledDimensions(800, 600, 1280)).toEqual({
      width: 800,
      height: 600,
      resized: false,
    });
    expect(() => calculateScaledDimensions(0, 500)).toThrow();
  });

  it("rejects non-image files cleanly", async () => {
    const pdf = new File([new Uint8Array(1024)], "doc.pdf", {
      type: "application/pdf",
    });

    await expect(compressImageFile(pdf)).rejects.toThrow(/JPEG, PNG, or WebP/);
  });

  it("returns already-small images unchanged when within byte and dimension bounds", async () => {
    const smallFile = new File([new Uint8Array(50 * 1024)], "tomato.jpg", {
      type: "image/jpeg",
    });
    const release = vi.fn();
    const encodeToBlob = vi.fn();

    const rasterizer: CanvasRasterizer = {
      loadDimensions: vi
        .fn()
        .mockResolvedValue({ width: 800, height: 600, release }),
      encodeToBlob,
    };

    const result = await compressImageFile(smallFile, { rasterizer });

    expect(result.compressed).toBe(false);
    expect(result.finalBytes).toBe(50 * 1024);
    expect(encodeToBlob).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledOnce();
  });

  it("compresses oversized photos below 200KB via WebP/JPEG fallback", async () => {
    const largeFile = new File([new Uint8Array(900 * 1024)], "harvest.png", {
      type: "image/png",
    });
    const release = vi.fn();
    const encodeToBlob = vi
      .fn()
      // Simulate WebP unsupported (null) on first pass, then JPEG compressed to 120KB
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        new Blob([new Uint8Array(120 * 1024)], { type: "image/jpeg" }),
      );

    const rasterizer: CanvasRasterizer = {
      loadDimensions: vi
        .fn()
        .mockResolvedValue({ width: 3200, height: 2400, release }),
      encodeToBlob,
    };

    const result = await compressImageFile(largeFile, { rasterizer });

    expect(result.compressed).toBe(true);
    expect(result.finalBytes).toBe(120 * 1024);
    expect(result.file.name).toBe("harvest.jpg");
    expect(result.mimeType).toBe("image/jpeg");
    expect(release).toHaveBeenCalledOnce();
  });
});

