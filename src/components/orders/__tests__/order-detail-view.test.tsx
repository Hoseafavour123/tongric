import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { OrderDetailView } from "../order-detail-view";
import type { OrderDetailSummary } from "@/modules/orders/schemas";

describe("OrderDetailView", () => {
  const sampleOrder: OrderDetailSummary = {
    id: "ord-1",
    orderCode: "ORD-202611-73921",
    offerId: "off-1",
    listingId: "list-1",
    listingTitle: "50 Bags of Yam",
    cropCode: "yam",
    primaryPhotoUrl: null,
    isPerishable: false,
    farmerId: "usr_farmer_1",
    farmerName: "Terna Iorfa",
    farmerPhone: "+2348022223344",
    buyerId: "usr_buyer_1",
    buyerName: "Agro Commercials Ltd",
    buyerPhone: "+2348011112233",
    quantity: 20,
    unitCode: "bag",
    estimatedWeightKg: 1000,
    unitPrice: 30000,
    currency: "NGN",
    totalAmount: 600000,
    fulfillmentMode: "BUYER_ARRANGES_PICKUP",
    destinationLocation: null,
    listingLga: "Gboko",
    listingCommunity: "Tor-Donga",
    proposedCollectionDate: "2026-11-20",
    status: "CONFIRMED",
    paymentArrangementNote:
      "Direct settlement between Buyer and Farmer; zero platform fund custody (Section 19)",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusEvents: [
      {
        id: "evt-1",
        orderId: "ord-1",
        fromStatus: null,
        toStatus: "CONFIRMED",
        changedById: "usr_farmer_1",
        changedByName: "Terna Iorfa",
        note: "Order confirmed following accepted purchase terms",
        createdAt: new Date().toISOString(),
      },
    ],
  };

  it("renders order code, status badge, financial amount, and Section 19 disclosure", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={sampleOrder}
          currentUserId="usr_buyer_1"
          currentUserRole="BUYER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("ORD-202611-73921");
    expect(html).toContain("CONFIRMED");
    expect(html).toContain("600,000");
    expect(html).toContain("Direct Settlement Disclosure (Section 19)");
    expect(html).toContain("zero customer funds and operates no escrow");
  });

  it("renders counterparty contact card with direct click-to-call link", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={sampleOrder}
          currentUserId="usr_buyer_1"
          currentUserRole="BUYER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Terna Iorfa");
    expect(html).toContain("+2348022223344");
    expect(html).toContain('href="tel:+2348022223344"');
    expect(html).toContain("Call Farmer");
  });

  it("renders order milestone timeline with initial event", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={sampleOrder}
          currentUserId="usr_farmer_1"
          currentUserRole="FARMER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Order Timeline");
    expect(html).toContain("Order confirmed following accepted purchase terms");
  });
});
