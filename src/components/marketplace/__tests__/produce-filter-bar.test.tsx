import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/market",
  useSearchParams: () => new URLSearchParams(),
}));

import { ProduceFilterBar } from "../produce-filter-bar";

describe("ProduceFilterBar UI", () => {
  it("renders structured facet filters with crops, LGAs, grades, and sort options", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <ProduceFilterBar />
      </I18nProvider>,
    );

    // Title & structure
    expect(html).toContain("Filter &amp; Sort Produce");
    expect(html).toContain("Crop Category");

    // Crop chips
    expect(html).toContain("All Crops");
    expect(html).toContain("Tomatoes");
    expect(html).toContain("Pepper");
    expect(html).toContain("Yam");
    expect(html).toContain("Perishable");

    // Facet selects
    expect(html).toContain("Benue LGA");
    expect(html).toContain("All LGAs (Benue)");
    expect(html).toContain("Gboko LGA");
    expect(html).toContain("Makurdi LGA");

    expect(html).toContain("Quality Grade");
    expect(html).toContain("All Grades");
    expect(html).toContain("Grade A (Premium)");
    expect(html).toContain("Grade B (Standard Market)");
    expect(html).toContain("Grade C (Processing / Bulk)");

    expect(html).toContain("Availability");
    expect(html).toContain("All Availability");
    expect(html).toContain("Available Now");
    expect(html).toContain("Upcoming Harvest");

    expect(html).toContain("Sort Order");
    expect(html).toContain("Newest First");
    expect(html).toContain("Price: Low to High");
    expect(html).toContain("Price: High to Low");
    expect(html).toContain("Quantity: High to Low");
  });

  it("renders reset button when active filters are present", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <ProduceFilterBar initialFilters={{ crop: "yam", lga: "Gboko" }} />
      </I18nProvider>,
    );

    expect(html).toContain("Reset Filters");
  });
});

