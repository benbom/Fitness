"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { log } from "@/lib/log/logger";
import { getRequestId } from "@/lib/log/request-id";
import { equipmentEnum, goalEnum, levelEnum, profileSchema } from "@/lib/validators/profile";

import type { ProfileFormState } from "./state";

/**
 * Sparar användarens profil.
 *
 * Auth-guard: requireUser() kastar redirect till /login om sessionen
 * saknas. Filtrerar ALLTID på user.id från servern — vi litar aldrig
 * på ett användar-id som kommer in via formData (den enda id:n vi
 * accepterar är Supabase-sessionens).
 *
 * RLS är påslaget på tabellen som defense-in-depth, men Prisma
 * kör som postgres-user och bypassar RLS — därför är
 * application-lager-filtrering primärt skydd här.
 */
export async function saveProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireUser();
  const logger = log.child({
    requestId: await getRequestId(),
    action: "save-profile",
    userId: user.id,
  });

  // FormData ger back sträng/File — vi konverterar till arrays för multi-value fält
  const raw = {
    goals: formData.getAll("goals").filter((v): v is string => typeof v === "string"),
    level: formData.get("level"),
    equipment: formData.getAll("equipment").filter((v): v is string => typeof v === "string"),
    daysPerWeek: formData.get("daysPerWeek"),
    timePerSession: formData.get("timePerSession"),
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      status: "error",
      fieldErrors: {
        goals: flat.fieldErrors.goals?.[0],
        level: flat.fieldErrors.level?.[0],
        equipment: flat.fieldErrors.equipment?.[0],
        daysPerWeek: flat.fieldErrors.daysPerWeek?.[0],
        timePerSession: flat.fieldErrors.timePerSession?.[0],
      },
    };
  }

  // Zod-enums bär över exakta värden till Prisma-enums via string-match
  const data = {
    goals: parsed.data.goals.map((g) => goalEnum.parse(g)),
    level: levelEnum.parse(parsed.data.level),
    equipment: parsed.data.equipment.map((e) => equipmentEnum.parse(e)),
    daysPerWeek: parsed.data.daysPerWeek,
    timePerSession: parsed.data.timePerSession,
  };

  try {
    await db.profile.upsert({
      where: { id: user.id },
      create: { id: user.id, ...data },
      update: data,
    });
  } catch (err) {
    logger.error("Prisma upsert failed", { err });
    return {
      status: "error",
      fieldErrors: {
        form: "Kunde inte spara profilen. Kontrollera Vercel Function Logs.",
      },
    };
  }

  revalidatePath("/");
  revalidatePath("/profile/setup");

  return { status: "saved" };
}
