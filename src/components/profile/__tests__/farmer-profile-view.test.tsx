import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { FarmerProfileView } from "../farmer-profile-view";
import type { FarmerProfileSummary } from "@/modules/profile";

describe("FarmerProfileView UI", () => {
  it("renders empty farm profile form with all Benue LGAs and crop choices", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <FarmerProfileView initialProfile={null} />
      </I18nProvider>,
    );

    expect(html).toContain("Farm Profile");
    expect(html).toContain("Tell buyers and drivers where your farm is located");
    expect(html).toContain("Benue State (Pilot Region)");
    expect(html).toContain("Incomplete");
    expect(html).toContain("Unverified");

    // Check presence of key Benue LGAs in dropdown
    expect(html).toContain("Gboko");
    expect(html).toContain("Makurdi");
    expect(html).toContain("Katsina-Ala");
    expect(html).toContain("Otukpo");
    expect(html).toContain("Vandeikya");

    // Check crop catalog items
    expect(html).toContain("Yam");
    expect(html).toContain("Cassava");
    expect(html).toContain("Tomatoes");
    expect(html).toContain("Soybeans");

    // Form inputs & CTAs
    expect(html).toContain("Town, Village, or Community");
    expect(html).toContain("Cooperative or Farmers Group (Optional)");
    expect(html).toContain("Approximate Farm Size in Hectares (Optional)");
    expect(html).toContain("Save Farm Profile");
    expect(html).toContain("Back to Account");
  });

  it("renders populated profile with Complete badge and pre-filled fields", () => {
    const mockProfile: FarmerProfileSummary = {
      id: "prf_123",
      userId: "usr_456",
      state: "Benue",
      lga: "gboko",
      community: "Tse-Agber",
      primaryCrops: ["yam", "soybeans"],
      cooperativeName: "Gboko Producers Union",
      farmSizeHectares: 4.5,
      verificationStatus: "UNVERIFIED",
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isComplete: true,
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <FarmerProfileView initialProfile={mockProfile} />
      </I18nProvider>,
    );

    expect(html).toContain("Complete");
    expect(html).toContain("Tse-Agber");
    expect(html).toContain("Gboko Producers Union");
    expect(html).toContain('value="4.5"');
  });
});
