import { NextResponse } from "next/server";

/**
 * Liveness-endpoint. Bevisar bara att processen svarar och
 * att grundläggande miljö är läsbar. Ansluter *inte* till
 * Supabase — det görs i /api/health/ready (M0-18).
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: process.env["NEXT_PUBLIC_APP_ENV"] ?? "unknown",
    version: process.env["NEXT_PUBLIC_APP_VERSION"] ?? "0.0.0",
    commit: process.env["VERCEL_GIT_COMMIT_SHA"]?.slice(0, 7) ?? "dev",
    timestamp: new Date().toISOString(),
    supabase: {
      configured: Boolean(process.env["NEXT_PUBLIC_SUPABASE_URL"]),
    },
  });
}
