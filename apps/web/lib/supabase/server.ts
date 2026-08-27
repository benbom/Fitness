import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

import type { Database } from "./types";

/**
 * Supabase-klient för Server Components och Route Handlers.
 *
 * Läser session-cookies via next/headers. Sessionens *förnyelse* sker
 * däremot i middleware (se `middleware.ts` och `./middleware.ts`);
 * försök att sätta cookies från en Server Component är silent no-op
 * eftersom Next.js inte tillåter det utanför Route Handlers / Server Actions.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL eller NEXT_PUBLIC_SUPABASE_ANON_KEY saknas. Kontrollera Vercel Environment Variables eller .env.local.",
    );
  }

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Anropad från Server Component — Next.js tillåter inte set() här.
          // Middleware sköter session-refresh; detta är en tystad no-op.
        }
      },
    },
  });
}
