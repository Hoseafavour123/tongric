import { describe, expect, it } from "vitest";
import { createOfferSchema, respondOfferSchema } from "../schemas";

describe("orders schemas", () => {
  describe("createOfferSchema", () => {
    it("accepts valid offer input", () => {
      const result = createOfferSchema.safeParse({
        listingId: "list-1",
        quantity: 25,
        unitPrice: 30000,
        fulfillmentMode: "BUYER_ARRANGES_PICKUP",
        destinationLocation: "Makurdi Modern Market",
        proposedCollectionDate: "2026-11-20",
        note: "Can collect on Friday",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(25);
        expect(result.data.unitPrice).toBe(30000);
        expect(result.data.fulfillmentMode).toBe("BUYER_ARRANGES_PICKUP");
      }
    });

    it("rejects zero or negative quantity", () => {
      const res1 = createOfferSchema.safeParse({
        listingId: "list-1",
        quantity: 0,
        unitPrice: 30000,
      });
      expect(res1.success).toBe(false);

      const res2 = createOfferSchema.safeParse({
        listingId: "list-1",
        quantity: -5,
        unitPrice: 30000,
      });
      expect(res2.success).toBe(false);
    });

    it("rejects non-positive unit price", () => {
      const res = createOfferSchema.safeParse({
        listingId: "list-1",
        quantity: 10,
        unitPrice: 0,
      });
      expect(res.success).toBe(false);
    });
  });

  describe("respondOfferSchema", () => {
    it("accepts ACCEPT, DECLINE, and WITHDRAW without counter fields", () => {
      expect(respondOfferSchema.safeParse({ action: "ACCEPT" }).success).toBe(true);
      expect(respondOfferSchema.safeParse({ action: "DECLINE" }).success).toBe(true);
      expect(respondOfferSchema.safeParse({ action: "WITHDRAW" }).success).toBe(true);
    });

    it("requires proposed quantity and unit price when action is COUNTER", () => {
      const missingFields = respondOfferSchema.safeParse({
        action: "COUNTER",
        note: "Countering with no numbers",
      });
      expect(missingFields.success).toBe(false);

      const validCounter = respondOfferSchema.safeParse({
        action: "COUNTER",
        proposedQuantity: 20,
        proposedUnitPrice: 32000,
        note: "Best price possible",
      });
      expect(validCounter.success).toBe(true);
    });
  });
});

