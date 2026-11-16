import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminNavBar } from "../admin-nav-bar";
import { AdminDashboardView } from "../admin-dashboard-view";
import { AdminUsersView } from "../admin-users-view";
import { AdminDisputesView } from "../admin-disputes-view";
import { I18nProvider } from "@/components/i18n/i18n-provider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Admin Console UI Views", () => {
  it("renders AdminNavBar with all 5 functional section tabs and badges", () => {
    const html = renderToStaticMarkup(
      <AdminNavBar
        activeTab="overview"
        pendingVerificationsCount={3}
        activeDisputesCount={1}
      />,
    );

    expect(html).toContain("Overview");
    expect(html).toContain("Users");
    expect(html).toContain("Disputes");
    expect(html).toContain("Verifications");
    expect(html).toContain("Audit Trail");
    expect(html).toContain("3"); // Pending verification badge
    expect(html).toContain("1"); // Active dispute badge
  });

  it("renders AdminDashboardView with metrics grid and direct action links", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en">
        <AdminDashboardView
          metrics={{
            totalUsers: 120,
            activeFarmers: 60,
            activeBuyers: 40,
            activeTransporters: 20,
            pendingVerifications: 4,
            activeDisputes: 2,
            totalOrders: 85,
            totalAuditLogs: 450,
          }}
        />
      </I18nProvider>,
    );

    expect(html).toContain("Platform Administration Console");
    expect(html).toContain("Total Registered");
    expect(html).toContain("120");
    expect(html).toContain("Active Farmers");
    expect(html).toContain("60");
    expect(html).toContain("Pending Verifications");
    expect(html).toContain("4");
    expect(html).toContain("Active Disputes");
    expect(html).toContain("2");
    expect(html).toContain("Participant Management");
    expect(html).toContain("Dispute Arbitration");
  });

  it("renders AdminUsersView with participant cards and filter form", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en">
        <AdminUsersView
          initialUsers={[
            {
              id: "usr-1",
              fullName: "Aondona Iorfa",
              phoneNumber: "+2348011111111",
              email: null,
              role: "FARMER",
              accountStatus: "ACTIVE",
              preferredLanguageCode: "tiv",
              createdAt: "2026-11-10T00:00:00.000Z",
              lastLoginAt: null,
              assistedByUserName: null,
              verificationStatus: "VERIFIED",
              listingsCount: 4,
              ordersCount: 2,
            },
          ]}
          totalCount={1}
        />
      </I18nProvider>,
    );

    expect(html).toContain("Participant Management");
    expect(html).toContain("Aondona Iorfa");
    expect(html).toContain("+2348011111111");
    expect(html).toContain("Farmer");
    expect(html).toContain("Active");
    expect(html).toContain("KYC Verified");
    expect(html).toContain("Restrict Access");
  });

  it("renders AdminDisputesView with contested order card and parties", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en">
        <AdminDisputesView
          initialDisputes={[
            {
              id: "ord-1",
              orderCode: "ORD-202611-12345",
              cropCode: "YAM",
              quantity: 100,
              unitCode: "TUBER",
              totalAmount: 50000,
              status: "DISPUTED",
              disputeReason: "Farmer claims buyer did not provide payment as arranged.",
              disputedAt: "2026-11-16T00:00:00.000Z",
              farmer: {
                id: "f-1",
                fullName: "Aondona Iorfa",
                phoneNumber: "+2348011111111",
              },
              buyer: {
                id: "b-1",
                fullName: "Terzungwe Stores",
                phoneNumber: "+2348022222222",
              },
              transporter: {
                id: "t-1",
                fullName: "Terlumun Logistics",
                phoneNumber: "+2348033333333",
              },
              createdAt: "2026-11-15T00:00:00.000Z",
            },
          ]}
        />
      </I18nProvider>,
    );

    expect(html).toContain("Dispute Mediation Queue");
    expect(html).toContain("ORD-202611-12345");
    expect(html).toContain("₦50,000");
    expect(html).toContain("Farmer claims buyer did not provide payment as arranged.");
    expect(html).toContain("Aondona Iorfa");
    expect(html).toContain("Terzungwe Stores");
    expect(html).toContain("Terlumun Logistics");
    expect(html).toContain("Arbitrate &amp; Resolve Dispute");
  });
});

