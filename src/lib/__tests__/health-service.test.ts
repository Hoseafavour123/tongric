import { describe, expect, it, vi } from "vitest";
import { checkDatabaseHealth } from "../health-service";

describe("checkDatabaseHealth", () => {
  it("returns 200 connected when DATABASE_URL exists and probe passes", async () => {
    const probe = vi.fn().mockResolvedValue([{ "?column?": 1 }]);
    const result = await checkDatabaseHealth(true, probe);

    expect(probe).toHaveBeenCalledOnce();
    expect(result.healthy).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.database).toBe("connected");
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("returns 503 disconnected without probing when DATABASE_URL is absent", async () => {
    const probe = vi.fn();
    const result = await checkDatabaseHealth(false, probe);

    expect(probe).not.toHaveBeenCalled();
    expect(result.healthy).toBe(false);
    expect(result.statusCode).toBe(503);
    expect(result.database).toBe("disconnected");
  });

  it("returns sanitized 503 disconnected when probe fails", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const probe = vi
      .fn()
      .mockRejectedValue(
        new Error("password authentication failed for postgres://secret@db.neon.tech"),
      );

    const result = await checkDatabaseHealth(true, probe);

    expect(result.healthy).toBe(false);
    expect(result.statusCode).toBe(503);
    expect(result.database).toBe("disconnected");
    expect(JSON.stringify(result)).not.toContain("secret");
    expect(JSON.stringify(result)).not.toContain("neon.tech");

    errSpy.mockRestore();
  });
});

