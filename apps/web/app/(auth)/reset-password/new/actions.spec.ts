import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateUserMock, validatePasswordMock } = vi.hoisted(() => ({
  updateUserMock: vi.fn(),
  validatePasswordMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`__REDIRECT__${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { updateUser: updateUserMock },
  })),
}));

vi.mock("@/lib/auth/password", () => ({
  validatePassword: validatePasswordMock,
  passwordErrorMessage: (reason: string) => (reason === "too_short" ? "för kort" : "läckt"),
  MIN_PASSWORD_LENGTH: 12,
}));

import { setNewPasswordAction } from "./actions";
import { INITIAL_NEW_PASSWORD_STATE } from "./state";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

describe("setNewPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validatePasswordMock.mockResolvedValue({ ok: true });
  });

  it("returnerar fältfel för för kort lösenord (validator före Supabase)", async () => {
    const result = await setNewPasswordAction(INITIAL_NEW_PASSWORD_STATE, fd({ password: "kort" }));
    expect(result.status).toBe("error");
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("förkastar HIBP-komprometterat lösenord innan Supabase-anrop", async () => {
    validatePasswordMock.mockResolvedValue({ ok: false, reason: "compromised" });
    const result = await setNewPasswordAction(
      INITIAL_NEW_PASSWORD_STATE,
      fd({ password: "läckt-password-123" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.password).toContain("läckt");
    }
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("lyckat uppdatering redirect:ar till /reset-password/done", async () => {
    updateUserMock.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });

    await expect(
      setNewPasswordAction(INITIAL_NEW_PASSWORD_STATE, fd({ password: "safe-pass-12" })),
    ).rejects.toThrow("__REDIRECT__/reset-password/done");

    expect(updateUserMock).toHaveBeenCalledWith({ password: "safe-pass-12" });
  });

  it("Supabase-fel (utgången session) visar form-fel — INGEN redirect", async () => {
    updateUserMock.mockResolvedValue({
      data: null,
      error: { status: 401, message: "Session expired", name: "AuthApiError" },
    });

    const result = await setNewPasswordAction(
      INITIAL_NEW_PASSWORD_STATE,
      fd({ password: "safe-pass-12" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.form).toContain("gått ut");
    }
  });

  it("oväntat undantag från Supabase visas som form-fel", async () => {
    updateUserMock.mockRejectedValue(new Error("network"));

    const result = await setNewPasswordAction(
      INITIAL_NEW_PASSWORD_STATE,
      fd({ password: "safe-pass-12" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.form).toBeTruthy();
    }
  });
});
