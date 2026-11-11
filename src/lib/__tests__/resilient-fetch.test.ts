import { describe, expect, it, vi } from "vitest";
import { extractIdempotencyKey } from "../idempotency";
import { resilientFetch } from "../resilient-fetch";

describe("resilientFetch & idempotency", () => {
  it("retries transient 503 GET requests and succeeds", async () => {
    const mockFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: false }), {
          status: 503,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, data: { items: [1, 2] } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    const result = await resilientFetch<{ items: number[] }>("/api/listings", {
      fetchImpl: mockFetch,
      retryDelayMs: 1,
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items).toEqual([1, 2]);
    }
  });

  it("attaches Idempotency-Key on POST and never auto-retries mutations on 503", async () => {
    const mockFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: false,
          error: { code: "SERVICE_UNAVAILABLE", message: "Busy" },
        }),
        {
          status: 503,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const result = await resilientFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({ qty: 5 }),
      fetchImpl: mockFetch,
      retryDelayMs: 1,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, init] = mockFetch.mock.calls[0]!;
    const keyHeader = (init?.headers as Record<string, string>)["Idempotency-Key"];
    expect(keyHeader).toBeTruthy();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.canRetry).toBe(true);
      expect(result.idempotencyKey).toBe(keyHeader);
    }
  });

  it("handles network dropouts cleanly as retryable failures", async () => {
    const mockFetch = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError("Failed to fetch"));

    const result = await resilientFetch("/api/listings", {
      method: "POST",
      fetchImpl: mockFetch,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.canRetry).toBe(true);
      expect(result.error.code).toBe("NETWORK_ERROR");
    }
  });

  it("validates Idempotency-Key header format safely", () => {
    const valid = new Headers({ "Idempotency-Key": "order-12345678" });
    expect(extractIdempotencyKey(valid)).toBe("order-12345678");

    const tooShort = new Headers({ "Idempotency-Key": "abc" });
    expect(extractIdempotencyKey(tooShort)).toBeNull();

    const badChars = new Headers({ "Idempotency-Key": "bad key with spaces!" });
    expect(extractIdempotencyKey(badChars)).toBeNull();
  });
});

