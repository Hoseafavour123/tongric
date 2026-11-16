import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { OrderDetailView } from "../order-detail-view";
import type { OrderDetailSummary } from "@/modules/orders/schemas";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

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

  it("renders pre-collection cancel order and dispute action buttons when CONFIRMED", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={sampleOrder}
          currentUserId="usr_buyer_1"
          currentUserRole="BUYER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Cancel Order");
    expect(html).toContain("Report Dispute");
    expect(html).toContain("Order Lifecycle Actions");
  });

  it("renders farmer collection action button when CONFIRMED", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={sampleOrder}
          currentUserId="usr_farmer_1"
          currentUserRole="FARMER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Confirm Produce Collected");
  });

  it("renders cancelled alert banner and inventory restored notice", () => {
    const cancelledOrder: OrderDetailSummary = {
      ...sampleOrder,
      status: "CANCELLED",
      cancellationReason: "Inspection discrepancy at farm gate",
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={cancelledOrder}
          currentUserId="usr_buyer_1"
          currentUserRole="BUYER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Order Cancelled Prior to Collection");
    expect(html).toContain("Inspection discrepancy at farm gate");
    expect(html).toContain("safely restored to the farmer&#x27;s active marketplace listing");
  });

  it("renders dispute alert banner when order is DISPUTED", () => {
    const disputedOrder: OrderDetailSummary = {
      ...sampleOrder,
      status: "DISPUTED",
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={disputedOrder}
          currentUserId="usr_buyer_1"
          currentUserRole="BUYER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Under Active Dispute Review");
    expect(html).toContain("Both parties will be contacted via registered phone");
  });

  it("renders Farmer Pickup PIN card when viewed by farmer", () => {
    const orderWithPins: OrderDetailSummary = {
      ...sampleOrder,
      pickupPin: "4829",
      deliveryPin: "7193",
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={orderWithPins}
          currentUserId="usr_farmer_1"
          currentUserRole="FARMER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Pickup PIN (Farm Gate)");
    expect(html).toContain("4829");
    expect(html).toContain("Dispatch Waybill");
  });

  it("renders Buyer Delivery PIN card when viewed by buyer", () => {
    const orderWithPins: OrderDetailSummary = {
      ...sampleOrder,
      pickupPin: "4829",
      deliveryPin: "7193",
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={orderWithPins}
          currentUserId="usr_buyer_1"
          currentUserRole="BUYER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Delivery PIN (Dropoff)");
    expect(html).toContain("7193");
  });

  it("renders carrier PIN verification button for transporter", () => {
    const orderForCarrier: OrderDetailSummary = {
      ...sampleOrder,
      pickupPin: "4829",
      deliveryPin: "7193",
      transporterId: "usr_carrier_1",
      status: "TRANSPORT_ASSIGNED",
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={orderForCarrier}
          currentUserId="usr_carrier_1"
          currentUserRole="TRANSPORTER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Verify Farm-Gate Pickup (Enter PIN)");
  });

  it("renders carrier review prompt button when order is DELIVERED and unreviewed", () => {
    const deliveredOrder: OrderDetailSummary = {
      ...sampleOrder,
      status: "DELIVERED",
      transporterId: "usr_carrier_1",
      transporterName: "Terlumun Logistics",
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={deliveredOrder}
          currentUserId="usr_buyer_1"
          currentUserRole="BUYER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Carrier Haulage Review");
    expect(html).toContain("PENDING FEEDBACK");
    expect(html).toContain("Rate Transporter Haulage");
  });

  it("renders verified carrier review card when initialCarrierReview is provided", () => {
    const completedOrder: OrderDetailSummary = {
      ...sampleOrder,
      status: "COMPLETED",
      transporterId: "usr_carrier_1",
      transporterName: "Terlumun Logistics",
    };

    const review = {
      id: "rev-1",
      orderId: "ord-1",
      orderCode: "ORD-202611-73921",
      transporterId: "usr_carrier_1",
      reviewerId: "usr_buyer_1",
      reviewerName: "Agro Commercials Ltd",
      reviewerRole: "BUYER",
      rating: 5,
      timelinessScore: 5,
      cargoCareScore: 5,
      communicationScore: 4,
      comment: "Prompt arrival and carefully covered produce.",
      createdAt: new Date().toISOString(),
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={completedOrder}
          currentUserId="usr_buyer_1"
          currentUserRole="BUYER"
          initialCarrierReview={review}
        />
      </I18nProvider>,
    );

    expect(html).toContain("Carrier Haulage Review");
    expect(html).toContain("VERIFIED REVIEW");
    expect(html).toContain("5.0 / 5");
    expect(html).toContain("Prompt arrival and carefully covered produce.");
    expect(html).toContain("Timeliness");
    expect(html).toContain("Cargo Care");
    expect(html).toContain("Communication");
  });
});
