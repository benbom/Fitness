"use server";

import { redirect } from "next/navigation";

import { passwordErrorMessage, validatePassword } from "@/lib/auth/password";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { newPasswordSchema } from "@/lib/validators/reset-password";

import type { NewPasswordFormState } from "./state";

/**
 * Server Action för att sätta nytt lösenord efter password-reset.
 *
 * Förutsätter att användaren har en aktiv recovery-session (från
 * /auth/callback som växlade recovery-token mot session). Utan session
 * returnerar Supabase fel — vi visar då tydligt felmeddelande så
 * användaren förstår att länken gått ut eller redan använts.
 *
 * Samma password-krav som signup: 12+ tecken + HIBP-koll.
 */
export async function setNewPasswordAction(
  _prev: NewPasswordFormState,
  formData: FormData,
): Promise<NewPasswordFormState> {
  const raw = { password: formData.get("password") };

  const parsed = newPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      status: "error",
      fieldErrors: { password: flat.fieldErrors.password?.[0] },
    };
  }

  const { password } = parsed.data;

  const passwordCheck = await validatePassword(password);
  if (!passwordCheck.ok) {
    return {
      status: "error",
      fieldErrors: { password: passwordErrorMessage(passwordCheck.reason) },
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.warn("[reset-new] Supabase updateUser returned error:", {
        status: error.status,
        message: error.message,
      });

      // Vanligast: session saknas eller är utgången
      return {
        status: "error",
        fieldErrors: {
          form: "Länken har gått ut eller redan använts. Begär en ny återställning.",
        },
      };
    }
  } catch (err) {
    console.error("[reset-new] Unexpected error:", err);
    return {
      status: "error",
      fieldErrors: {
        form: "Något gick fel när lösenordet skulle uppdateras.",
      },
    };
  }

  redirect("/reset-password/done");
}
