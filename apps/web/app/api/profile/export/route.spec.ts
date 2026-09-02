import { randomBytes } from "node:crypto";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const {
  FAKE_USER,
  requireUserMock,
  profileFindUniqueMock,
  consentFindManyMock,
  injuryFindManyMock,
} = vi.hoisted(() => ({
  FAKE_USER: {
    id: "user-uuid-abc",
    email: "user@example.com",
    created_at: "2026-01-01T00:00:00Z",
    last_sign_in_at: "2026-08-30T10:00:00Z",
    email_confirmed_at: "2026-01-01T00:00:00Z",
  },
  requireUserMock: vi.fn(),
  profileFindUniqueMock: vi.fn(),
  consentFindManyMock: vi.fn(),
  injuryFindManyMock: vi.fn(),
}));

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    profile: { findUnique: profileFindUniqueMock },
    consent: { findMany: consentFindManyMock },
    injuryFlag: { findMany: injuryFindManyMock },
  },
}));

import { encryptColumn } from "@/lib/crypto/column";

import { GET } from "./route";

describe("GET /api/profile/export", () => {
  beforeAll(() => {
    process.env.COLUMN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  });

  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue(FAKE_USER);
    profileFindUniqueMock.mockResolvedValue({
      id: FAKE_USER.id,
      goals: ["get_stronger"],
      level: "beginner",
      equipment: ["home"],
      daysPerWeek: 3,
      timePerSession: 45,
      notifPrefs: {},
      createdAt: new Date("2026-01-02T00:00:00Z"),
      updatedAt: new Date("2026-01-02T00:00:00Z"),
    });
    consentFindManyMock.mockResolvedValue([
      {
        id: "c1",
        userId: FAKE_USER.id,
        type: "terms_privacy",
        action: "granted",
        textShown: "Jag godkänner",
        screenId: "signup",
        userAgent: "Mozilla/5.0",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    ]);
    injuryFindManyMock.mockResolvedValue([]);
  });

  it("returnerar JSON med attachment-header och rätt filnamn", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    const disposition = res.headers.get("Content-Disposition") ?? "";
    expect(disposition).toContain("attachment");
    expect(disposition).toMatch(/filename="vera-export-\d{4}-\d{2}-\d{2}\.json"/);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("filtrerar ALLTID på sessionens user.id (IDOR-skydd)", async () => {
    await GET();
    expect(profileFindUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: FAKE_USER.id } }),
    );
    expect(consentFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: FAKE_USER.id } }),
    );
    expect(injuryFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: FAKE_USER.id } }),
    );
  });

  it("payload innehåller alla obligatoriska sektioner", async () => {
    const res = await GET();
    const body = (await res.json()) as {
      meta: unknown;
      user: { id: string; email: string };
      profile: unknown;
      consent_history: unknown[];
      injury_flags: unknown[];
    };
    expect(body.meta).toBeDefined();
    expect(body.user.id).toBe(FAKE_USER.id);
    expect(body.user.email).toBe(FAKE_USER.email);
    expect(body.profile).toBeDefined();
    expect(Array.isArray(body.consent_history)).toBe(true);
    expect(Array.isArray(body.injury_flags)).toBe(true);
  });

  it("dekrypterar injury note så användaren ser klartext i exporten", async () => {
    const secret = "Ryggskada 2024 — undvik marklyft";
    injuryFindManyMock.mockResolvedValue([
      {
        id: "inj-1",
        userId: FAKE_USER.id,
        area: "back",
        severity: "moderate",
        note: encryptColumn(secret),
        createdAt: new Date("2026-05-01T00:00:00Z"),
        updatedAt: new Date("2026-05-01T00:00:00Z"),
      },
    ]);

    const res = await GET();
    const body = (await res.json()) as {
      injury_flags: { area: string; severity: string; note: string | null }[];
    };
    expect(body.injury_flags).toHaveLength(1);
    expect(body.injury_flags[0]!.area).toBe("back");
    expect(body.injury_flags[0]!.severity).toBe("moderate");
    expect(body.injury_flags[0]!.note).toBe(secret);
  });

  it("null-note stödjs — kommer ut som null i exporten", async () => {
    injuryFindManyMock.mockResolvedValue([
      {
        id: "inj-2",
        userId: FAKE_USER.id,
        area: "knee",
        severity: "none",
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const res = await GET();
    const body = (await res.json()) as {
      injury_flags: { area: string; note: string | null }[];
    };
    expect(body.injury_flags[0]!.note).toBeNull();
  });

  it("dekrypterings-fel för en injury-rad kraschar inte hela exporten", async () => {
    injuryFindManyMock.mockResolvedValue([
      {
        id: "inj-3",
        userId: FAKE_USER.id,
        area: "shoulder",
        severity: "mild",
        note: Buffer.from("skräp"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      injury_flags: { note: string | null }[];
    };
    expect(body.injury_flags[0]!.note).toBeNull();
  });

  it("hoppar över hela endpointen när användaren inte är inloggad (redirect kastas)", async () => {
    requireUserMock.mockImplementation(async () => {
      throw new Error("__REDIRECT__/login");
    });

    await expect(GET()).rejects.toThrow("__REDIRECT__/login");
    expect(profileFindUniqueMock).not.toHaveBeenCalled();
    expect(injuryFindManyMock).not.toHaveBeenCalled();
  });
});
