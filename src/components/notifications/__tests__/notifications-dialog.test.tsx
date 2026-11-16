import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { NotificationsDialog } from "../notifications-dialog";
import { I18nProvider } from "@/components/i18n/i18n-provider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("NotificationsDialog Component", () => {
  it("renders notification trigger button with accessible title in desktop header mode", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en">
        <NotificationsDialog />
      </I18nProvider>,
    );

    expect(html).toContain("Notifications");
    expect(html).toContain('aria-label="Notifications"');
    expect(html).toContain('title="Notifications"');
  });

  it("renders compact trigger button in mobile header mode", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en">
        <NotificationsDialog compact={true} />
      </I18nProvider>,
    );

    expect(html).toContain('aria-label="Notifications"');
    expect(html).toContain("h-9 w-9");
  });
});

