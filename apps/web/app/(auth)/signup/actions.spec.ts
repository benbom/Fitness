import { beforeEach, describe, expect, it, vi } from "vitest";

const { signUpMock, validatePasswordMock, logConsentMock, headersMock } = vi.hoisted(() => ({
  signUpMock: vi.fn(),
  validatePasswordMock: vi.fn(),
  logConsentMock: vi.fn(async () => undefined),
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
    auth: { signUp: signUpMock },
  })),
}));

vi.mock("@/lib/auth/password", () => ({
  validatePassword: validatePasswordMock,
  passwordErrorMessage: (reason: string) => (reason === "too_short" ? "för kort" : "läckt"),
  MIN_PASSWORD_LENGTH: 12,
}));

vi.mock("@/lib/consent/log", () => ({
  logConsent: logConsentMock,
}));

import { signupAction } from "./actions";
import { INITIAL_SIGNUP_STATE } from "./state";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

describe("signupAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validatePasswordMock.mockResolvedValue({ ok: true });
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
    const result = await signupAction(
      INITIAL_SIGNUP_STATE,
      fd({ email: "notemail", password: "twelve-chars", consent: "on" }),
    );
    expect(result.status).toBe("error");
    expect(signUpMock).not.toHaveBeenCalled();
    expect(logConsentMock).not.toHaveBeenCalled();
  });

  it("returnerar fältfel utan samtycke — anropar inte Supabase", async () => {
    const result = await signupAction(
      INITIAL_SIGNUP_STATE,
      fd({ email: "u@x.co", password: "twelve-chars" }),
    );
    expect(result.status).toBe("error");
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("returnerar fältfel för för kort lösenord (validator före Supabase)", async () => {
    const result = await signupAction(
      INITIAL_SIGNUP_STATE,
      fd({ email: "u@x.co", password: "kort", consent: "on" }),
    );
    expect(result.status).toBe("error");
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("förkastar HIBP-komprometterat lösenord innan Supabase-anrop", async () => {
    validatePasswordMock.mockResolvedValue({ ok: false, reason: "compromised" });
    const result = await signupAction(
      INITIAL_SIGNUP_STATE,
      fd({ email: "u@x.co", password: "läckt-password-123", consent: "on" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.password).toContain("läckt");
    }
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("signup lyckas: loggar consent och redirect:ar till /verify", async () => {
    signUpMock.mockResolvedValue({
      data: { user: { id: "u-new", email_confirmed_at: null } },
      error: null,
    });

    await expect(
      signupAction(
        INITIAL_SIGNUP_STATE,
        fd({ email: "u@x.co", password: "twelve-chars", consent: "on" }),
      ),
    ).rejects.toThrow("__REDIRECT__/verify");

    expect(signUpMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "u@x.co",
        password: "twelve-chars",
        options: expect.objectContaining({
          emailRedirectTo: "https://vera.example.com/auth/callback",
        }),
      }),
    );
    expect(logConsentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u-new",
        type: "terms_privacy",
        action: "granted",
        screenId: "signup",
      }),
    );
  });

  it("consent-loggning failar men signup rullas inte tillbaka (fail-open)", async () => {
    signUpMock.mockResolvedValue({
      data: { user: { id: "u-new", email_confirmed_at: null } },
      error: null,
    });
    logConsentMock.mockRejectedValueOnce(new Error("consent log db down"));

    await expect(
      signupAction(
        INITIAL_SIGNUP_STATE,
        fd({ email: "u@x.co", password: "twelve-chars", consent: "on" }),
      ),
    ).rejects.toThrow("__REDIRECT__/verify");

    // Signup lyckades, consent misslyckades tyst
    expect(signUpMock).toHaveBeenCalled();
  });

  it("anti-enumeration: Supabase-fel redirect:ar till /verify oavsett", async () => {
    signUpMock.mockResolvedValue({
      data: { user: null },
      error: { status: 400, message: "User already registered", name: "AuthApiError" },
    });

    await expect(
      signupAction(
        INITIAL_SIGNUP_STATE,
        fd({ email: "existing@x.co", password: "twelve-chars", consent: "on" }),
      ),
    ).rejects.toThrow("__REDIRECT__/verify");
  });

  it("rate-limit (429) visas som e-post-fältfel — INGEN redirect", async () => {
    signUpMock.mockResolvedValue({
      data: { user: null },
      error: { status: 429, message: "Too many requests", name: "AuthApiError" },
    });

    const result = await signupAction(
      INITIAL_SIGNUP_STATE,
      fd({ email: "u@x.co", password: "twelve-chars", consent: "on" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.email).toContain("försök");
    }
  });

  it("oväntat undantag från Supabase (t.ex. konfig-fel) visas som form-fel", async () => {
    signUpMock.mockRejectedValue(new Error("NEXT_PUBLIC_SUPABASE_URL saknas"));

    const result = await signupAction(
      INITIAL_SIGNUP_STATE,
      fd({ email: "u@x.co", password: "twelve-chars", consent: "on" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.form).toBeTruthy();
    }
  });
});
