import { beforeEach, describe, expect, it, vi } from "vitest";

const { FAKE_USER, upsertMock, requireUserMock } = vi.hoisted(() => ({
  FAKE_USER: { id: "user-uuid-abc", email: "u@x.co" },
  upsertMock: vi.fn(async () => ({ id: "user-uuid-abc" })),
  requireUserMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    profile: { upsert: upsertMock },
  },
}));

import { saveNotificationPrefsAction } from "./actions";
import { INITIAL_NOTIF_PREFS_STATE } from "./state";

/**
 * Bygg en giltig baseline-FormData. Individuella tester overridar
 * bara det som är relevant.
 */
function fullFd(overrides: Record<string, string> = {}): FormData {
  const base: Record<string, string> = {
    "category[training_reminders].enabled": "on",
    "category[training_reminders].frequency": "daily",
    "category[progress_updates].enabled": "on",
    "category[progress_updates].frequency": "weekly",
    "category[content_tips].frequency": "weekly",
    "category[product_news].frequency": "off",
    "category[community_mentions].enabled": "on",
    "category[community_mentions].frequency": "immediate",
    "quiet_hours.enabled": "on",
    "quiet_hours.startHour": "22",
    "quiet_hours.endHour": "7",
  };
  const merged = { ...base, ...overrides };
  const f = new FormData();
  for (const [k, v] of Object.entries(merged)) {
    if (v !== "") f.append(k, v);
  }
  return f;
}

describe("saveNotificationPrefsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue(FAKE_USER);
  });

  it("upsert:ar med sessionens user.id (IDOR-skydd) och sparad JSON matchar schema", async () => {
    const result = await saveNotificationPrefsAction(INITIAL_NOTIF_PREFS_STATE, fullFd());
    expect(result.status).toBe("saved");
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: FAKE_USER.id },
        create: expect.objectContaining({
          id: FAKE_USER.id,
          notifPrefs: expect.objectContaining({
            categories: expect.any(Object),
            quiet_hours: expect.any(Object),
          }),
        }),
      }),
    );
  });

  it("kryssruta som saknas tolkas som enabled=false (HTML-standard)", async () => {
    // Ingen 'category[content_tips].enabled' → checkbox var av
    await saveNotificationPrefsAction(INITIAL_NOTIF_PREFS_STATE, fullFd());
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          notifPrefs: expect.objectContaining({
            categories: expect.objectContaining({
              content_tips: expect.objectContaining({ enabled: false }),
              product_news: expect.objectContaining({ enabled: false }),
              training_reminders: expect.objectContaining({ enabled: true }),
            }),
          }),
        }),
      }),
    );
  });

  it("returnerar formulärfel för ogiltig frekvens — anropar inte Prisma", async () => {
    const result = await saveNotificationPrefsAction(
      INITIAL_NOTIF_PREFS_STATE,
      fullFd({ "category[training_reminders].frequency": "hourly" }),
    );
    expect(result.status).toBe("error");
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returnerar formulärfel för timme utanför 0-23", async () => {
    const result = await saveNotificationPrefsAction(
      INITIAL_NOTIF_PREFS_STATE,
      fullFd({ "quiet_hours.startHour": "99" }),
    );
    expect(result.status).toBe("error");
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("förkastar försök att skicka manuellt id — sessionens id vinner", async () => {
    const attackFd = fullFd();
    attackFd.append("id", "OTHER-USER-ID");
    attackFd.append("userId", "OTHER-USER-ID");

    await saveNotificationPrefsAction(INITIAL_NOTIF_PREFS_STATE, attackFd);

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: FAKE_USER.id },
        create: expect.objectContaining({ id: FAKE_USER.id }),
      }),
    );
  });

  it("Prisma-fel returnerar form-fel utan att throwa", async () => {
    upsertMock.mockRejectedValueOnce(new Error("db down"));
    const result = await saveNotificationPrefsAction(INITIAL_NOTIF_PREFS_STATE, fullFd());
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.formError).toBeTruthy();
    }
  });
});
