"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";

/**
 * Supabase-klient för Client Components.
 *
 * Använder `NEXT_PUBLIC_*`-vars som bakas in i browser-buntet vid build.
 * Session-cookien läses och skrivs automatiskt av `@supabase/ssr` i sync
 * med middleware-refreshen.
 *
 * Skapa en instans lokalt i den komponent som behöver den — den är billig,
 * behöver inte cachas globalt.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env["NEXT_PUBLIC_SUPABASE_URL"] as string,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] as string,
  );
}
