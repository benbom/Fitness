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

import { saveProfileAction } from "./actions";
import { INITIAL_PROFILE_STATE } from "./state";

function fd(fields: Record<string, string | string[]>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (Array.isArray(v)) {
      for (const item of v) f.append(k, item);
    } else {
      f.append(k, v);
    }
  }
  return f;
}

describe("saveProfileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue(FAKE_USER);
  });

  it("returnerar fältfel för tom goals-lista", async () => {
    const result = await saveProfileAction(
      INITIAL_PROFILE_STATE,
      fd({
        level: "beginner",
        equipment: ["home"],
        daysPerWeek: "3",
        timePerSession: "45",
      }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.goals).toBeTruthy();
    }
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returnerar fältfel för okänd level", async () => {
    const result = await saveProfileAction(
      INITIAL_PROFILE_STATE,
      fd({
        goals: ["get_stronger"],
        level: "pro",
        equipment: ["home"],
        daysPerWeek: "3",
        timePerSession: "45",
      }),
    );
    expect(result.status).toBe("error");
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("upsert:ar ALLTID med user.id från sessionen (IDOR-skydd)", async () => {
    const result = await saveProfileAction(
      INITIAL_PROFILE_STATE,
      fd({
        goals: ["get_stronger", "feel_better"],
        level: "beginner",
        equipment: ["gym", "home"],
        daysPerWeek: "4",
        timePerSession: "45",
      }),
    );

    expect(result.status).toBe("saved");
    expect(upsertMock).toHaveBeenCalledTimes(1);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: FAKE_USER.id },
        create: expect.objectContaining({ id: FAKE_USER.id }),
      }),
    );
  });

  it("förkastar försök att skicka manuellt id i formData — sessionens id vinner", async () => {
    await saveProfileAction(
      INITIAL_PROFILE_STATE,
      fd({
        // Attackerare försöker skriva till annat konto
        id: "OTHER-USER-ID",
        userId: "OTHER-USER-ID",
        goals: ["get_stronger"],
        level: "beginner",
        equipment: ["home"],
        daysPerWeek: "3",
        timePerSession: "45",
      }),
    );

    // Fortfarande sessionens id — id/userId i formData ignoreras
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: FAKE_USER.id },
        create: expect.objectContaining({ id: FAKE_USER.id }),
      }),
    );
    expect(upsertMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "OTHER-USER-ID" },
      }),
    );
  });

  it("Prisma-fel returnerar form-fel utan att throwa", async () => {
    upsertMock.mockRejectedValueOnce(new Error("db unreachable"));
    const result = await saveProfileAction(
      INITIAL_PROFILE_STATE,
      fd({
        goals: ["get_stronger"],
        level: "beginner",
        equipment: ["home"],
        daysPerWeek: "3",
        timePerSession: "45",
      }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.form).toBeTruthy();
    }
  });
});
