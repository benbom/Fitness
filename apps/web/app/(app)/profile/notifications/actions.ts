"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { log } from "@/lib/log/logger";
import { getRequestId } from "@/lib/log/request-id";
import {
  notificationCategoryKeys,
  notificationPrefsSchema,
  type NotificationCategoryKey,
} from "@/lib/validators/notification-prefs";

import type { NotificationPrefsFormState } from "./state";

/**
 * Spara notifikations-preferenser (M0-28, F-PR-05).
 *
 * Auth-guard: requireUser. Skriver till Profile.notifPrefs (JSON-fält).
 * Vi upsert:ar så användare utan Profile-rad ändå kan spara — då seedas
 * profil med defaults för övriga fält.
 *
 * IDOR-skydd: user.id kommer alltid från sessionen.
 *
 * FormData-format: varje kategori har `category[<key>].enabled` som
 * checkbox (närvarande = enabled) och `category[<key>].frequency` som
 * select. Quiet hours: `quiet_hours.enabled` checkbox + två number-fält.
 */
export async function saveNotificationPrefsAction(
  _prev: NotificationPrefsFormState,
  formData: FormData,
): Promise<NotificationPrefsFormState> {
  const user = await requireUser();
  const logger = log.child({
    requestId: await getRequestId(),
    action: "save-notif-prefs",
    userId: user.id,
  });

  const categories = {} as Record<NotificationCategoryKey, { enabled: boolean; frequency: string }>;
  for (const key of notificationCategoryKeys) {
    categories[key] = {
      enabled: formData.get(`category[${key}].enabled`) === "on",
      frequency: String(formData.get(`category[${key}].frequency`) ?? "off"),
    };
  }

  const raw = {
    categories,
    quiet_hours: {
      enabled: formData.get("quiet_hours.enabled") === "on",
      startHour: formData.get("quiet_hours.startHour"),
      endHour: formData.get("quiet_hours.endHour"),
    },
  };

  const parsed = notificationPrefsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      formError: "Ett eller flera fält har ogiltiga värden. Ladda om sidan och försök igen.",
    };
  }

  try {
    // Prisma-typerna tillåter inte att skicka en generisk JSON — vi
    // castar till Prisma.JsonObject-kompatibel struktur via unknown.
    const prefs = parsed.data as unknown as object;
    await db.profile.upsert({
      where: { id: user.id },
      create: { id: user.id, notifPrefs: prefs },
      update: { notifPrefs: prefs },
    });
  } catch (err) {
    logger.error("Prisma upsert failed", { err });
    return {
      status: "error",
      formError: "Kunde inte spara preferenserna. Kontrollera Vercel Function Logs.",
    };
  }

  revalidatePath("/profile/notifications");
  return { status: "saved" };
}
