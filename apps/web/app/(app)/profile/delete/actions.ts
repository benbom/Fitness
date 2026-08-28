"use server";

import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
import { logConsent } from "@/lib/consent/log";
import { db } from "@/lib/db";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteAccountSchema } from "@/lib/validators/delete-account";

import type { DeleteAccountFormState } from "./state";

/**
 * Radera eller anonymisera kontot.
 *
 * Två vägar:
 *
 * 'delete' — hard delete via Supabase Admin API.
 *   auth.users(id) raderas, vår FK CASCADE tar bort profile + consent.
 *   Ingen spårbar historik kvar. Signerad rapport-mail skickas senare (M0+).
 *
 * 'anonymize' — behåller kontot men strippar allt personifierbart.
 *   E-post byts till anonymized-{uuid}@vera.local.
 *   Profil raderas explicit (FK CASCADE triggas inte utan user-delete).
 *   Sista consent-raden loggas med action=revoked så audit finns kvar.
 *   Använd om produkt-teamet vill behålla aggregerad statistik.
 *
 * Efter respektive väg loggar vi ut och redirect:ar till /goodbye.
 */
export async function deleteAccountAction(
  _prev: DeleteAccountFormState,
  formData: FormData,
): Promise<DeleteAccountFormState> {
  const user = await requireUser();

  const parsed = deleteAccountSchema.safeParse({
    action: formData.get("action"),
    confirmation: formData.get("confirmation"),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      status: "error",
      fieldErrors: {
        action: flat.fieldErrors.action?.[0],
        confirmation: flat.fieldErrors.confirmation?.[0],
      },
    };
  }

  const { action } = parsed.data;
  const admin = createSupabaseAdminClient();

  try {
    if (action === "delete") {
      // Hard delete — FK CASCADE tar hand om profile + consent
      const { error } = await admin.auth.admin.deleteUser(user.id);
      if (error) throw error;
      console.info("[account] Hard-deleted user", { userId: user.id });
    } else {
      // Anonymize — behåll kontot men strippa personifierbart
      const anonymizedEmail = `anonymized-${randomUUID()}@vera.local`;

      // 1) Byt e-post via admin API
      const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, {
        email: anonymizedEmail,
        user_metadata: { anonymized_at: new Date().toISOString() },
      });
      if (updateErr) throw updateErr;

      // 2) Radera profilrad explicit (FK CASCADE triggas inte utan user-delete)
      await db.profile.deleteMany({ where: { id: user.id } });

      // 3) Logga att samtycket dragits tillbaka (audit trail)
      try {
        await logConsent({
          userId: user.id,
          type: "terms_privacy",
          action: "revoked",
          textShown: "[account anonymized by user]",
          screenId: "profile_delete",
        });
      } catch (logErr) {
        console.error("[account] Failed to log revoke consent (non-fatal):", logErr);
      }

      console.info("[account] Anonymized user", { userId: user.id });
    }
  } catch (err) {
    console.error("[account] Deletion failed:", err);
    return {
      status: "error",
      fieldErrors: {
        form: "Kontot kunde inte raderas. Detaljer finns i Vercel Function Logs.",
      },
    };
  }

  // Rensa session-cookies (för anonymize spelar det roll — för hard delete
  // är kontot redan borta men vi vill inte att browsern håller kvar en död JWT).
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("[account] signOut after deletion failed (non-fatal):", err);
  }

  redirect("/goodbye");
}
