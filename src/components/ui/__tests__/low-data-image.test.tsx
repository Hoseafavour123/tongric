import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import {
  LowDataProvider,
  LowDataSwitch,
} from "@/components/layout/low-data-provider";
import { LowDataImage } from "../low-data-image";

describe("LowDataMode UI & Image deferral", () => {
  it("defers image download behind Load photo button when Low-Data Mode is active", () => {
    const deferredHtml = renderToStaticMarkup(
      <I18nProvider>
        <LowDataProvider>
          <LowDataImage
            src="/uploads/tomatoes.webp"
            alt="Fresh tomatoes"
            forceLowData
          />
        </LowDataProvider>
      </I18nProvider>,
    );

    expect(deferredHtml).not.toContain("<img");
    expect(deferredHtml).toContain("Photo hidden to save mobile data");
    expect(deferredHtml).toContain("Load photo");

    const normalHtml = renderToStaticMarkup(
      <I18nProvider>
        <LowDataProvider>
          <LowDataImage
            src="/uploads/tomatoes.webp"
            alt="Fresh tomatoes"
            forceLowData={false}
          />
        </LowDataProvider>
      </I18nProvider>,
    );

    expect(normalHtml).toContain("<img");
    expect(normalHtml).toContain('src="/uploads/tomatoes.webp"');
  });

  it("renders accessible LowDataSwitch control", () => {
    const html = renderToStaticMarkup(
      <I18nProvider>
        <LowDataProvider>
          <LowDataSwitch />
        </LowDataProvider>
      </I18nProvider>,
    );

    expect(html).toContain('role="switch"');
    expect(html).toContain("Low-Data Mode");
  });
});

