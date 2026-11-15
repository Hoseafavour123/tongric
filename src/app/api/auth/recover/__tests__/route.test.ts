import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/lib/errors";

const mockRecoverPassword = vi.fn();

vi.mock("@/modules/auth/auth.service", () => ({
  recoverPassword: (...args: unknown[]) => mockRecoverPassword(...args),
}));

import { POST } from "../route";

describe("POST /api/auth/recover", () => {
  it("resets password and clears session cookie on success", async () => {
    mockRecoverPassword.mockResolvedValueOnce({
      success: true,
      message: "Password reset successful.",
    });

    const req = new Request("http://localhost/api/auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: "08031234567",
        recoveryCode: "TGR-ABCDE-FGHJK",
        newPassword: "new-harvest-password",
        confirmNewPassword: "new-harvest-password",
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.success).toBe(true);
  });

  it("returns 400 on invalid recovery code", async () => {
    mockRecoverPassword.mockRejectedValueOnce(
      new ValidationError("Invalid recovery code."),
    );

    const req = new Request("http://localhost/api/auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: "08031234567",
        recoveryCode: "TGR-INVALID-CODE",
        newPassword: "new-password-1234",
        confirmNewPassword: "new-password-1234",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

