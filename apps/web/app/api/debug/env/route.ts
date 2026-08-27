import { NextResponse } from "next/server";

/**
 * Diagnostik-endpoint: listar bara NAMN på env-vars som är läsbara
 * i denna Server Runtime, inte deras värden. Används för att verifiera
 * att Vercel Environment Variables faktiskt når appen efter deploy.
 *
 * Läcker aldrig värden. Även om denna endpoint är publik kan den bara
 * bekräfta vilka nycklar som finns, inte innehållet.
 *
 * Tas bort så snart signup-flödet fungerar (spårat i uppföljande PR).
 */

const KNOWN_NEXT_PUBLIC = [
  "NEXT_PUBLIC_APP_ENV",
  "NEXT_PUBLIC_APP_VERSION",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "NEXT_PUBLIC_POSTHOG_HOST",
] as const;

const KNOWN_SERVER = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "DIRECT_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "MUX_TOKEN_ID",
  "MUX_TOKEN_SECRET",
  "SANITY_API_TOKEN",
  "RESEND_API_KEY",
  "SENTRY_DSN",
  "SENTRY_AUTH_TOKEN",
] as const;

const KNOWN_SYSTEM = [
  "NODE_ENV",
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_REGION",
  "VERCEL_GIT_COMMIT_SHA",
  "VERCEL_GIT_COMMIT_REF",
  "VERCEL_GIT_PROVIDER",
  "VERCEL_GIT_REPO_SLUG",
] as const;

function check(names: readonly string[]) {
  return Object.fromEntries(names.map((n) => [n, Boolean(process.env[n]?.length)]));
}

export async function GET() {
  const allEnvKeys = Object.keys(process.env).sort();
  const nextPublicKeysActuallyPresent = allEnvKeys.filter((k) => k.startsWith("NEXT_PUBLIC_"));

  return NextResponse.json({
    runtime: {
      total_env_var_count: allEnvKeys.length,
      next_public_keys_present: nextPublicKeysActuallyPresent,
    },
    expected: {
      next_public: check(KNOWN_NEXT_PUBLIC),
      server: check(KNOWN_SERVER),
      system: check(KNOWN_SYSTEM),
    },
    note: "Endpointen visar bara nycklarnas närvaro, aldrig värdena. Tas bort när diagnosen är klar.",
  });
}
