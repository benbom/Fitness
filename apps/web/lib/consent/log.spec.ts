import { beforeEach, describe, expect, it, vi } from "vitest";

const { headersMock, consentCreateMock } = vi.hoisted(() => ({
  headersMock: vi.fn(),
  consentCreateMock: vi.fn(async () => ({ id: "row-uuid" })),
}));

vi.mock("next/headers", () => ({
  headers: () => headersMock(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    consent: { create: consentCreateMock },
  },
}));

import { logConsent } from "./log";

describe("logConsent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skriver consent-rad med userAgent från request-headers", async () => {
    headersMock.mockReturnValue({
      get: (name: string) => (name === "user-agent" ? "Mozilla/5.0 (test browser)" : null),
    });

    await logConsent({
      userId: "u-1",
      type: "terms_privacy",
      action: "granted",
      textShown: "Jag godkänner allt",
      screenId: "signup",
    });

    expect(consentCreateMock).toHaveBeenCalledTimes(1);
    expect(consentCreateMock).toHaveBeenCalledWith({
      data: {
        userId: "u-1",
        type: "terms_privacy",
        action: "granted",
        textShown: "Jag godkänner allt",
        screenId: "signup",
        userAgent: "Mozilla/5.0 (test browser)",
      },
    });
  });

  it("sätter userAgent till null om headern saknas", async () => {
    headersMock.mockReturnValue({
      get: () => null,
    });

    await logConsent({
      userId: "u-2",
      type: "marketing",
      action: "granted",
      textShown: "Nyhetsbrev",
      screenId: "settings",
    });

    expect(consentCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userAgent: null }),
      }),
    );
  });

  it("sätter userAgent till null om headers() throwar (utanför request-kontext)", async () => {
    headersMock.mockImplementation(() => {
      throw new Error("Called outside of request context");
    });

    await logConsent({
      userId: "u-3",
      type: "terms_privacy",
      action: "revoked",
      textShown: "[account anonymized]",
      screenId: "profile_delete",
    });

    expect(consentCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userAgent: null }),
      }),
    );
  });

  it("propagerar db-fel så anroparen kan välja fail-open eller fail-closed", async () => {
    headersMock.mockReturnValue({ get: () => null });
    consentCreateMock.mockRejectedValueOnce(new Error("db down"));

    await expect(
      logConsent({
        userId: "u-4",
        type: "terms_privacy",
        action: "granted",
        textShown: "x",
        screenId: "signup",
      }),
    ).rejects.toThrow("db down");
  });

  it("supportar revoked som action-värde", async () => {
    headersMock.mockReturnValue({ get: () => null });

    await logConsent({
      userId: "u-5",
      type: "marketing",
      action: "revoked",
      textShown: "Avanmäler nyhetsbrev",
      screenId: "settings_marketing",
    });

    expect(consentCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "revoked" }),
      }),
    );
  });
});
