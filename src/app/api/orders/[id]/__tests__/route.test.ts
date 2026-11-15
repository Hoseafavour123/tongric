import { describe, expect, it, vi } from "vitest";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

const mockRequireAuth = vi.fn();
const mockGetOrder = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/modules/orders", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/orders")>();
  return {
    ...actual,
    getOrder: (...args: unknown[]) => mockGetOrder(...args),
  };
});

import { GET } from "../route";

describe("GET /api/orders/[id]", () => {
  const sampleUser = {
    sessionId: "sess_farmer",
    user: {
      id: "usr_farmer_1",
      fullName: "Terna Iorfa",
      role: "FARMER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    },
  };

  const sampleOrder = {
    id: "ord-1",
    orderCode: "ORD-202611-73921",
    offerId: "off-1",
    listingId: "list-1",
    cropCode: "yam",
    quantity: 20,
    unitCode: "bag",
    estimatedWeightKg: 1000,
    unitPrice: 30000,
    totalAmount: 600000,
    status: "CONFIRMED",
    statusEvents: [],
  };

  it("returns 200 with order details for participant", async () => {
    mockRequireAuth.mockResolvedValueOnce(sampleUser);
    mockGetOrder.mockResolvedValueOnce(sampleOrder);

    const req = new Request("http://localhost:3000/api/orders/ord-1");
    const res = await GET(req, { params: Promise.resolve({ id: "ord-1" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.order.orderCode).toBe("ORD-202611-73921");
    expect(mockGetOrder).toHaveBeenCalledWith(
      { id: "usr_farmer_1", role: "FARMER" },
      "ord-1",
    );
  });

  it("returns 404 when order does not exist", async () => {
    mockRequireAuth.mockResolvedValueOnce(sampleUser);
    mockGetOrder.mockRejectedValueOnce(new NotFoundError("Order not found"));

    const req = new Request("http://localhost:3000/api/orders/missing");
    const res = await GET(req, { params: Promise.resolve({ id: "missing" }) });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.ok).toBe(false);
  });

  it("returns 403 when access is denied", async () => {
    mockRequireAuth.mockResolvedValueOnce(sampleUser);
    mockGetOrder.mockRejectedValueOnce(
      new ForbiddenError("You do not have permission to view this order"),
    );

    const req = new Request("http://localhost:3000/api/orders/forbidden");
    const res = await GET(req, { params: Promise.resolve({ id: "forbidden" }) });
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.ok).toBe(false);
  });
});

