import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CarrierReviewDialog } from "../carrier-review-dialog";

describe("CarrierReviewDialog", () => {
  it("renders carrier review dialog with 5-star selector and structured badges", () => {
    const html = renderToStaticMarkup(
      <CarrierReviewDialog
        open={true}
        onClose={() => {}}
        orderId="ord-1"
        orderCode="ORD-202611-12345"
        transporterName="Terlumun Logistics"
      />,
    );

    expect(html).toContain("Rate Carrier Haulage Service");
    expect(html).toContain("ORD-202611-12345");
    expect(html).toContain("Terlumun Logistics");
    expect(html).toContain("Overall Carrier Rating");
    expect(html).toContain("Timeliness &amp; Punctuality");
    expect(html).toContain("Cargo Care &amp; Packaging Preservation");
    expect(html).toContain("Communication &amp; Corridor Updates");
    expect(html).toContain("Review Remarks (Optional)");
    expect(html).toContain("Submit Carrier Review");
  });

  it("returns null when open is false", () => {
    const html = renderToStaticMarkup(
      <CarrierReviewDialog
        open={false}
        onClose={() => {}}
        orderId="ord-1"
        orderCode="ORD-202611-12345"
        transporterName="Terlumun Logistics"
      />,
    );

    expect(html).toBe("");
  });
});

