import { beforeEach, describe, expect, it, vi } from "vitest";

// --- Hoistade spies så vi.mock-factories kan referera dem ---
const {
  FAKE_USER,
  deleteUserMock,
  updateUserByIdMock,
  signOutMock,
  profileDeleteManyMock,
  logConsentMock,
} = vi.hoisted(() => ({
  FAKE_USER: { id: "user-uuid-1234", email: "u@x.co" },
  deleteUserMock: vi.fn(),
  updateUserByIdMock: vi.fn(),
  signOutMock: vi.fn(async () => ({ error: null })),
  profileDeleteManyMock: vi.fn(async () => ({ count: 1 })),
  logConsentMock: vi.fn(async () => undefined),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`__REDIRECT__${path}`);
  }),
}));

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: vi.fn(async () => FAKE_USER),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        deleteUser: deleteUserMock,
        updateUserById: updateUserByIdMock,
      },
    },
  })),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { signOut: signOutMock },
  })),
}));

vi.mock("@/lib/db", () => ({
  db: {
    profile: { deleteMany: profileDeleteManyMock },
  },
}));

vi.mock("@/lib/consent/log", () => ({
  logConsent: logConsentMock,
}));

// --- Importer efter mocks ---
import { deleteAccountAction } from "./actions";
import { INITIAL_DELETE_STATE } from "./state";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

describe("deleteAccountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteUserMock.mockResolvedValue({ error: null });
    updateUserByIdMock.mockResolvedValue({ data: null, error: null });
  });

  it("förkastar felstavad bekräftelse — anropar aldrig admin-API", async () => {
    const result = await deleteAccountAction(
      INITIAL_DELETE_STATE,
      fd({ action: "delete", confirmation: "radera" }),
    );
    expect(result.status).toBe("error");
    expect(deleteUserMock).not.toHaveBeenCalled();
    expect(updateUserByIdMock).not.toHaveBeenCalled();
  });

  it("förkastar okänd action", async () => {
    const result = await deleteAccountAction(
      INITIAL_DELETE_STATE,
      fd({ action: "suspend", confirmation: "RADERA" }),
    );
    expect(result.status).toBe("error");
    expect(deleteUserMock).not.toHaveBeenCalled();
    expect(updateUserByIdMock).not.toHaveBeenCalled();
  });

  it("hard delete: anropar admin.deleteUser med user.id från sessionen", async () => {
    await expect(
      deleteAccountAction(INITIAL_DELETE_STATE, fd({ action: "delete", confirmation: "RADERA" })),
    ).rejects.toThrow("__REDIRECT__/goodbye");

    expect(deleteUserMock).toHaveBeenCalledTimes(1);
    expect(deleteUserMock).toHaveBeenCalledWith(FAKE_USER.id);
    expect(updateUserByIdMock).not.toHaveBeenCalled();
    // Ingen manuell profil-radering — FK CASCADE tar hand om det
    expect(profileDeleteManyMock).not.toHaveBeenCalled();
    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  it("anonymize: byter e-post via admin, raderar profil, loggar revoke, signOut", async () => {
    await expect(
      deleteAccountAction(
        INITIAL_DELETE_STATE,
        fd({ action: "anonymize", confirmation: "RADERA" }),
      ),
    ).rejects.toThrow("__REDIRECT__/goodbye");

    expect(deleteUserMock).not.toHaveBeenCalled();

    // admin.updateUserById med anonymiserad e-post + metadata
    expect(updateUserByIdMock).toHaveBeenCalledTimes(1);
    const [userId, updates] = updateUserByIdMock.mock.calls[0]!;
    expect(userId).toBe(FAKE_USER.id);
    expect(updates.email).toMatch(/^anonymized-[a-f0-9-]+@vera\.local$/);
    expect(updates.user_metadata?.anonymized_at).toBeTruthy();

    // Profil raderad explicit (FK CASCADE triggas inte utan user-delete)
    expect(profileDeleteManyMock).toHaveBeenCalledWith({ where: { id: FAKE_USER.id } });

    // Consent loggat som revoked
    expect(logConsentMock).toHaveBeenCalledWith({
      userId: FAKE_USER.id,
      type: "terms_privacy",
      action: "revoked",
      textShown: expect.stringContaining("anonymized"),
      screenId: "profile_delete",
    });

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  it("hanterar admin.deleteUser-fel gracefully utan att throwa", async () => {
    deleteUserMock.mockResolvedValue({
      error: { message: "not authorized", status: 403 },
    });
    const result = await deleteAccountAction(
      INITIAL_DELETE_STATE,
      fd({ action: "delete", confirmation: "RADERA" }),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors.form).toBeTruthy();
    }
    // signOut anropas inte om deletion failade
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("anonymize med consent-log-fel forsätter ändå (fail-open på loggen)", async () => {
    logConsentMock.mockRejectedValueOnce(new Error("db unreachable"));

    // Ska fortfarande redirect:a — consent-log är non-fatal
    await expect(
      deleteAccountAction(
        INITIAL_DELETE_STATE,
        fd({ action: "anonymize", confirmation: "RADERA" }),
      ),
    ).rejects.toThrow("__REDIRECT__/goodbye");

    expect(updateUserByIdMock).toHaveBeenCalled();
    expect(profileDeleteManyMock).toHaveBeenCalled();
  });
});
