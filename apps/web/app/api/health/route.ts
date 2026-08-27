import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

interface HealthResponse {
  status: "ok" | "degraded";
  env: string;
  version: string;
  commit: string;
  timestamp: string;
  supabase: {
    configured: boolean;
    url_host?: string;
    reachable?: boolean;
    error?: string;
  };
}

/**
 * Kombinerad liveness- och Supabase-diagnostik.
 *
 * Kollar:
 *  1. Att processen svarar
 *  2. Att NEXT_PUBLIC_SUPABASE_URL är läsbar och parseable
 *  3. Att en enkel Supabase-anrop går igenom (getUser utan session
 *     returnerar ett kontrollerat "not logged in", inte 500)
 *
 * Läcker inte nyckelvärden — bara host-delen av URL:en och yes/no
 * på reachable. Att köra denna på ett publikt endpoint är säkert.
 */
export async function GET() {
  const configured = Boolean(
    process.env["NEXT_PUBLIC_SUPABASE_URL"] && process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  );

  const response: HealthResponse = {
    status: "ok",
    env: process.env["NEXT_PUBLIC_APP_ENV"] ?? "unknown",
    version: process.env["NEXT_PUBLIC_APP_VERSION"] ?? "0.0.0",
    commit: process.env["VERCEL_GIT_COMMIT_SHA"]?.slice(0, 7) ?? "dev",
    timestamp: new Date().toISOString(),
    supabase: { configured },
  };

  const rawUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  if (rawUrl) {
    try {
      response.supabase.url_host = new URL(rawUrl).host;
    } catch {
      response.supabase.url_host = "invalid_url";
      response.status = "degraded";
    }
  }

  if (configured) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.getUser();
      // getUser() utan session returnerar error men det är förväntat.
      // Ett riktigt fel (nätverk, felaktig URL) bubblar via catch nedan.
      response.supabase.reachable = true;
      if (error && error.message !== "Auth session missing!") {
        response.supabase.error = error.message;
      }
    } catch (err) {
      response.supabase.reachable = false;
      response.supabase.error = err instanceof Error ? err.message : String(err);
      response.status = "degraded";
    }
  } else {
    response.status = "degraded";
  }

  return NextResponse.json(response, {
    status: response.status === "ok" ? 200 : 503,
  });
}
