"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { encryptColumnNullable } from "@/lib/crypto/column";
import { db } from "@/lib/db";
import { injuriesInputSchema, injuryAreaEnum, injurySeverityEnum } from "@/lib/validators/injury";

import type { InjuriesFormState } from "./state";

/**
 * Sparar användarens injury-flaggor (M0-29, Klass 2).
 *
 * Auth-guard via requireUser(). ALLA writes filtreras på user.id från
 * sessionen — vi läser aldrig user_id från formData. `note` krypteras
 * med AES-256-GCM innan den når Prisma.
 *
 * Vi replace:ar hela setet i en transaktion: enklaste modellen för
 * ett formulär som redigerar alla områden på en sida. Audit-trigger
 * skriver DELETE- och INSERT-rader — hela ändringshistoriken syns
 * i injury_flag_audit oavsett vad application-koden gör.
 */
export async function saveInjuriesAction(
  _prev: InjuriesFormState,
  formData: FormData,
): Promise<InjuriesFormState> {
  const user = await requireUser();

  // FormData har paralleller på areas[]/severities[]/notes[] i samma index.
  const areas = formData.getAll("area").filter((v): v is string => typeof v === "string");
  const severities = formData.getAll("severity").filter((v): v is string => typeof v === "string");
  const notes = formData.getAll("note").filter((v): v is string => typeof v === "string");

  if (areas.length !== severities.length || areas.length !== notes.length) {
    return {
      status: "error",
      formError: "Formuläret har blandad längd på fälten — ladda om sidan och försök igen.",
    };
  }

  const raw = {
    entries: areas.map((area, i) => ({
      area,
      severity: severities[i],
      note: notes[i],
    })),
  };

  const parsed = injuriesInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      formError: "Ett eller flera fält har ogiltiga värden.",
    };
  }

  const seenAreas = new Set<string>();
  const rows: {
    area: ReturnType<typeof injuryAreaEnum.parse>;
    severity: ReturnType<typeof injurySeverityEnum.parse>;
    note: Buffer | null;
  }[] = [];
  for (const entry of parsed.data.entries) {
    if (seenAreas.has(entry.area)) {
      return {
        status: "error",
        formError: "Samma kroppsområde förekommer flera gånger i formuläret.",
      };
    }
    seenAreas.add(entry.area);
    rows.push({
      area: injuryAreaEnum.parse(entry.area),
      severity: injurySeverityEnum.parse(entry.severity),
      note: encryptColumnNullable(entry.note),
    });
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.injuryFlag.deleteMany({ where: { userId: user.id } });
      if (rows.length > 0) {
        await tx.injuryFlag.createMany({
          data: rows.map((r) => ({ ...r, userId: user.id })),
        });
      }
    });
  } catch (err) {
    console.error("[injuries] Prisma transaction failed:", err);
    return {
      status: "error",
      formError: "Kunde inte spara skade-flaggorna. Kontrollera Vercel Function Logs.",
    };
  }

  revalidatePath("/profile/injuries");
  return { status: "saved" };
}
