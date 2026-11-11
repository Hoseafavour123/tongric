import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import OfflinePage from "@/app/offline/page";
import { NetworkStatusBanner } from "@/components/layout/network-status-banner";

describe("Connectivity resilience UI & Service Worker", () => {
  it("renders offline and reconnected states on NetworkStatusBanner", () => {
    expect(
      renderToStaticMarkup(<NetworkStatusBanner forcedState="online" />),
    ).toBe("");

    const offlineHtml = renderToStaticMarkup(
      <NetworkStatusBanner forcedState="offline" />,
    );
    expect(offlineHtml).toContain("No internet connection");

    const backOnlineHtml = renderToStaticMarkup(
      <NetworkStatusBanner forcedState="reconnected" />,
    );
    expect(backOnlineHtml).toContain("Back online");
  });

  it("renders the /offline fallback page with a retry button", () => {
    const html = renderToStaticMarkup(<OfflinePage />);
    expect(html).toContain("You are currently offline");
    expect(html).toContain("Try Again");
  });

  it("configures public/sw.js to cache /offline while strictly bypassing /api/", () => {
    const sw = fs.readFileSync(
      path.resolve("c:/Users/USER/Desktop/tongric/public/sw.js"),
      "utf8",
    );
    expect(sw).toContain("/offline");
    expect(sw).toContain('request.mode === "navigate"');
    expect(sw).toContain('url.pathname.startsWith("/api/")');
  });
});

