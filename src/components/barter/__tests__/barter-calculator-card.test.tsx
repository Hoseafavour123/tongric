import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { BarterCalculatorCard } from "../barter-calculator-card.tsx";

describe("BarterCalculatorCard Component", () => {
  it("renders calculator title and Section 19 zero-custody notice", () => {
    const html = renderToStaticMarkup(<BarterCalculatorCard />);

    expect(html).toContain("Produce Barter Ratio Calculator");
    expect(html).toContain("Section 19 Compliance Notice");
    expect(html).toContain("Non-Custodial Tool");
  });

  it("renders crop selector dropdowns and baseline calculation result", () => {
    const html = renderToStaticMarkup(<BarterCalculatorCard />);

    expect(html).toContain("Crop You Have (Offering)");
    expect(html).toContain("Crop You Need (In Return)");
    expect(html).toContain("Suggested Fair-Parity Swap");
    expect(html).toContain("Yam Tubers");
    expect(html).toContain("Soybeans");
  });
});
