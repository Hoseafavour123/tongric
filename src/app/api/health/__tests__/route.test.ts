import { describe, expect, it, vi } from "vitest";

const mockGetEnv = vi.fn();
const mockQueryRaw = vi.fn();

vi.mock("@/lib/env", () => ({
  getEnv: () => mockGetEnv(),
}));

vi.mock("@/lib/db", () => ({
  getDb: () => ({
    $queryRaw: mockQueryRaw,
  }),
}));

import { GET } from "../route";

describe("GET /api/health", () => {
  it("returns 200 ok when database probe succeeds", async () => {
    mockGetEnv.mockReturnValue({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/tongric",
    });
    mockQueryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe("ok");
    expect(json.data.database).toBe("connected");
  });

  it("returns sanitized 503 when DATABASE_URL is missing", async () => {
    mockGetEnv.mockReturnValue({ DATABASE_URL: undefined });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("SERVICE_UNAVAILABLE");
    expect(json.error.message).toBe("Database connection unavailable");
  });

  it("returns sanitized 503 when database query fails", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetEnv.mockReturnValue({
      DATABASE_URL: "postgresql://user:supersecret@db.host/tongric",
    });
    mockQueryRaw.mockRejectedValueOnce(
      new Error("connection refused to supersecret@db.host"),
    );

    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(503);
    expect(text).not.toContain("supersecret");
    expect(text).not.toContain("db.host");

    errSpy.mockRestore();
  });
});

