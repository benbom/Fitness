"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Signout Server Action. Städar Supabase-session-cookies via
 * @supabase/ssr och redirect:ar till startsidan.
 *
 * Fail-open: en Supabase-error under signOut ska inte fastna
 * användaren i inloggat läge — vi rensar cookies genom att alltid
 * anropa signOut, loggar eventuellt fel, och redirect:ar.
 */
export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn("[logout] Supabase signOut returned error:", {
        status: error.status,
        message: error.message,
      });
    }
  } catch (err) {
    console.error("[logout] Unexpected error:", err);
  }
  redirect("/");
}
