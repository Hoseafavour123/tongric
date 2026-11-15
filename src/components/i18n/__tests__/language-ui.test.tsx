import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeOverview } from "@/components/home-overview";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceModeProvider } from "@/components/layout/workspace-mode-provider";
import { getDefaultDictionary } from "@/modules/i18n/base-dictionary";
import { getBundledFallbackLanguages } from "@/modules/i18n/i18n-core";
import { FirstVisitLanguagePrompt } from "../first-visit-language-prompt";
import { I18nProvider } from "../i18n-provider";
import { LanguageSwitcher } from "../language-switcher";

describe("Multilingual UI components", () => {
  it("renders FirstVisitLanguagePrompt only when no explicit locale cookie exists", () => {
    const languages = getBundledFallbackLanguages();

    const promptHtml = renderToStaticMarkup(
      <I18nProvider
        initialLocale="en"
        initialLanguages={languages}
        initialMessages={getDefaultDictionary()}
        initialHasExplicitLocale={false}
      >
        <FirstVisitLanguagePrompt />
      </I18nProvider>,
    );

    expect(promptHtml).toContain("Choose your preferred language");
    expect(promptHtml).toContain("Tiv");
    expect(promptHtml).toContain("Idoma");
    expect(promptHtml).toContain("Hausa");
    expect(promptHtml).toContain("Keep English");
    expect(promptHtml).toContain("reviewed");

    const hiddenHtml = renderToStaticMarkup(
      <I18nProvider
        initialLocale="tiv"
        initialLanguages={languages}
        initialMessages={getDefaultDictionary()}
        initialHasExplicitLocale={true}
      >
        <FirstVisitLanguagePrompt />
      </I18nProvider>,
    );

    expect(hiddenHtml).toBe("");
  });

  it("renders LanguageSwitcher trigger with active locale code and AppShell/HomeOverview translated strings", () => {
    const customMessages = {
      ...getDefaultDictionary(),
      "nav.home": "Gida",
      "home.farmerTitle": "Sayar da amfanin gona kai tsaye",
    };

    const html = renderToStaticMarkup(
      <I18nProvider
        initialLocale="ha"
        initialLanguages={getBundledFallbackLanguages()}
        initialMessages={customMessages}
        initialHasExplicitLocale={true}
      >
        <WorkspaceModeProvider>
          <AppShell>
            <LanguageSwitcher />
            <HomeOverview />
          </AppShell>
        </WorkspaceModeProvider>
      </I18nProvider>,
    );

    expect(html).toContain(">ha<");
    expect(html).toContain("Gida");
    expect(html).toContain("Sayar da amfanin gona kai tsaye");
  });
});

