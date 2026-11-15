import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/lib/errors";

const mockRequireAuth = vi.fn();
const mockRespondToCommercialOffer = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/orders", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/orders")>();
  return {
    ...actual,
    respondToCommercialOffer: (...args: unknown[]) =>
      mockRespondToCommercialOffer(...args),
  };
});

import { POST } from "../route";

describe("POST /api/offers/[id]/respond", () => {
  const farmerSession = {
    sessionId: "sess_farmer",
    user: {
      id: "usr_farmer_1",
      fullName: "Terna Iorfa",
      role: "FARMER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    },
  };

  const sampleUpdatedOffer = {
    id: "off-1",
    status: "ACCEPTED",
    quantity: 20,
    unitPrice: 30000,
    totalAmount: 600000,
  };

  it("returns 200 with updated offer when response is valid", async () => {
    mockRequireAuth.mockResolvedValueOnce(farmerSession);
    mockRespondToCommercialOffer.mockResolvedValueOnce(sampleUpdatedOffer);

    const req = new Request("http://localhost:3000/api/offers/off-1/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ACCEPT" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "off-1" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.offer.status).toBe("ACCEPTED");
  });

  it("returns 400 when validation error is thrown", async () => {
    mockRequireAuth.mockResolvedValueOnce(farmerSession);
    mockRespondToCommercialOffer.mockRejectedValueOnce(
      new ValidationError("Offer expired"),
    );

    const req = new Request("http://localhost:3000/api/offers/off-1/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ACCEPT" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "off-1" }) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
  });
});

