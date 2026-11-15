import { describe, expect, it } from "vitest";
import {
  createListingSchema,
  listingPhotoInputSchema,
} from "../schemas.ts";

describe("createListingSchema", () => {
  const validPayload = {
    cropCode: "yam",
    grade: "GRADE_B",
    quantity: 50,
    unitCode: "bag",
    pricePerUnit: 35000,
    currency: "NGN",
    minOrderQuantity: 5,
    isNegotiable: true,
    availabilityStatus: "AVAILABLE_NOW",
    state: "Benue",
    lga: "gboko",
    community: "Tor-Donga Settlement",
    description: "Well-cured white yams, dry and clean.",
    photos: [
      {
        fileStoragePath: "marketplace/farmer1/123-yam.webp",
        publicUrl: "https://res.cloudinary.com/demo/image/upload/yam.webp",
        mimeType: "image/webp",
        sizeBytes: 154000,
        isPrimary: true,
      },
    ],
  };

  it("successfully parses valid produce listing input", () => {
    const result = createListingSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cropCode).toBe("yam");
      expect(result.data.quantity).toBe(50);
      expect(result.data.pricePerUnit).toBe(35000);
      expect(result.data.minOrderQuantity).toBe(5);
      expect(result.data.isNegotiable).toBe(true);
      expect(result.data.state).toBe("Benue");
      expect(result.data.lga).toBe("gboko");
      expect(result.data.photos).toHaveLength(1);
    }
  });

  it("fails when cropCode is not in the Benue catalog", () => {
    const result = createListingSchema.safeParse({
      ...validPayload,
      cropCode: "apples",
    });
    expect(result.success).toBe(false);
  });

  it("fails when unitCode is not in the packaging catalog", () => {
    const result = createListingSchema.safeParse({
      ...validPayload,
      unitCode: "bushel",
    });
    expect(result.success).toBe(false);
  });

  it("fails when quantity is zero or negative", () => {
    const result = createListingSchema.safeParse({
      ...validPayload,
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });

  it("fails when pricePerUnit is zero or negative", () => {
    const result = createListingSchema.safeParse({
      ...validPayload,
      pricePerUnit: -100,
    });
    expect(result.success).toBe(false);
  });

  it("fails when minOrderQuantity exceeds total available quantity", () => {
    const result = createListingSchema.safeParse({
      ...validPayload,
      quantity: 20,
      minOrderQuantity: 25,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "Minimum order quantity cannot exceed total",
      );
    }
  });

  it("requires harvestDate when availabilityStatus is UPCOMING_HARVEST", () => {
    const resultWithoutDate = createListingSchema.safeParse({
      ...validPayload,
      availabilityStatus: "UPCOMING_HARVEST",
      harvestDate: null,
    });
    expect(resultWithoutDate.success).toBe(false);

    const resultWithDate = createListingSchema.safeParse({
      ...validPayload,
      availabilityStatus: "UPCOMING_HARVEST",
      harvestDate: "2026-12-01",
    });
    expect(resultWithDate.success).toBe(true);
  });

  it("fails when lga is not one of the 23 Benue LGAs", () => {
    const result = createListingSchema.safeParse({
      ...validPayload,
      lga: "ikeja",
    });
    expect(result.success).toBe(false);
  });

  it("enforces maximum 4 photos", () => {
    const photo = {
      fileStoragePath: "marketplace/f1/p.webp",
      publicUrl: "https://example.com/p.webp",
      mimeType: "image/webp",
      sizeBytes: 100000,
      isPrimary: false,
    };

    const result = createListingSchema.safeParse({
      ...validPayload,
      photos: [photo, photo, photo, photo, photo],
    });
    expect(result.success).toBe(false);
  });
});

describe("listingPhotoInputSchema", () => {
  it("rejects non-image mime types", () => {
    const result = listingPhotoInputSchema.safeParse({
      fileStoragePath: "marketplace/f1/doc.pdf",
      publicUrl: "https://example.com/doc.pdf",
      mimeType: "application/pdf",
      sizeBytes: 100000,
      isPrimary: false,
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid image mime types (jpg, png, webp)", () => {
    const mimes = ["image/jpeg", "image/png", "image/webp"];
    for (const mimeType of mimes) {
      const result = listingPhotoInputSchema.safeParse({
        fileStoragePath: "marketplace/f1/photo.img",
        publicUrl: "https://example.com/photo.img",
        mimeType,
        sizeBytes: 50000,
        isPrimary: true,
      });
      expect(result.success).toBe(true);
    }
  });
});

