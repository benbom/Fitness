import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "./types";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * Refreshar Supabase-sessionen vid varje HTTP-request som matchar
 * `middleware.ts`-mönstret. Utan detta blir sessioner "frostade" —
 * användaren är fortfarande inloggad enligt localStorage men servern
 * ser en utgången JWT och nekar allt bakom RLS.
 *
 * Defensiv posture: alla anrop mot Supabase wrappas i try/catch och
 * loggas till Vercel Function Logs vid fel. En Supabase-outage får
 * inte 500:a hela appen — den ska bara innebära att session inte
 * refreshas den requesten (användaren märker inget om sessionen ännu
 * inte är utgången).
 */
export async function updateSupabaseSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  try {
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

    const { error } = await supabase.auth.getUser();
    if (error && error.message !== "Auth session missing!") {
      console.warn("[middleware] Supabase getUser returned error:", {
        status: error.status,
        message: error.message,
      });
    }
  } catch (err) {
    console.error("[middleware] Unexpected error refreshing session:", err);
  }

  return supabaseResponse;
}
