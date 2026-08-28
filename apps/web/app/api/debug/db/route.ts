import { NextResponse } from "next/server";

import { db } from "@/lib/db";

/**
 * Diagnostik för Prisma <-> Supabase Postgres.
 *
 * Läcker aldrig lösenord. Exponerar bara host, port, om URL:en pekar
 * mot pooler eller direct-connection, samt om Prisma faktiskt kan
 * ansluta.
 *
 * Tas bort så snart profile-flödet fungerar.
 */

interface UrlInfo {
  host?: string;
  port?: number;
  uses_pooler?: boolean;
  has_pgbouncer_param?: boolean;
  raw_scheme?: string;
  parse_error?: string;
}

function extractUrlInfo(rawUrl: string | undefined): UrlInfo {
  if (!rawUrl) return { parse_error: "not set" };
  try {
    const parsed = new URL(rawUrl);
    return {
      raw_scheme: parsed.protocol.replace(":", ""),
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : undefined,
      uses_pooler: parsed.hostname.includes(".pooler.supabase.com"),
      has_pgbouncer_param: parsed.searchParams.get("pgbouncer") === "true",
    };
  } catch (err) {
    return { parse_error: err instanceof Error ? err.message : String(err) };
  }
}

export async function GET() {
  const databaseUrl = extractUrlInfo(process.env["DATABASE_URL"]);
  const directUrl = extractUrlInfo(process.env["DIRECT_URL"]);

  let prismaConnectOk: boolean | undefined;
  let prismaError: string | undefined;
  try {
    // SELECT 1 — enklaste möjliga query. Om Prisma kan svara är
    // connection ok och tabeller är åtkomliga för postgres-user.
    await db.$queryRaw`SELECT 1 AS ok`;
    prismaConnectOk = true;
  } catch (err) {
    prismaConnectOk = false;
    prismaError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(
    {
      database_url: databaseUrl,
      direct_url: directUrl,
      prisma: {
        connect_ok: prismaConnectOk,
        error: prismaError,
      },
      recommended: {
        DATABASE_URL:
          "Transaction Pooler — host slutar på .pooler.supabase.com, port 6543, ?pgbouncer=true",
        DIRECT_URL:
          "Session Pooler — host slutar på .pooler.supabase.com, port 5432, ingen pgbouncer-param",
      },
    },
    { status: prismaConnectOk ? 200 : 503 },
  );
}
