import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { parseWorkspaceMode } from "@/lib/workspace-mode";
import { AppShell } from "../app-shell";
import { WorkspaceModeProvider } from "../workspace-mode-provider";

describe("AppShell navigation", () => {
  it("renders the 5 mobile bottom tabs (Home, Market, Orders, Transport, Finance) plus header Farmer/Buyer switch and Account slot", () => {
    const html = renderToStaticMarkup(
      <WorkspaceModeProvider>
        <AppShell activeSection="home">
          <div>Main Body</div>
        </AppShell>
      </WorkspaceModeProvider>,
    );

    expect(html).toContain("Mobile sections");
    expect(html).toContain("Home");
    expect(html).toContain("Market");
    expect(html).toContain("Orders");
    expect(html).toContain("Transport");
    expect(html).toContain("Finance");
    expect(html).toContain("Workspace view mode");
    expect(html).toContain("Farmer");
    expect(html).toContain("Buyer");
    expect(html).toContain("Account");
    expect(html).toContain("Main Body");
  });

  it("parses workspace view mode safely", () => {
    expect(parseWorkspaceMode("buyer")).toBe("buyer");
    expect(parseWorkspaceMode("farmer")).toBe("farmer");
    expect(parseWorkspaceMode("admin")).toBe("farmer");
    expect(parseWorkspaceMode(null)).toBe("farmer");
  });
});

