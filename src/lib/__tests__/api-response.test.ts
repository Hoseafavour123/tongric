import { describe, expect, it, vi } from "vitest";
import { ZodError, z } from "zod";
import { created, fail, handleApiError, ok } from "../api-response";
import { ConflictError, ForbiddenError, ValidationError } from "../errors";

describe("api-response helpers", () => {
  it("formats success envelopes consistently", async () => {
    const response = ok({ status: "healthy" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      data: { status: "healthy" },
    });

    const createdRes = created({ id: "123" });
    expect(createdRes.status).toBe(201);
    expect(await createdRes.json()).toEqual({
      ok: true,
      data: { id: "123" },
    });
  });

  it("formats typed AppError responses cleanly", async () => {
    const conflict = handleApiError(
      new ConflictError("Insufficient produce quantity"),
    );
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toEqual({
      ok: false,
      error: {
        code: "CONFLICT",
        message: "Insufficient produce quantity",
      },
    });

    const forbidden = handleApiError(new ForbiddenError());
    expect(forbidden.status).toBe(403);

    const validation = handleApiError(
      new ValidationError("Bad payload", { field: "quantity" }),
    );
    expect(validation.status).toBe(400);
    expect(await validation.json()).toEqual({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Bad payload",
        details: { field: "quantity" },
      },
    });
  });

  it("maps ZodError to 400 VALIDATION_ERROR", async () => {
    const schema = z.object({ quantity: z.number().positive() });
    let caught: unknown;
    try {
      schema.parse({ quantity: -5 });
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(ZodError);
    const res = handleApiError(caught);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("hides unexpected error messages in production mode", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const secretError = new Error("DB password leaked in stack");

    const prodRes = handleApiError(secretError, true);
    expect(prodRes.status).toBe(500);
    const prodJson = await prodRes.json();
    expect(prodJson.error.message).not.toContain("DB password");

    const devRes = handleApiError(secretError, false);
    const devJson = await devRes.json();
    expect(devJson.error.message).toContain("DB password");

    errorSpy.mockRestore();
  });

  it("supports direct fail() response builder", async () => {
    const res = fail("NOT_FOUND", "Listing missing", 404);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      ok: false,
      error: { code: "NOT_FOUND", message: "Listing missing" },
    });
  });
});

