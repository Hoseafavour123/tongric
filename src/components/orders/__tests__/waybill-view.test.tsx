import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WaybillView } from "../waybill-view";
import type { WaybillSummary } from "@/modules/orders/schemas";

describe("WaybillView", () => {
  const sampleWaybill: WaybillSummary = {
    waybillNumber: "WB-202611-73921",
    orderId: "ord-1",
    orderCode: "ORD-202611-73921",
    cropCode: "yam",
    quantity: 20,
    unitCode: "bag",
    estimatedWeightKg: 1000,
    totalAmount: 600000,
    currency: "NGN",
    corridorRoute: "Gboko ⇄ Makurdi",
    estimatedFreightFee: 45000,
    pickupLga: "Gboko",
    pickupCommunity: "Tor-Donga",
    destinationLocation: "Makurdi Modern Market",
    farmerName: "Terna Iorfa",
    farmerPhone: "+2348022223344",
    buyerName: "Agro Commercials Ltd",
    buyerPhone: "+2348011112233",
    transporterName: "Benue Express Haulage",
    transporterPhone: "+2348055556677",
    status: "TRANSPORT_ASSIGNED",
    pickupVerifiedAt: null,
    deliveryVerifiedAt: null,
    createdAt: new Date().toISOString(),
  };

  it("renders official waybill header, numbers, and Benue logistics details", () => {
    const html = renderToStaticMarkup(<WaybillView waybill={sampleWaybill} />);

    expect(html).toContain("TONGRIC AGRICULTURAL LOGISTICS");
    expect(html).toContain("WB-202611-73921");
    expect(html).toContain("ORD-202611-73921");
    expect(html).toContain("Gboko ⇄ Makurdi");
    expect(html).toContain("45,000");
  });

  it("renders consignor, carrier, and consignee party cards", () => {
    const html = renderToStaticMarkup(<WaybillView waybill={sampleWaybill} />);

    expect(html).toContain("Terna Iorfa");
    expect(html).toContain("Gboko LGA");
    expect(html).toContain("Tor-Donga");
    expect(html).toContain("Benue Express Haulage");
    expect(html).toContain("Agro Commercials Ltd");
    expect(html).toContain("Makurdi Modern Market");
  });

  it("renders cargo produce manifest and weight", () => {
    const html = renderToStaticMarkup(<WaybillView waybill={sampleWaybill} />);

    expect(html).toContain("Cargo Manifest &amp; Produce Lot");
    expect(html).toContain("Yam");
    expect(html).toContain("1.00 MT (1,000 kg)");
    expect(html).toContain("600,000");
  });

  it("renders dual PIN authentication status and Section 19 platform notice", () => {
    const authenticatedWaybill: WaybillSummary = {
      ...sampleWaybill,
      pickupVerifiedAt: new Date().toISOString(),
      deliveryVerifiedAt: new Date().toISOString(),
    };

    const html = renderToStaticMarkup(<WaybillView waybill={authenticatedWaybill} />);

    expect(html).toContain("Dual Cryptographic Handover Authentication");
    expect(html).toContain("AUTHENTICATED");
    expect(html).toContain("Section 19 Platform Non-Custody Notice");
  });
});

