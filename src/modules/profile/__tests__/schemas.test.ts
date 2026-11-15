import { describe, expect, it } from "vitest";
import {
  adminReviewSchema,
  buyerProfileSchema,
  farmerProfileSchema,
  isValidCropCode,
  normalizeLgaCode,
  transportProfileSchema,
  verificationSubmissionSchema,
} from "../schemas";

describe("Farmer Profile Schemas & Catalogs Validation", () => {
  it("normalizes Benue LGA names and codes safely", () => {
    expect(normalizeLgaCode("gboko")).toBe("gboko");
    expect(normalizeLgaCode("Gboko")).toBe("gboko");
    expect(normalizeLgaCode("Katsina-Ala")).toBe("katsina-ala");
    expect(normalizeLgaCode("katsina ala")).toBe("katsina-ala");
    expect(normalizeLgaCode("Gwer East")).toBe("gwer-east");
    expect(normalizeLgaCode("Ikeja")).toBeNull();
    expect(normalizeLgaCode("")).toBeNull();
  });

  it("validates crop codes against the pilot catalog", () => {
    expect(isValidCropCode("yam")).toBe(true);
    expect(isValidCropCode("tomatoes")).toBe(true);
    expect(isValidCropCode("soybeans")).toBe(true);
    expect(isValidCropCode("coffee")).toBe(false);
    expect(isValidCropCode("")).toBe(false);
  });

  it("parses valid farmer profile inputs and sanitizes fields", () => {
    const parsed = farmerProfileSchema.parse({
      lga: "Gboko",
      community: "Tse-Agber",
      primaryCrops: ["yam", "soybeans", "yam"],
      cooperativeName: "  Gboko Farmers Coop  ",
      farmSizeHectares: "3.5",
    });

    expect(parsed.lga).toBe("gboko");
    expect(parsed.community).toBe("Tse-Agber");
    expect(parsed.primaryCrops).toEqual(["yam", "soybeans"]);
    expect(parsed.cooperativeName).toBe("Gboko Farmers Coop");
    expect(parsed.farmSizeHectares).toBe(3.5);
  });

  it("handles optional cooperative name and farm size gracefully", () => {
    const parsed = farmerProfileSchema.parse({
      lga: "makurdi",
      community: "Wurukum",
      primaryCrops: ["rice"],
      cooperativeName: "",
      farmSizeHectares: null,
    });

    expect(parsed.cooperativeName).toBeNull();
    expect(parsed.farmSizeHectares).toBeNull();
  });

  it("rejects invalid LGAs, empty communities, and missing crops", () => {
    expect(() =>
      farmerProfileSchema.parse({
        lga: "Lagos Mainland",
        community: "Tse-Agber",
        primaryCrops: ["yam"],
      }),
    ).toThrow(/Benue State Local Government/);

    expect(() =>
      farmerProfileSchema.parse({
        lga: "gboko",
        community: " ",
        primaryCrops: ["yam"],
      }),
    ).toThrow(/Community or village/);

    expect(() =>
      farmerProfileSchema.parse({
        lga: "gboko",
        community: "Tse-Agber",
        primaryCrops: [],
      }),
    ).toThrow(/Select at least one crop/);

    expect(() =>
      farmerProfileSchema.parse({
        lga: "gboko",
        community: "Tse-Agber",
        primaryCrops: ["unsupported_crop"],
      }),
    ).toThrow(/not in the Benue pilot catalog/);
  });
});

describe("Buyer Profile Schemas Validation", () => {
  it("parses valid buyer profile inputs and sanitizes fields", () => {
    const parsed = buyerProfileSchema.parse({
      businessName: "  Benue Agro Processors Ltd  ",
      buyerType: "PROCESSOR",
      operatingLga: "Makurdi",
      primaryMarket: "  Modern Market Makurdi  ",
      cropsSourced: ["yam", "soybeans", "yam"],
    });

    expect(parsed.businessName).toBe("Benue Agro Processors Ltd");
    expect(parsed.buyerType).toBe("PROCESSOR");
    expect(parsed.operatingLga).toBe("makurdi");
    expect(parsed.primaryMarket).toBe("Modern Market Makurdi");
    expect(parsed.cropsSourced).toEqual(["yam", "soybeans"]);
  });

  it("handles optional primary market gracefully", () => {
    const parsed = buyerProfileSchema.parse({
      businessName: "Tersoo Wholesalers",
      buyerType: "WHOLESALER",
      operatingLga: "gboko",
      primaryMarket: "",
      cropsSourced: ["cassava"],
    });

    expect(parsed.primaryMarket).toBeNull();
  });

  it("rejects invalid business name, buyer type, LGA, and missing crops", () => {
    expect(() =>
      buyerProfileSchema.parse({
        businessName: "A",
        buyerType: "PROCESSOR",
        operatingLga: "makurdi",
        cropsSourced: ["yam"],
      }),
    ).toThrow(/at least 2 characters/);

    expect(() =>
      buyerProfileSchema.parse({
        businessName: "Valid Business",
        buyerType: "INVALID_TYPE",
        operatingLga: "makurdi",
        cropsSourced: ["yam"],
      }),
    ).toThrow();

    expect(() =>
      buyerProfileSchema.parse({
        businessName: "Valid Business",
        buyerType: "WHOLESALER",
        operatingLga: "abuja",
        cropsSourced: ["yam"],
      }),
    ).toThrow(/Benue State Local Government Area/);

    expect(() =>
      buyerProfileSchema.parse({
        businessName: "Valid Business",
        buyerType: "RETAILER",
        operatingLga: "makurdi",
        cropsSourced: [],
      }),
    ).toThrow(/Select at least one crop/);

    expect(() =>
      buyerProfileSchema.parse({
        businessName: "Valid Business",
        buyerType: "RETAILER",
        operatingLga: "makurdi",
        cropsSourced: ["coffee"],
      }),
    ).toThrow(/not in the Benue pilot catalog/);
  });
});

