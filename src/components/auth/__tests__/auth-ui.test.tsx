import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { PrivacyNoticeView } from "../privacy-notice-view";
import { RegisterFormView } from "../register-form-view";

describe("Registration & NDPA Privacy UI", () => {
  it("renders RegisterFormView with Farmer/Buyer/Transport Provider roles and NDPA checkboxes without Admin option", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <RegisterFormView />
      </I18nProvider>,
    );

    expect(html).toContain("Create your Tongric account");
    expect(html).toContain("Farmer");
    expect(html).toContain("Buyer");
    expect(html).toContain("Transport Provider");
    expect(html).not.toContain('value="ADMIN"');
    expect(html).toContain("Nigerian phone number");
    expect(html).toContain("Email address (optional)");
    expect(html).toContain("NDPA 2023");
    expect(html).toContain('href="/privacy"');
    expect(html).toContain("Create account");
  });

  it("renders PrivacyNoticeView with plain-language NDPA sections and policy version", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <PrivacyNoticeView />
      </I18nProvider>,
    );

    expect(html).toContain("Tongric Privacy Notice (NDPA 2023)");
    expect(html).toContain("2026-11-v1");
    expect(html).toContain("1. What information we collect");
    expect(html).toContain("3. Security, storage &amp; your rights");
    expect(html).toContain('href="/register"');
  });
});

