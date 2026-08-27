import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

/**
 * Service-role Supabase-klient.
 *
 * **Får endast användas server-side** — service-role-nyckeln kringgår
 * Row Level Security och läcker den skulle exponera hela databasen.
 * Filen är markerad med `server-only` så en oavsiktlig import från
 * client-kod misslyckas hårt vid build.
 *
 * Använd för:
 *  - Stripe-webhooks som behöver skriva som annan användare
 *  - Kontoradering och GDPR-export (M0-24, M0-25)
 *  - Adaptiv motor som läser data för alla användare
 *
 * Ska aldrig användas för att servera ett vanligt anrop från browsern.
 * Använd `createSupabaseServerClient()` för det — den respekterar RLS.
 */
let cachedAdminClient: SupabaseClient<Database> | null = null;

export function createSupabaseAdminClient(): SupabaseClient<Database> {
  if (cachedAdminClient) return cachedAdminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase admin-klient saknar konfiguration. Sätt NEXT_PUBLIC_SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY i Vercel Environment Variables (Production + Preview).",
    );
  }

  cachedAdminClient = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return cachedAdminClient;
}
