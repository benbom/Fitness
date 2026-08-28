import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";

/**
 * GDPR-dataexport (M0-24, F-PR-03).
 *
 * Returnerar en JSON-fil med all data Vera lagrar om användaren.
 * Content-Disposition: attachment triggar browser-nedladdning.
 *
 * Just nu inkluderar exporten:
 *  - user (id, email, timestamps från Supabase auth.users)
 *  - profile (mål, nivå, utrustning, dagar, tid)
 *  - consent_history (hela append-only-loggen med textShown)
 *
 * När fler tabeller läggs till (cykel, träningslogg, wearable-sync)
 * utökas payload:en här. Regel: allt användaren äger i vår databas
 * ska med i exporten — även Klass 1-data (efter dekryptering).
 *
 * Prisma bypassar RLS. Auth-guard i requireUser + explicit filtrering
 * på user.id är primärt skydd. Aldrig acceptera user-id från
 * request-query (även om det är samma användare).
 */
export async function GET() {
  const user = await requireUser("/profile/data");

  const [profile, consents] = await Promise.all([
    db.profile.findUnique({ where: { id: user.id } }),
    db.consent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const payload = {
    meta: {
      exported_at: new Date().toISOString(),
      vera_version: process.env["NEXT_PUBLIC_APP_VERSION"] ?? "0.0.0",
      commit: process.env["VERCEL_GIT_COMMIT_SHA"]?.slice(0, 7) ?? "dev",
      notice:
        "Denna fil innehåller all data Vera lagrar om dig. Källkoden som producerar exporten finns på github.com/benbom/Fitness.",
    },
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
    },
    profile,
    consent_history: consents,
  };

  const filename = `vera-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
