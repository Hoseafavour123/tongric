import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { BuyerProfileView } from "../buyer-profile-view";
import { TransportProfileView } from "../transport-profile-view";
import type {
  BuyerProfileSummary,
  TransportProfileSummary,
} from "@/modules/profile";

describe("BuyerProfileView UI", () => {
  it("renders empty buyer profile form with buyer categories, LGAs, and crops", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <BuyerProfileView initialProfile={null} />
      </I18nProvider>,
    );

    expect(html).toContain("Buyer Profile");
    expect(html).toContain("Tell farmers what produce your business purchases");
    expect(html).toContain("Incomplete");
    expect(html).toContain("Unverified");

    // Inputs & select options
    expect(html).toContain("Business or Organization Name");
    expect(html).toContain("Food Processor / Mill");
    expect(html).toContain("Wholesaler / Bulk Trader");
    expect(html).toContain("Retailer / Market Trader");
    expect(html).toContain("Operating LGA in Benue State");
    expect(html).toContain("Primary Market or Collection Point (Optional)");
    expect(html).toContain("Produce You Regularly Purchase");

    // Crops
    expect(html).toContain("Yam");
    expect(html).toContain("Soybeans");

    // Button
    expect(html).toContain("Save Buyer Profile");
  });

  it("renders populated buyer profile with Complete status and pre-filled fields", () => {
    const mockProfile: BuyerProfileSummary = {
      id: "byr_123",
      userId: "usr_456",
      state: "Benue",
      businessName: "Benue Agro Processors Ltd",
      buyerType: "PROCESSOR",
      operatingLga: "makurdi",
      primaryMarket: "Modern Market Makurdi",
      cropsSourced: ["yam", "soybeans"],
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <BuyerProfileView initialProfile={mockProfile} />
      </I18nProvider>,
    );

    expect(html).toContain("Complete");
    expect(html).toContain("Verified");
    expect(html).toContain('value="Benue Agro Processors Ltd"');
    expect(html).toContain('value="Modern Market Makurdi"');
  });
});

describe("TransportProfileView UI", () => {
  it("renders empty transport profile form with vehicle types, capacity, and Benue route checklist", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <TransportProfileView initialProfile={null} />
      </I18nProvider>,
    );

    expect(html).toContain("Transport Provider Profile");
    expect(html).toContain("Set your vehicle capacity and service routes");
    expect(html).toContain("Incomplete");
    expect(html).toContain("Unverified");

    // Fleet inputs
    expect(html).toContain("Operator or Fleet Business Name");
    expect(html).toContain("Motorcycle / Tricycle");
    expect(html).toContain("Pickup Truck");
    expect(html).toContain("Van / Bus");
    expect(html).toContain("Truck (5T+)");
    expect(html).toContain("Maximum Load Capacity (in kg)");
    expect(html).toContain("Current Availability Status");
    expect(html).toContain("Available for Deliveries");
    expect(html).toContain("Pricing Model Preference");
    expect(html).toContain("Service LGAs in Benue State (Select routes)");

    // Button
    expect(html).toContain("Save Transport Profile");
  });

  it("renders populated transport profile with Complete status and pre-filled fields", () => {
    const mockProfile: TransportProfileSummary = {
      id: "trn_123",
      userId: "usr_456",
      operatorName: "Tersoo Fast Haulage",
      vehicleTypes: ["PICKUP", "VAN"],
      maxCapacityKg: 3500,
      operatingLgas: ["gboko", "makurdi"],
      isAvailable: true,
      pricingModel: "FIXED_RATE_CARD",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <TransportProfileView initialProfile={mockProfile} />
      </I18nProvider>,
    );

    expect(html).toContain("Complete");
    expect(html).toContain("Verified");
    expect(html).toContain('value="Tersoo Fast Haulage"');
    expect(html).toContain('value="3500"');
  });
});
