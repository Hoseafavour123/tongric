import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { OfferThreadView } from "../offer-thread-view";
import type { CommercialOfferDetailSummary } from "@/modules/orders/schemas";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("OfferThreadView UI", () => {
  const sampleOffer: CommercialOfferDetailSummary = {
    id: "off-1",
    offerCode: "OFF-202611-12345",
    listingId: "list-1",
    listingTitle: "50 Bags of Yam (Grade B)",
    cropCode: "yam",
    isPerishable: false,
    primaryPhotoUrl: null,
    buyerId: "usr_buyer_1",
    buyerName: "Agro Commercials Ltd",
    buyerPhone: "+2348011112233",
    farmerId: "usr_farmer_1",
    farmerName: "Terna Iorfa",
    farmerPhone: "+2348022223344",
    status: "PENDING",
    quantity: 20,
    unitCode: "bag",
    unitPrice: 32000,
    currency: "NGN",
    totalAmount: 640000,
    fulfillmentMode: "BUYER_ARRANGES_PICKUP",
    destinationLocation: null,
    proposedCollectionDate: "2026-11-20",
    expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    isExpired: false,
    counterRoundCount: 1,
    lastActionById: "usr_buyer_1",
    lastActionByName: "Agro Commercials Ltd",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    listingQuantity: 50,
    listingUnitPrice: 35000,
    listingMinOrderQuantity: 5,
    listingLga: "Gboko",
    listingCommunity: "Tor-Donga",
    messages: [
      {
        id: "msg-1",
        offerId: "off-1",
        senderId: "usr_buyer_1",
        senderName: "Agro Commercials Ltd",
        senderRole: "BUYER",
        action: "INITIATE",
        proposedQuantity: 20,
        proposedUnitPrice: 32000,
        note: "We can pick up 20 bags this Friday.",
        createdAt: new Date().toISOString(),
      },
    ],
  };

  it("renders offer details, terms summary, and receiver action buttons (Accept / Counter / Decline)", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OfferThreadView
          offer={sampleOffer}
          currentUserId="usr_farmer_1" // Receiver view
          currentUserRole="FARMER"
        />
      </I18nProvider>,
    );

    // Code & titles
    expect(html).toContain("OFF-202611-12345");
    expect(html).toContain("50 Bags of Yam (Grade B)");
    expect(html).toContain("Agro Commercials Ltd");
    expect(html).toContain("Terna Iorfa");

    // Terms
    expect(html).toContain("32,000");
    expect(html).toContain("640,000");
    expect(html).toContain("20 bags");
    expect(html).toContain("BUYER ARRANGES PICKUP");

    // Timeline message
    expect(html).toContain("We can pick up 20 bags this Friday.");

    // Counter round badge
    expect(html).toContain("1 / 3 rounds used");

    // Receiver actions
    expect(html).toContain("Accept Offer");
    expect(html).toContain("Propose Counter-Offer");
    expect(html).toContain("Decline Offer");
  });

  it("renders withdraw button when viewed by proposer", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OfferThreadView
          offer={sampleOffer}
          currentUserId="usr_buyer_1" // Proposer view
          currentUserRole="BUYER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Withdraw My Offer");
    expect(html).not.toContain("Accept Offer");
  });
});

