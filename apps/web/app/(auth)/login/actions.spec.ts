import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted lyfter dessa till toppen tillsammans med vi.mock så
// factory-funktionerna kan referera dem.
const { signInWithPasswordMock } = vi.hoisted(() => ({
  signInWithPasswordMock: vi.fn(),
}));

// Redirect throws en känd sträng så vi kan asserta target.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`__REDIRECT__${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: signInWithPasswordMock,
    },
  })),
}));

import { signinAction } from "./actions";
import { INITIAL_SIGNIN_STATE } from "./state";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

describe("signinAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returnerar fältfel för ogiltig e-post — anropar inte Supabase", async () => {
    const result = await signinAction(
      INITIAL_SIGNIN_STATE,
      fd({ email: "notanemail", password: "any" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.email).toBeTruthy();
    }
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });

  it("returnerar fältfel för tomt lösenord — anropar inte Supabase", async () => {
    const result = await signinAction(
      INITIAL_SIGNIN_STATE,
      fd({ email: "user@example.com", password: "" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.password).toBeTruthy();
    }
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });

  it("redirect:ar till / vid lyckad login utan next-param", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });
    await expect(
      signinAction(INITIAL_SIGNIN_STATE, fd({ email: "u@x.co", password: "pw" })),
    ).rejects.toThrow("__REDIRECT__/");
  });

  it("respekterar säker next-param (börjar med /)", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });
    await expect(
      signinAction(
        INITIAL_SIGNIN_STATE,
        fd({ email: "u@x.co", password: "pw", next: "/profile/setup" }),
      ),
    ).rejects.toThrow("__REDIRECT__/profile/setup");
  });

  it("förkastar osäker next-param (open-redirect-skydd)", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });
    await expect(
      signinAction(
        INITIAL_SIGNIN_STATE,
        fd({ email: "u@x.co", password: "pw", next: "https://evil.com" }),
      ),
    ).rejects.toThrow("__REDIRECT__/");
  });

  it("visar generiskt fel vid fel lösenord (anti-enumeration)", async () => {
    signInWithPasswordMock.mockResolvedValue({
      error: { status: 400, message: "Invalid login credentials", name: "AuthApiError" },
    });
    const result = await signinAction(
      INITIAL_SIGNIN_STATE,
      fd({ email: "u@x.co", password: "wrong" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.form).toContain("Fel e-post eller lösenord");
    }
  });

  it("visar generiskt fel även för okänd e-post (samma text som fel lösenord)", async () => {
    // Supabase returnerar samma error för icke-existerande user som fel lösenord —
    // vi speglar det, aldrig läcker skillnaden till UI:t.
    signInWithPasswordMock.mockResolvedValue({
      error: { status: 400, message: "Invalid login credentials", name: "AuthApiError" },
    });
    const result = await signinAction(
      INITIAL_SIGNIN_STATE,
      fd({ email: "nobody@example.com", password: "anything" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.form).toContain("Fel e-post eller lösenord");
    }
  });

  it("särskiljer email-not-confirmed med informativ text", async () => {
    signInWithPasswordMock.mockResolvedValue({
      error: { status: 400, message: "Email not confirmed", name: "AuthApiError" },
    });
    const result = await signinAction(
      INITIAL_SIGNIN_STATE,
      fd({ email: "u@x.co", password: "pw" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.form).toContain("verifierad");
    }
  });

  it("hanterar rate-limit (429) som e-post-fältfel", async () => {
    signInWithPasswordMock.mockResolvedValue({
      error: { status: 429, message: "Too many requests", name: "AuthApiError" },
    });
    const result = await signinAction(
      INITIAL_SIGNIN_STATE,
      fd({ email: "u@x.co", password: "pw" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.email).toContain("försök");
    }
  });

  it("hanterar oväntat undantag från Supabase gracefully", async () => {
    signInWithPasswordMock.mockRejectedValue(new Error("network unreachable"));
    const result = await signinAction(
      INITIAL_SIGNIN_STATE,
      fd({ email: "u@x.co", password: "pw" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.form).toBeTruthy();
    }
  });
});
