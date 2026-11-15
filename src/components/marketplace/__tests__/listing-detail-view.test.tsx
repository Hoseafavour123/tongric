import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { I18nProvider } from "@/components/i18n/i18n-provider";
import { ListingDetailView } from "../listing-detail-view";
import type { ProduceListingSummary } from "@/modules/marketplace";

describe("ListingDetailView UI", () => {
  const sampleListing: ProduceListingSummary = {
    id: "list-1",
    farmerId: "usr_farmer_1",
    farmerName: "Terna Iorfa",
    farmerPhone: "+2348011112233",
    farmerVerificationStatus: "VERIFIED",
    cooperativeName: "Gboko Yam Producers Cooperative",
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
    description: "Good sound tubers harvested from rich riverine soil.",
    status: "ACTIVE",
    primaryPhotoUrl: "https://example.com/yam.webp",
    photos: [
      {
        id: "p-1",
        listingId: "list-1",
        fileStoragePath: "marketplace/usr_farmer_1/yam.webp",
        publicUrl: "https://example.com/yam.webp",
        mimeType: "image/webp",
        sizeBytes: 120000,
        isPrimary: true,
        createdAt: "2026-11-14T09:00:00.000Z",
      },
    ],
    createdAt: "2026-11-14T09:00:00.000Z",
    updatedAt: "2026-11-14T09:00:00.000Z",
  };

  it("renders complete listing details, verified farmer badge, and dual buyer CTAs", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <ListingDetailView listing={sampleListing} currentUserId="usr_buyer_1" />
      </I18nProvider>,
    );

    // Title & location
    expect(html).toContain("50 Bags of Yam (Grade B)");
    expect(html).toContain("Gboko LGA");
    expect(html).toContain("Tor-Donga Settlement");

    // Pricing & metrics
    expect(html).toContain("35,000");
    expect(html).toContain("per bag");
    expect(html).toContain("Negotiable");
    expect(html).toContain("50");
    expect(html).toContain("bags");
    expect(html).toContain("2,500");
    expect(html).toContain("kg");

    // Farmer information & verified status
    expect(html).toContain("Terna Iorfa");
    expect(html).toContain("Verified Farmer");
    expect(html).toContain("Gboko Yam Producers Cooperative");
    expect(html).toContain("+2348011112233");

    // Description
    expect(html).toContain("Good sound tubers harvested from rich riverine soil.");

    // Dual CTAs for buyer
    expect(html).toContain("Start Purchase / Make Offer");
    expect(html).toContain("Call Farmer");
    expect(html).toContain("tel:+2348011112233");
  });

  it("renders owner notice when viewed by listing farmer", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <ListingDetailView
          listing={sampleListing}
          currentUserId="usr_farmer_1"
          currentUserRole="FARMER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("This is your produce listing");
    expect(html).toContain("You are actively selling this produce on the Tongric marketplace.");
    expect(html).not.toContain("Start Purchase / Make Offer");
  });

  it("renders upcoming harvest date and unverified badge when applicable", () => {
    const upcomingListing: ProduceListingSummary = {
      ...sampleListing,
      id: "list-2",
      cropCode: "tomatoes",
      availabilityStatus: "UPCOMING_HARVEST",
      harvestDate: "2026-12-15",
      farmerVerificationStatus: "UNVERIFIED",
      cooperativeName: null,
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <ListingDetailView listing={upcomingListing} currentUserId="usr_buyer_2" />
      </I18nProvider>,
    );

    expect(html).toContain("Upcoming Harvest");
    expect(html).toContain("2026-12-15");
    expect(html).toContain("Unverified Farmer");
    expect(html).toContain("Perishable Produce");
  });
});
