import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { OffersListView } from "../offers-list-view";
import type { CommercialOfferSummary } from "@/modules/orders/schemas";

describe("OffersListView UI", () => {
  const sampleOffers: CommercialOfferSummary[] = [
    {
      id: "off-1",
      offerCode: "OFF-202611-12345",
      listingId: "list-1",
      listingTitle: "50 Bags of Yam (Grade B)",
      cropCode: "yam",
      buyerId: "usr_buyer_1",
      buyerName: "Agro Commercials Ltd",
      farmerId: "usr_farmer_1",
      farmerName: "Terna Iorfa",
      status: "PENDING",
      quantity: 20,
      unitCode: "bag",
      unitPrice: 32000,
      currency: "NGN",
      totalAmount: 640000,
      fulfillmentMode: "BUYER_ARRANGES_PICKUP",
      destinationLocation: null,
      proposedCollectionDate: null,
      expiresAt: "2026-11-20T12:00:00.000Z",
      isExpired: false,
      counterRoundCount: 0,
      lastActionById: "usr_buyer_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it("renders active negotiations list with offer codes, amounts, and badges", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OffersListView offers={sampleOffers} currentUserId="usr_farmer_1" />
      </I18nProvider>,
    );

    // Tabs
    expect(html).toContain("Active Negotiations (1)");
    expect(html).toContain("Past &amp; Closed (0)");

    // Offer card
    expect(html).toContain("OFF-202611-12345");
    expect(html).toContain("50 Bags of Yam (Grade B)");
    expect(html).toContain("640,000");
    expect(html).toContain("20 bags");
    expect(html).toContain("32,000");
    expect(html).toContain("Your Action Needed");
    expect(html).toContain("View Negotiation");
  });

  it("renders confirmed orders tab when orders are present", () => {
    const sampleOrders = [
      {
        id: "ord-1",
        orderCode: "ORD-202611-73921",
        offerId: "off-1",
        listingId: "list-1",
        listingTitle: "50 Bags of Yam (Grade B)",
        cropCode: "yam",
        farmerId: "usr_farmer_1",
        farmerName: "Terna Iorfa",
        buyerId: "usr_buyer_1",
        buyerName: "Agro Commercials Ltd",
        quantity: 20,
        unitCode: "bag",
        estimatedWeightKg: 1000,
        unitPrice: 30000,
        currency: "NGN",
        totalAmount: 600000,
        fulfillmentMode: "BUYER_ARRANGES_PICKUP" as const,
        destinationLocation: null,
        proposedCollectionDate: null,
        status: "CONFIRMED" as const,
        paymentArrangementNote: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OffersListView
          offers={sampleOffers}
          orders={sampleOrders}
          currentUserId="usr_farmer_1"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Confirmed Orders (1)");
    expect(html).toContain("ORD-202611-73921");
    expect(html).toContain("CONFIRMED");
    expect(html).toContain("600,000");
    expect(html).toContain("View Contract");
  });

  it("renders empty state when no offers or orders are available", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OffersListView offers={[]} orders={[]} currentUserId="usr_farmer_1" />
      </I18nProvider>,
    );

    expect(html).toContain("No confirmed orders yet");
    expect(html).toContain("Browse Produce Market");
  });
});

