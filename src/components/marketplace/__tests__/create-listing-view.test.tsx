import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { CreateListingView } from "../create-listing-view";

describe("CreateListingView UI", () => {
  it("renders complete accessible produce listing creation form", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <CreateListingView />
      </I18nProvider>,
    );

    // Header & guidance
    expect(html).toContain("Create Produce Listing");
    expect(html).toContain(
      "List your Benue harvest for commercial buyers, food processors, and retailers.",
    );

    // Crops
    expect(html).toContain("Produce Crop");
    expect(html).toContain("Yam");
    expect(html).toContain("Tomatoes");
    expect(html).toContain("Rice");
    expect(html).toContain("Soybeans");

    // Quality grades (3-tier)
    expect(html).toContain("Quality Grade");
    expect(html).toContain("Grade A (Premium)");
    expect(html).toContain("Grade B (Standard Market)");
    expect(html).toContain("Grade C (Processing / Bulk)");

    // Quantity & packaging units
    expect(html).toContain("Total Quantity Available");
    expect(html).toContain("Packaging Unit");
    expect(html).toContain("Bag");
    expect(html).toContain("Basket");
    expect(html).toContain("Crate");

    // Pricing & MOQ
    expect(html).toContain("Price Per Unit (₦)");
    expect(html).toContain("Minimum Order Quantity (MOQ)");
    expect(html).toContain("Price is open to negotiation");

    // Availability
    expect(html).toContain("Harvest Availability");
    expect(html).toContain("Available Now");
    expect(html).toContain("Upcoming Harvest (Pre-order)");

    // Farm Location in Benue
    expect(html).toContain("Produce Location (Benue State)");
    expect(html).toContain("Gboko LGA");
    expect(html).toContain("Makurdi LGA");
    expect(html).toContain("Town, Village, or Farm Settlement");

    // Photos & CTAs
    expect(html).toContain("Produce Photos (Up to 4)");
    expect(html).toContain("Take or Upload Photo");
    expect(html).toContain("Publish Produce Listing");
  });

  it("pre-fills default farm LGA and community when provided from profile", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <CreateListingView
          defaultLga="gboko"
          defaultCommunity="Tor-Donga Settlement"
        />
      </I18nProvider>,
    );

    expect(html).toContain('value="Tor-Donga Settlement"');
    expect(html).toContain('value="gboko" selected=""');
  });
});
