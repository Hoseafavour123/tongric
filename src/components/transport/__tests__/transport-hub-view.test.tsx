import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { TransportHubView } from "../transport-hub-view";
import { BENUE_TRANSPORT_CORRIDORS } from "@/modules/transport/corridors";
import type {
  TransportRequestSummary,
  TransporterAssignmentSummary,
  VerifiedTransporterSummary,
} from "@/modules/transport/schemas";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("TransportHubView", () => {
  const sampleRequest: TransportRequestSummary = {
    id: "ord-1",
    orderCode: "ORD-202611-98765",
    cropCode: "yam",
    quantity: 20,
    unitCode: "bag",
    estimatedWeightKg: 1000,
    listingLga: "Gboko",
    listingCommunity: "Tor-Donga",
    destinationLocation: "Makurdi North Bank",
    proposedCollectionDate: "2026-11-20",
    corridorRoute: null,
    estimatedFreightFee: null,
    farmerName: "Terna Iorfa",
    farmerPhone: "+2348022223344",
    buyerName: "Agro Commercials Ltd",
    buyerPhone: "+2348011112233",
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  };

  const sampleAssignment: TransporterAssignmentSummary = {
    ...sampleRequest,
    id: "ord-2",
    transporterId: "usr_transporter_1",
    corridorRoute: "Gboko ⇄ Makurdi",
    estimatedFreightFee: 32500,
    status: "TRANSPORT_ASSIGNED",
  };

  const sampleTransporter: VerifiedTransporterSummary = {
    id: "p-1",
    userId: "usr_transporter_1",
    operatorName: "Benue Express Haulage",
    phoneNumber: "+2348033334455",
    vehicleTypes: ["PICKUP_VAN", "LIGHT_TRUCK"],
    maxCapacityKg: 3500,
    operatingLgas: ["Gboko", "Makurdi"],
    isAvailable: true,
    pricingModel: "CORRIDOR_BASE",
    verificationStatus: "VERIFIED",
    verifiedAt: new Date().toISOString(),
    averageRating: 4.8,
    reviewCount: 15,
  };

  it("renders transporter load board with claim load action when user is transporter", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <TransportHubView
          corridors={BENUE_TRANSPORT_CORRIDORS}
          openRequests={[sampleRequest]}
          myAssignments={[sampleAssignment]}
          verifiedTransporters={[sampleTransporter]}
          isTransporter={true}
          currentUserRole="TRANSPORT_PROVIDER"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Transporter Fleet Hub");
    expect(html).toContain("Open Cargo Load Board");
    expect(html).toContain("ORD-202611-98765");
    expect(html).toContain("Claim Haulage Load");
    expect(html).toContain("Gboko");
    expect(html).toContain("Makurdi North Bank");
  });

  it("renders simplified carriage fleet directory with image, visible phone number, and capacity sorting for farmer/buyer view", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <TransportHubView
          corridors={BENUE_TRANSPORT_CORRIDORS}
          openRequests={[]}
          myAssignments={[]}
          verifiedTransporters={[sampleTransporter]}
          isTransporter={false}
          currentUserRole="BUYER"
        />
      </I18nProvider>,
    );

    // Short & simple description
    expect(html).toContain("Agricultural Logistics &amp; Transport");
    expect(html).toContain("Find verified transport carriers for farm-gate produce pickup and delivery across Benue State.");

    // Corridor rate card removed
    expect(html).not.toContain("Corridor Rate Card");
    expect(html).not.toContain("Corridor Freight Rate Estimator");

    // Fleet vehicle image & prominent phone number
    expect(html).toContain('src="/images/transport/carrier-truck.jpg"');
    expect(html).toContain("+2348033334455");

    // Sorting by maximum capacity
    expect(html).toContain("Sort Capacity:");
    expect(html).toContain("Highest Capacity (Tonnes)");
    expect(html).toContain("Lowest Capacity (Tonnes)");
  });

  it("renders verified carriers with click-to-call link", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <TransportHubView
          corridors={BENUE_TRANSPORT_CORRIDORS}
          openRequests={[]}
          myAssignments={[]}
          verifiedTransporters={[sampleTransporter]}
          isTransporter={false}
          currentUserRole="FARMER"
          initialTab="carriers"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Benue Express Haulage");
    expect(html).toContain("4.8");
    expect(html).toContain("15 reviews");
    expect(html).toContain("3,500 kg");
    expect(html).toContain('href="tel:+2348033334455"');
    expect(html).toContain("Call Carrier");
  });
});

