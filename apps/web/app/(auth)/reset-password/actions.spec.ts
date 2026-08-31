import { beforeEach, describe, expect, it, vi } from "vitest";

const { resetPasswordForEmailMock, headersMock } = vi.hoisted(() => ({
  resetPasswordForEmailMock: vi.fn(),
  headersMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`__REDIRECT__${path}`);
  }),
}));

vi.mock("next/headers", () => ({
  headers: () => headersMock(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { resetPasswordForEmail: resetPasswordForEmailMock },
  })),
}));

import { requestResetAction } from "./actions";
import { INITIAL_RESET_REQUEST_STATE } from "./state";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

describe("requestResetAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPasswordForEmailMock.mockResolvedValue({ error: null });
    headersMock.mockReturnValue({
      get: (name: string) =>
        name === "x-forwarded-host"
          ? "vera.example.com"
          : name === "x-forwarded-proto"
            ? "https"
            : null,
    });
  });

  it("returnerar fältfel för ogiltig e-post — anropar inte Supabase", async () => {
    const result = await requestResetAction(INITIAL_RESET_REQUEST_STATE, fd({ email: "notemail" }));
    expect(result.status).toBe("error");
    expect(resetPasswordForEmailMock).not.toHaveBeenCalled();
  });

  it("anti-enumeration: redirect till /reset-password/check-email vid lyckat anrop", async () => {
    await expect(
      requestResetAction(INITIAL_RESET_REQUEST_STATE, fd({ email: "u@x.co" })),
    ).rejects.toThrow("__REDIRECT__/reset-password/check-email");

    expect(resetPasswordForEmailMock).toHaveBeenCalledWith(
      "u@x.co",
      expect.objectContaining({
        redirectTo: "https://vera.example.com/auth/callback?next=/reset-password/new",
      }),
    );
  });

  it("anti-enumeration: Supabase-fel redirect:ar också till check-email", async () => {
    resetPasswordForEmailMock.mockResolvedValue({
      error: { status: 400, message: "unknown email", name: "AuthApiError" },
    });

    await expect(
      requestResetAction(INITIAL_RESET_REQUEST_STATE, fd({ email: "nobody@example.com" })),
    ).rejects.toThrow("__REDIRECT__/reset-password/check-email");
  });

  it("rate-limit (429) visas som e-post-fältfel — INGEN redirect", async () => {
    resetPasswordForEmailMock.mockResolvedValue({
      error: { status: 429, message: "Too many requests", name: "AuthApiError" },
    });

    const result = await requestResetAction(INITIAL_RESET_REQUEST_STATE, fd({ email: "u@x.co" }));
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.email).toContain("försök");
    }
  });

  it("oväntat undantag från Supabase visas som form-fel", async () => {
    resetPasswordForEmailMock.mockRejectedValue(new Error("network unreachable"));

    const result = await requestResetAction(INITIAL_RESET_REQUEST_STATE, fd({ email: "u@x.co" }));
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.form).toBeTruthy();
    }
  });
});
