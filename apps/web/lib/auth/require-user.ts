import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Hämtar inloggad Supabase-user eller redirect:ar till /login med
 * `next`-param satt så användaren skickas tillbaka efter inloggning.
 *
 * Använd i Server Components och Route Handlers som kräver auth.
 * Layouten under app/(app)/ anropar den — så alla vyer bakom
 * layouten är automatiskt skyddade.
 */
export async function requireUser(currentPath?: string): Promise<User> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = currentPath ? `?next=${encodeURIComponent(currentPath)}` : "";
    redirect(`/login${next}`);
  }

  return user;
}
