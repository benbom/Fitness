import crypto from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { isPasswordCompromised, validatePassword } from "./password";

/** Räkna ut samma SHA-1-suffix som password.ts sha1Hex gör. */
function sha1Suffix(password: string): string {
  return crypto.createHash("sha1").update(password).digest("hex").toUpperCase().slice(5);
}

/**
 * Bygger en fake fetch som returnerar en HIBP-liknande response.
 * HIBP-svaret är rader av 'HASH_SUFFIX:COUNT', separerade med \r\n.
 */
function mockHibpFetch(bodyText: string, opts: { ok?: boolean } = {}) {
  const ok = opts.ok ?? true;
  return vi.fn(async () => ({
    ok,
    text: async () => bodyText,
  })) as unknown as typeof fetch;
}

describe("validatePassword", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("förkastar lösenord kortare än 12 tecken", async () => {
    const result = await validatePassword("kort");
    expect(result).toEqual({ ok: false, reason: "too_short" });
  });

  it("förkastar exakt 11 tecken", async () => {
    const result = await validatePassword("elva-tecken");
    expect(result).toEqual({ ok: false, reason: "too_short" });
  });

  it("accepterar 12 tecken om HIBP inte flaggar", async () => {
    vi.stubGlobal("fetch", mockHibpFetch("SOMEOTHERSUFFIX:1\r\nANOTHER:2"));
    const result = await validatePassword("twelve-chars");
    expect(result).toEqual({ ok: true });
  });

  it("förkastar komprometterat lösenord som finns i HIBP-svaret", async () => {
    const password = "password12345";
    const suffix = sha1Suffix(password);
    vi.stubGlobal("fetch", mockHibpFetch(`${suffix}:100\r\nOTHERHASH:1`));
    const result = await validatePassword(password);
    expect(result).toEqual({ ok: false, reason: "compromised" });
  });

  it("fail-open: släpper igenom lösenord om HIBP är onåbar", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network error");
      }),
    );
    const result = await validatePassword("some-safe-password-xyz-42");
    expect(result).toEqual({ ok: true });
  });

  it("fail-open: släpper igenom om HIBP svarar med icke-2xx", async () => {
    vi.stubGlobal("fetch", mockHibpFetch("", { ok: false }));
    const result = await validatePassword("some-safe-password-xyz-42");
    expect(result).toEqual({ ok: true });
  });
});

describe("isPasswordCompromised", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("hittar suffix i HIBP-svaret", async () => {
    const password = "test123456789";
    const suffix = sha1Suffix(password);
    vi.stubGlobal("fetch", mockHibpFetch(`${suffix}:42`));
    const result = await isPasswordCompromised(password);
    expect(result).toBe(true);
  });

  it("returnerar false om suffixet inte finns", async () => {
    vi.stubGlobal("fetch", mockHibpFetch("FAKESUFFIX:1\r\nANOTHERONE:2"));
    const result = await isPasswordCompromised("something-random-xyz-999");
    expect(result).toBe(false);
  });

  it("skickar bara SHA-1-prefixet till HIBP, inte lösenordet självt", async () => {
    const fetchSpy = mockHibpFetch("");
    vi.stubGlobal("fetch", fetchSpy);
    await isPasswordCompromised("hemlighemlighemlig");
    // Bör ha anropats med URL:en /range/PREFIX där PREFIX är 5 tecken
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [urlArg] = (fetchSpy as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]!;
    expect(String(urlArg)).toMatch(/\/range\/[A-F0-9]{5}$/);
  });

  it("skickar Add-Padding-header för konstant svarsstorlek", async () => {
    const fetchSpy = mockHibpFetch("");
    vi.stubGlobal("fetch", fetchSpy);
    await isPasswordCompromised("safe-pass-1234");
    const [, init] = (fetchSpy as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]!;
    const headers = (init as { headers?: Record<string, string> })?.headers ?? {};
    expect(headers["Add-Padding"]).toBe("true");
  });
});
