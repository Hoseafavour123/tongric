import { describe, expect, it, vi } from "vitest";

const mockRequireAuth = vi.fn();
const mockListUserOrders = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/orders", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/orders")>();
  return {
    ...actual,
    listUserOrders: (...args: unknown[]) => mockListUserOrders(...args),
  };
});

import { GET } from "../route";

describe("GET /api/orders", () => {
  const sampleUser = {
    sessionId: "sess_buyer",
    user: {
      id: "usr_buyer_1",
      fullName: "Agro Processors",
      role: "BUYER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    },
  };

  const sampleOrder = {
    id: "ord-1",
    orderCode: "ORD-202611-73921",
    cropCode: "yam",
    quantity: 20,
    unitCode: "bag",
    unitPrice: 30000,
    totalAmount: 600000,
    status: "CONFIRMED",
  };

  it("returns 200 with list of user orders", async () => {
    mockRequireAuth.mockResolvedValueOnce(sampleUser);
    mockListUserOrders.mockResolvedValueOnce([sampleOrder]);

    const req = new Request("http://localhost:3000/api/orders?role=buyer&status=CONFIRMED");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.orders).toHaveLength(1);
    expect(json.data.orders[0].orderCode).toBe("ORD-202611-73921");
    expect(mockListUserOrders).toHaveBeenCalledWith(
      { id: "usr_buyer_1", role: "BUYER" },
      { role: "buyer", status: "CONFIRMED" },
    );
  });

  it("handles unauthenticated requests", async () => {
    mockRequireAuth.mockRejectedValueOnce(new Error("Unauthorized"));

    const req = new Request("http://localhost:3000/api/orders");
    const res = await GET(req);

    expect(res.status).toBe(500);
  });
});

