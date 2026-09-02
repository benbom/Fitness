import { randomBytes } from "node:crypto";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { FAKE_USER, deleteManyMock, createManyMock, transactionMock, requireUserMock } = vi.hoisted(
  () => ({
    FAKE_USER: { id: "user-uuid-abc", email: "u@x.co" },
    deleteManyMock: vi.fn(async () => ({ count: 0 })),
    createManyMock: vi.fn(async () => ({ count: 0 })),
    transactionMock: vi.fn(),
    requireUserMock: vi.fn(),
  }),
);

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    $transaction: transactionMock,
  },
}));

import { decryptColumn } from "@/lib/crypto/column";

import { saveInjuriesAction } from "./actions";
import { INITIAL_INJURIES_STATE } from "./state";

function fd(entries: { area: string; severity: string; note?: string }[]): FormData {
  const f = new FormData();
  for (const e of entries) {
    f.append("area", e.area);
    f.append("severity", e.severity);
    f.append("note", e.note ?? "");
  }
  return f;
}

describe("saveInjuriesAction", () => {
  beforeAll(() => {
    process.env.COLUMN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  });

  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue(FAKE_USER);
    transactionMock.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        injuryFlag: { deleteMany: deleteManyMock, createMany: createManyMock },
      }),
    );
  });

  it("returnerar formulärfel om area/severity/note har olika längd", async () => {
    const badFd = new FormData();
    badFd.append("area", "back");
    badFd.append("severity", "none");
    // note saknas helt — mismatch i längd
    const result = await saveInjuriesAction(INITIAL_INJURIES_STATE, badFd);
    expect(result.status).toBe("error");
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("returnerar formulärfel för okänt kroppsområde", async () => {
    const result = await saveInjuriesAction(
      INITIAL_INJURIES_STATE,
      fd([{ area: "spleen", severity: "mild", note: "" }]),
    );
    expect(result.status).toBe("error");
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("returnerar formulärfel om samma kroppsområde skickas två gånger", async () => {
    const result = await saveInjuriesAction(
      INITIAL_INJURIES_STATE,
      fd([
        { area: "back", severity: "mild", note: "" },
        { area: "back", severity: "severe", note: "" },
      ]),
    );
    expect(result.status).toBe("error");
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("replace:ar hela setet i en transaktion — deleteMany + createMany filtrerar på user.id", async () => {
    const result = await saveInjuriesAction(
      INITIAL_INJURIES_STATE,
      fd([
        { area: "back", severity: "moderate", note: "Undvik marklyft > 60 kg" },
        { area: "knee", severity: "none", note: "" },
      ]),
    );

    expect(result.status).toBe("saved");
    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(deleteManyMock).toHaveBeenCalledWith({ where: { userId: FAKE_USER.id } });
    expect(createManyMock).toHaveBeenCalledTimes(1);

    const call = createManyMock.mock.calls.at(0)?.at(0) as
      | {
          data: { userId: string; area: string; severity: string; note: Buffer | null }[];
        }
      | undefined;
    expect(call?.data).toHaveLength(2);
    for (const row of call?.data ?? []) {
      expect(row.userId).toBe(FAKE_USER.id);
    }
  });

  it("noten är AES-krypterad i databasen (inte klartext) men round-trip:as korrekt", async () => {
    const secret = "Bäckenbotten känns bättre efter rehab";
    await saveInjuriesAction(
      INITIAL_INJURIES_STATE,
      fd([{ area: "pelvic_floor", severity: "mild", note: secret }]),
    );

    const call = createManyMock.mock.calls.at(0)?.at(0) as
      { data: { note: Buffer | null }[] } | undefined;
    const stored = call?.data.at(0)?.note;
    expect(stored).toBeInstanceOf(Buffer);
    if (!stored) throw new Error("Expected encrypted note buffer");
    // Klartext ska inte synas i bufferten
    expect(stored.includes(Buffer.from(secret, "utf8"))).toBe(false);
    // Men decrypt återger exakt samma sträng
    expect(decryptColumn(stored)).toBe(secret);
  });

  it("tomma noter lagras som NULL (inte krypterad tom sträng)", async () => {
    await saveInjuriesAction(
      INITIAL_INJURIES_STATE,
      fd([{ area: "shoulder", severity: "none", note: "" }]),
    );

    const call = createManyMock.mock.calls.at(0)?.at(0) as
      { data: { note: Buffer | null }[] } | undefined;
    expect(call?.data.at(0)?.note).toBeNull();
  });

  it("IDOR-skydd: skickar man 'userId' i formData ignoreras det — sessionens id vinner", async () => {
    const attackFd = fd([{ area: "back", severity: "mild", note: "x" }]);
    attackFd.append("userId", "OTHER-USER-ID");
    attackFd.append("user_id", "OTHER-USER-ID");

    await saveInjuriesAction(INITIAL_INJURIES_STATE, attackFd);

    expect(deleteManyMock).toHaveBeenCalledWith({ where: { userId: FAKE_USER.id } });
    const call = createManyMock.mock.calls.at(0)?.at(0) as
      { data: { userId: string }[] } | undefined;
    for (const row of call?.data ?? []) {
      expect(row.userId).toBe(FAKE_USER.id);
    }
  });

  it("tomt formulär (inga entries) rensar bara utan att skapa nya rader", async () => {
    const result = await saveInjuriesAction(INITIAL_INJURIES_STATE, new FormData());
    expect(result.status).toBe("saved");
    expect(deleteManyMock).toHaveBeenCalledWith({ where: { userId: FAKE_USER.id } });
    expect(createManyMock).not.toHaveBeenCalled();
  });

  it("Prisma-fel i transaktionen returnerar formulärfel utan att kasta", async () => {
    transactionMock.mockRejectedValueOnce(new Error("deadlock"));

    const result = await saveInjuriesAction(
      INITIAL_INJURIES_STATE,
      fd([{ area: "back", severity: "mild", note: "" }]),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.formError).toBeTruthy();
    }
  });
});
