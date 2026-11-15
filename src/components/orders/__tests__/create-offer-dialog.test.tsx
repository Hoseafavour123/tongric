import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { CreateOfferDialog } from "../create-offer-dialog";
import type { ProduceListingSummary } from "@/modules/marketplace";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("CreateOfferDialog UI", () => {
  const sampleListing: ProduceListingSummary = {
    id: "list-1",
    farmerId: "usr_farmer_1",
    title: "50 Bags of Yam (Grade B)",
    cropCode: "yam",
    cropCategory: "tuber",
    grade: "GRADE_B",
    quantity: 50,
    unitCode: "bag",
    estimatedWeightKg: 2500,
    pricePerUnit: 35000,
    currency: "NGN",
    minOrderQuantity: 5,
    isNegotiable: true,
    availabilityStatus: "AVAILABLE_NOW",
    harvestDate: null,
    state: "Benue",
    lga: "Gboko",
    community: "Tor-Donga Settlement",
    description: "Good yams",
    status: "ACTIVE",
    primaryPhotoUrl: null,
    photos: [],
    createdAt: "2026-11-14T09:00:00.000Z",
    updatedAt: "2026-11-14T09:00:00.000Z",
  };

  it("renders purchase offer form with quantities, pricing, and fulfillment radios", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <CreateOfferDialog
          listing={sampleListing}
          isOpen={true}
          onClose={() => {}}
        />
      </I18nProvider>,
    );

    // Title & structure
    expect(html).toContain("Make Purchase Offer");
    expect(html).toContain("50 Bags of Yam (Grade B)");

    // Fields
    expect(html).toContain("Quantity (bags)");
    expect(html).toContain("Proposed Unit Price (₦)");
    expect(html).toContain("Total Offer Value");

    // Live calculation
    expect(html).toContain("175,000"); // 5 * 35000

    // Fulfillment options
    expect(html).toContain("Farm-gate Collection (Buyer picks up)");
    expect(html).toContain("Farmer Arranges Delivery");
    expect(html).toContain("Request Tongric Logistics Carrier");

    // Expiry notice (72h staple)
    expect(html).toContain("72 hours");

    // Action button
    expect(html).toContain("Send Purchase Offer");
  });

  it("does not render when isOpen is false", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <CreateOfferDialog
          listing={sampleListing}
          isOpen={false}
          onClose={() => {}}
        />
      </I18nProvider>,
    );

    expect(html).toBe("");
  });
});

