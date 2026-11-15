import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { AccountOverviewView } from "../account-overview-view";
import { LoginFormView } from "../login-form-view";
import { RecoverFormView } from "../recover-form-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Login, Recovery & Account UI Components", () => {
  it("renders LoginFormView with accessible phone, password, and recovery links", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <LoginFormView />
      </I18nProvider>,
    );

    expect(html).toContain("Log in to Tongric");
    expect(html).toContain("Nigerian phone number");
    expect(html).toContain("Forgot password?");
    expect(html).toContain('href="/recover"');
    expect(html).toContain("Don&#x27;t have an account? Register");
    expect(html).toContain('href="/register"');
  });

  it("renders RecoverFormView with recovery code input and reset CTA", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <RecoverFormView />
      </I18nProvider>,
    );

    expect(html).toContain("Reset your password");
    expect(html).toContain("Recovery code");
    expect(html).toContain("New password");
    expect(html).toContain("Confirm new password");
    expect(html).toContain("Reset password");
    expect(html).toContain('href="/login"');
  });

  it("renders AccountOverviewView for authenticated user with role badge and logout", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <AccountOverviewView
          initialUser={{
            id: "usr_100",
            fullName: "Aondona Tersoo",
            phoneNumber: "+2348031234567",
            email: "aondona@example.com",
            role: "FARMER",
            accountStatus: "ACTIVE",
            preferredLanguageCode: "tiv",
            createdAt: "2026-11-11T12:00:00.000Z",
          }}
        />
      </I18nProvider>,
    );

    expect(html).toContain("Aondona Tersoo");
    expect(html).toContain("FARMER");
    expect(html).toContain("Active");
    expect(html).toContain("0803 123 4567");
    expect(html).toContain("aondona@example.com");
    expect(html).toContain("tiv");
    expect(html).toContain("Log out");
    expect(html).toContain('href="/privacy"');
  });

  it("renders AccountOverviewView for unauthenticated visitor with direct login CTA", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <AccountOverviewView initialUser={null} />
      </I18nProvider>,
    );

    expect(html).toContain("Sign in required");
    expect(html).toContain('href="/login"');
    expect(html).toContain('href="/register"');
  });
});