describe("Transport Profile Schemas Validation", () => {
  it("parses valid transporter profile inputs and sanitizes fields", () => {
    const parsed = transportProfileSchema.parse({
      operatorName: "  Tersoo Haulage Services  ",
      vehicleTypes: ["PICKUP", "VAN"],
      maxCapacityKg: "3500",
      operatingLgas: ["Gboko", "makurdi", "Gboko"],
      isAvailable: true,
      pricingModel: "FIXED_RATE_CARD",
    });

    expect(parsed.operatorName).toBe("Tersoo Haulage Services");
    expect(parsed.vehicleTypes).toEqual(["PICKUP", "VAN"]);
    expect(parsed.maxCapacityKg).toBe(3500);
    expect(parsed.operatingLgas).toEqual(["gboko", "makurdi"]);
    expect(parsed.isAvailable).toBe(true);
    expect(parsed.pricingModel).toBe("FIXED_RATE_CARD");
  });

  it("defaults pricing model and availability if not provided", () => {
    const parsed = transportProfileSchema.parse({
      operatorName: "Benue Express",
      vehicleTypes: ["MOTORCYCLE_TRICYCLE"],
      maxCapacityKg: 200,
      operatingLgas: ["katsina-ala"],
    });

    expect(parsed.isAvailable).toBe(true);
    expect(parsed.pricingModel).toBe("QUOTE_ON_REQUEST");
  });

  it("rejects invalid operator name, vehicles, capacity, and routes", () => {
    expect(() =>
      transportProfileSchema.parse({
        operatorName: " ",
        vehicleTypes: ["TRUCK"],
        maxCapacityKg: 5000,
        operatingLgas: ["makurdi"],
      }),
    ).toThrow(/Operator name must be at least 2 characters/);

    expect(() =>
      transportProfileSchema.parse({
        operatorName: "Fast Trans",
        vehicleTypes: [],
        maxCapacityKg: 5000,
        operatingLgas: ["makurdi"],
      }),
    ).toThrow(/Select at least one vehicle type/);

    expect(() =>
      transportProfileSchema.parse({
        operatorName: "Fast Trans",
        vehicleTypes: ["TRUCK"],
        maxCapacityKg: 40,
        operatingLgas: ["makurdi"],
      }),
    ).toThrow(/at least 50 kg/);

    expect(() =>
      transportProfileSchema.parse({
        operatorName: "Fast Trans",
        vehicleTypes: ["TRUCK"],
        maxCapacityKg: 60000,
        operatingLgas: ["makurdi"],
      }),
    ).toThrow(/50,000 kg/);

    expect(() =>
      transportProfileSchema.parse({
        operatorName: "Fast Trans",
        vehicleTypes: ["TRUCK"],
        maxCapacityKg: 5000,
        operatingLgas: [],
      }),
    ).toThrow(/Select at least one operating LGA/);

    expect(() =>
      transportProfileSchema.parse({
        operatorName: "Fast Trans",
        vehicleTypes: ["TRUCK"],
        maxCapacityKg: 5000,
        operatingLgas: ["lagos_island"],
      }),
    ).toThrow(/Select at least one valid Benue State Local Government Area/);
  });
});

describe("Verification Document Schemas Validation", () => {
  it("parses valid verification submission inputs", () => {
    const parsed = verificationSubmissionSchema.parse({
      documentType: "NATIONAL_ID",
      documentNumber: "  12345678901  ",
    });

    expect(parsed.documentType).toBe("NATIONAL_ID");
    expect(parsed.documentNumber).toBe("12345678901");
  });

  it("handles optional empty document number gracefully", () => {
    const parsed = verificationSubmissionSchema.parse({
      documentType: "COOPERATIVE_LETTER",
      documentNumber: "",
    });

    expect(parsed.documentType).toBe("COOPERATIVE_LETTER");
    expect(parsed.documentNumber).toBeNull();
  });

  it("rejects invalid document type", () => {
    expect(() =>
      verificationSubmissionSchema.parse({
        documentType: "PASSPORT_INTERNATIONAL",
      }),
    ).toThrow();
  });

  it("parses valid admin review decision VERIFY and REJECT", () => {
    const verified = adminReviewSchema.parse({
      decision: "VERIFY",
    });
    expect(verified.decision).toBe("VERIFY");
    expect(verified.reason).toBeNull();

    const rejected = adminReviewSchema.parse({
      decision: "REJECT",
      reason: "  Document photo is blurry. Please re-upload.  ",
    });
    expect(rejected.decision).toBe("REJECT");
    expect(rejected.reason).toBe("Document photo is blurry. Please re-upload.");
  });

  it("rejects invalid review decision", () => {
    expect(() =>
      adminReviewSchema.parse({
        decision: "MAYBE",
      }),
    ).toThrow();
  });
});

