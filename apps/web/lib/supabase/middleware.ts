import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

import type { Database } from "./types";

/**
 * Refreshar Supabase-sessionen vid varje HTTP-request som matchar
 * `middleware.ts`-mönstret. Utan detta blir sessioner "frostade" —
 * användaren är fortfarande inloggad enligt localStorage men servern
 * ser en utgången JWT och nekar allt bakom RLS.
 *
 * `supabase.auth.getUser()` triggar en revalidation mot Supabase.
 * Om den lyckas: uppdaterade cookies attacheras på response.
 * Om den misslyckas: cookies rensas och användaren skickas till login
 * (den logiken läggs till i #20 när auth-flödena kommer).
 */
export async function updateSupabaseSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Utan konfiguration låter vi requesten gå igenom oförändrad.
    // Runtime-fel triggas då senare av server- eller client-klienten.
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Måste anropas — Supabase-SSR-mönstret bygger på att getUser() triggar
  // cookie-refresh när JWT är nära utgång.
  await supabase.auth.getUser();

  return supabaseResponse;
}
