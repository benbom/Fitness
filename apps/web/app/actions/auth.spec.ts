import { beforeEach, describe, expect, it, vi } from "vitest";

const { signOutMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`__REDIRECT__${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { signOut: signOutMock },
  })),
}));

import { logoutAction } from "./auth";

describe("logoutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("anropar Supabase signOut och redirect:ar till /", async () => {
    signOutMock.mockResolvedValue({ error: null });

    await expect(logoutAction()).rejects.toThrow("__REDIRECT__/");

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  it("fail-open: Supabase-fel loggas men användaren redirect:as ändå", async () => {
    signOutMock.mockResolvedValue({
      error: { status: 500, message: "Supabase down", name: "AuthApiError" },
    });

    await expect(logoutAction()).rejects.toThrow("__REDIRECT__/");
  });

  it("fail-open: undantag från Supabase (t.ex. konfig-fel) fastnar inte användaren", async () => {
    signOutMock.mockRejectedValue(new Error("NEXT_PUBLIC_SUPABASE_URL saknas"));

    await expect(logoutAction()).rejects.toThrow("__REDIRECT__/");
  });
});
