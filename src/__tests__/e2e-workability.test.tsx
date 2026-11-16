import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { AppShell } from "@/components/layout/app-shell";
import { HomeOverview } from "@/components/home-overview";
import { WaybillView } from "@/components/orders/waybill-view";
import { CarrierReviewDialog } from "@/components/transport/carrier-review-dialog";
import { TransportHubView } from "@/components/transport/transport-hub-view";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { BarterFeedView } from "@/components/barter/barter-feed-view";
import { BarterAgreementView } from "@/components/barter/barter-agreement-view";
import { FinanceHubView } from "@/components/finance/finance-hub-view";
import { LoanApplicationDetailView } from "@/components/finance/loan-application-detail-view";
import { AdminNavBar } from "@/components/admin/admin-nav-bar";
import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { BENUE_TRANSPORT_CORRIDORS } from "@/modules/transport/corridors";
import type { OrderDetailSummary, WaybillSummary } from "@/modules/orders/schemas";
import type { CarrierReviewSummary, VerifiedTransporterSummary } from "@/modules/transport/schemas";
import type { ExchangeAgreementSummary, ExchangeListingSummary } from "@/modules/barter/schemas";
import { DEFAULT_FINANCING_PRODUCTS, type LoanApplicationSummary } from "@/modules/finance/schemas";
import FinancePage from "@/app/finance/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Tongric MVP — Comprehensive System Workability Verification", () => {
  it("verifies AppShell navigation renders all 5 active navigation tabs without muted or disabled links", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <AppShell>
          <div>Main Content Area</div>
        </AppShell>
      </I18nProvider>,
    );

    // Primary desktop & mobile navigation links must be present and active
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/market"');
    expect(html).toContain('href="/orders"');
    expect(html).toContain('href="/transport"');
    expect(html).toContain('href="/finance"');

    // Sub-navbar secondary tabs beneath navbar
    expect(html).toContain('href="/profile"');
    expect(html).toContain('href="/profile/verify"');
    expect(html).toContain('href="/exchange"');

    // No navigation item should be disabled
    expect(html).not.toContain('aria-disabled="true"');
  });

  it("verifies HomeOverview renders the current agricultural commerce and logistics flow", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <HomeOverview />
      </I18nProvider>,
    );

    // Flow shortcuts, crops, and visual cards
    expect(html).toContain("/market");
    expect(html).toContain("Benue State Agricultural Produce");
    expect(html).toContain("White Yam (Zaki-Biam)");
    expect(html).toContain("crop=yam");
    expect(html).toContain("farmer-hero");
  });

  it("verifies FinancePage displays single cooperative credit product without direct settlement notice", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <FinancePage />
      </I18nProvider>,
    );

    expect(html).toContain("Agricultural Finance &amp; Credit");
    expect(html).toContain("Accredited cooperative lending directory");
    expect(html).not.toContain("Direct Settlement Notice (No Platform Custody)");
    expect(html).toContain("Cooperative Facility");
    expect(html).toContain("Apply with Cooperative");
  });

  it("verifies WaybillView displays official dispatch waybill with party cards, pins, and legal notice", () => {
    const sampleWaybill: WaybillSummary = {
      waybillNumber: "WB-202611-94820",
      orderId: "ord-test-1",
      orderCode: "ORD-202611-12345",
      cropCode: "yam",
      quantity: 50,
      unitCode: "bag",
      estimatedWeightKg: 2500,
      totalAmount: 1500000,
      currency: "NGN",
      corridorRoute: "Gboko ⇄ Makurdi",
      estimatedFreightFee: 45000,
      pickupLga: "Gboko",
      pickupCommunity: "Tor-Donga",
      destinationLocation: "Makurdi North Bank",
      farmerName: "Terna Iorfa",
      farmerPhone: "+2348022223344",
      buyerName: "Agro Processors Ltd",
      buyerPhone: "+2348011112233",
      transporterName: "Benue Express Logistics",
      transporterPhone: "+2348033334455",
      status: "IN_TRANSIT",
      pickupVerifiedAt: new Date().toISOString(),
      deliveryVerifiedAt: null,
      createdAt: new Date().toISOString(),
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <WaybillView waybill={sampleWaybill} />
      </I18nProvider>,
    );

    expect(html).toContain("WB-202611-94820");
    expect(html).toContain("ORD-202611-12345");
    expect(html).toContain("Gboko ⇄ Makurdi");
    expect(html).toContain("Terna Iorfa");
    expect(html).toContain("Agro Processors Ltd");
    expect(html).toContain("Benue Express Logistics");
    expect(html).toContain("2.50 MT (2,500 kg)");
    expect(html).toContain("Section 19 Platform Non-Custody Notice");
  });

  it("verifies CarrierReviewDialog renders composite 5-star rating and performance badges", () => {
    const html = renderToStaticMarkup(
      <CarrierReviewDialog
        open={true}
        onClose={() => {}}
        orderId="ord-test-1"
        orderCode="ORD-202611-12345"
        transporterName="Benue Express Logistics"
      />,
    );

    expect(html).toContain("Rate Carrier Haulage Service");
    expect(html).toContain("Benue Express Logistics");
    expect(html).toContain("Overall Carrier Rating");
    expect(html).toContain("Timeliness &amp; Punctuality");
    expect(html).toContain("Cargo Care &amp; Packaging Preservation");
    expect(html).toContain("Communication &amp; Corridor Updates");
    expect(html).toContain("Submit Carrier Review");
  });

  it("verifies TransportHubView renders load board and verified carriers directory with ratings", () => {
    const carrier: VerifiedTransporterSummary = {
      id: "carrier-1",
      userId: "usr-carrier-1",
      operatorName: "Gboko Transit Fleet",
      phoneNumber: "+2348033334455",
      vehicleTypes: ["LIGHT_TRUCK"],
      maxCapacityKg: 5000,
      operatingLgas: ["Gboko", "Makurdi"],
      isAvailable: true,
      pricingModel: "CORRIDOR_BASE",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date().toISOString(),
      averageRating: 4.9,
      reviewCount: 22,
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <TransportHubView
          corridors={BENUE_TRANSPORT_CORRIDORS}
          openRequests={[]}
          myAssignments={[]}
          verifiedTransporters={[carrier]}
          isTransporter={false}
          currentUserRole="BUYER"
          initialTab="carriers"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Gboko Transit Fleet");
    expect(html).toContain("4.9");
    expect(html).toContain("22 reviews");
    expect(html).toContain("Call Carrier");
  });

  it("verifies OrderDetailView renders post-trade carrier review when fulfilled", () => {
    const sampleOrder: OrderDetailSummary = {
      id: "ord-test-1",
      orderCode: "ORD-202611-12345",
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
      quantity: 50,
      unitCode: "bag",
      estimatedWeightKg: 2500,
      unitPrice: 30000,
      currency: "NGN",
      totalAmount: 1500000,
      fulfillmentMode: "TONGRIC_LOGISTICS_REQUEST",
      destinationLocation: "Makurdi",
      listingLga: "Gboko",
      proposedCollectionDate: "2026-11-20",
      status: "COMPLETED",
      paymentArrangementNote: null,
      transporterId: "usr_carrier_1",
      transporterName: "Benue Express Logistics",
      transporterPhone: "+2348033334455",
      pickupVerifiedAt: new Date().toISOString(),
      deliveryVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusEvents: [],
    };

    const sampleReview: CarrierReviewSummary = {
      id: "rev-1",
      orderId: "ord-test-1",
      orderCode: "ORD-202611-12345",
      transporterId: "usr_carrier_1",
      reviewerId: "usr_buyer_1",
      reviewerName: "Agro Commercials Ltd",
      reviewerRole: "BUYER",
      rating: 5,
      timelinessScore: 5,
      cargoCareScore: 5,
      communicationScore: 5,
      comment: "Punctual delivery, covered with waterproof tarp.",
      createdAt: new Date().toISOString(),
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <OrderDetailView
          order={sampleOrder}
          currentUserId="usr_buyer_1"
          currentUserRole="BUYER"
          initialCarrierReview={sampleReview}
        />
      </I18nProvider>,
    );

    expect(html).toContain("Carrier Haulage Review");
    expect(html).toContain("VERIFIED REVIEW");
    expect(html).toContain("5.0 / 5");
    expect(html).toContain("Punctual delivery, covered with waterproof tarp.");
  });

  it("verifies BarterFeedView renders farmer-to-farmer barter listings, filters, and parity calculator", () => {
    const sampleListing: ExchangeListingSummary = {
      id: "barter-1",
      ownerFarmerId: "usr-farmer-1",
      ownerFarmerName: "Terna Aondover",
      ownerFarmerPhone: "+2348011111111",
      offeredItemType: "CROP",
      offeredCropId: "yam",
      offeredTitle: "100 Tubers of Zaki-Biam White Yam",
      offeredDescription: "Selected clean tubers ready for dry season seed planting.",
      offeredQty: 100,
      offeredUnit: "unit",
      desiredDescription: "Seeking 3 Bags of Soybeans",
      desiredQty: 3,
      desiredUnit: "bag",
      locationLga: "Gboko",
      status: "OPEN",
      offersCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <BarterFeedView initialListings={[sampleListing]} />
      </I18nProvider>,
    );

    expect(html).toContain("100 Tubers of Zaki-Biam White Yam");
    expect(html).toContain("Terna Aondover");
    expect(html).toContain("Gboko");
    expect(html).toContain("Seeking 3 Bags of Soybeans");
    expect(html).toContain("View Listing &amp; Swap Offers");
    expect(html).toContain("disabled");
  });

  it("verifies BarterAgreementView renders dual-party confirmation workflow and logistics links", () => {
    const sampleAgreement: ExchangeAgreementSummary = {
      id: "barter-agree-1",
      listingId: "barter-1",
      listingTitle: "100 Tubers of Zaki-Biam White Yam",
      offerId: "barter-off-1",
      farmerAId: "usr-farmer-1",
      farmerAName: "Terna Aondover",
      farmerAPhone: "+2348011111111",
      farmerBId: "usr-farmer-2",
      farmerBName: "Abeje Ochanya",
      farmerBPhone: "+2348012223344",
      termsSummary: "Swap 100 tubers of White Yam for 3 Bags of Soybeans at Wannune Junction.",
      farmerAConfirmedAt: new Date().toISOString(),
      farmerBConfirmedAt: null,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <BarterAgreementView agreement={sampleAgreement} />
      </I18nProvider>,
    );

    expect(html).toContain("Barter Trade Agreement");
    expect(html).toContain("Party A (Listing Owner)");
    expect(html).toContain("Terna Aondover");
    expect(html).toContain("Party B (Offer Proposer)");
    expect(html).toContain("Abeje Ochanya");
    expect(html).toContain("Swap 100 tubers of White Yam for 3 Bags of Soybeans");
    expect(html).toContain("Confirmed on");
    expect(html).toContain("Awaiting fulfillment confirmation");
    expect(html).toContain("Need Haulage? Book a Transporter");
  });

  it("verifies FinanceHubView renders single cooperative product with muted apply button and hidden barter/credit score tabs", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <FinanceHubView
          products={DEFAULT_FINANCING_PRODUCTS}
          initialApplications={[]}
          hideHeader={false}
        />
      </I18nProvider>,
    );

    expect(html).toContain("Cooperative Financing");
    expect(html).toContain("Benue Agricultural Development Corporation (BADC)");
    // Only 1 product listed
    expect(html).not.toContain("Benue Investment &amp; Property Company (BIPC Micro-Credit)");
    // Credit readiness & produce barter hidden
    expect(html).not.toContain("Credit Score Readiness");
    expect(html).not.toContain("Produce Barter");
    // Muted apply button present
    expect(html).toContain("Apply with Cooperative");
  });

  it("verifies LoanApplicationDetailView renders immutable transaction snapshot and partner underwriting progress", () => {
    const sampleApplication: LoanApplicationSummary = {
      id: "loan-1",
      referenceCode: "LN-202611-00421",
      farmerId: "usr-farmer-1",
      farmerName: "Terna Aondover",
      farmerPhone: "+2348011111111",
      productId: "prod-badc-1",
      productTitle: "Seasonal Grain & Tuber Working Capital Facility",
      partnerName: "Benue Agricultural Development Corporation (BADC)",
      requestedAmountNgn: 100000,
      purpose: "Procurement of organic fertilizer and weeding labor for dry-season yam ridge preparation.",
      consentRecordId: "consent-1",
      transactionSummarySnapshot: {
        completedOrdersCount: 2,
        totalSalesVolumeNgn: 350000,
        averageOrderNgn: 175000,
        activeListingsCount: 3,
        kycStatus: "VERIFIED",
        farmerFullName: "Terna Aondover",
        locationLga: "Gboko",
        tenureDays: 45,
        estimatedCreditScore: 75,
        recommendedTier: "Tier 2 (₦150,000 max)",
        generatedAt: new Date().toISOString(),
      },
      documentKeys: ["NATIONAL_ID", "COOPERATIVE_LETTER"],
      status: "UNDER_PARTNER_REVIEW",
      partnerNote: "BADC Makurdi credit officer verified cooperative endorsement letter.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <LoanApplicationDetailView application={sampleApplication} />
      </I18nProvider>,
    );

    expect(html).toContain("LN-202611-00421");
    expect(html).toContain("100,000");
    expect(html).toContain("Benue Agricultural Development Corporation (BADC)");
    expect(html).toContain("Under Review");
    expect(html).toContain("Verified Commercial Snapshot (Consented under NDPA 2023)");
    expect(html).toContain("Tier 2 (₦150,000 max)");
    expect(html).toContain("BADC Makurdi credit officer verified cooperative endorsement letter.");
  });

  it("verifies AdminNavBar and AdminAccessGate render RBAC controls and verification tabs", () => {
    const gateHtml = renderToStaticMarkup(
      <AdminAccessGate currentRole="FARMER" fullName="Terna Aondover" />,
    );
    expect(gateHtml).toContain("Admin Verification Queue");
    expect(gateHtml).toContain("Enable Admin Role &amp; Open Verification Queue");
    expect(gateHtml).toContain("FARMER");

    const navHtml = renderToStaticMarkup(
      <AdminNavBar
        activeTab="finance"
        pendingVerificationsCount={3}
        activeDisputesCount={1}
        loanApplicationsCount={5}
      />,
    );
    expect(navHtml).toContain("/admin/verifications");
    expect(navHtml).toContain("/admin/finance");
    expect(navHtml).toContain("Cooperative Loans");
    expect(navHtml).toContain("5");
  });

  it("verifies multilingual layout stability across all 4 pilot languages without crashing or layout disruption", () => {
    const pilotLanguages: ("en" | "tiv" | "ido" | "ha")[] = ["en", "tiv", "ido", "ha"];

    for (const locale of pilotLanguages) {
      const html = renderToStaticMarkup(
        <I18nProvider initialLocale={locale} initialHasExplicitLocale>
          <AppShell>
            <HomeOverview />
          </AppShell>
        </I18nProvider>,
      );

      // Verify basic shell integrity
      expect(html).toContain('href="/market"');
      expect(html).toContain('href="/orders"');
      expect(html).toContain('href="/transport"');
      expect(html).toContain('href="/finance"');
      expect(html).not.toContain("undefined");
    }
  });
});
