import { requireUser } from "@/lib/auth/require-user";
import { decryptColumnNullable } from "@/lib/crypto/column";
import { db } from "@/lib/db";
import { log } from "@/lib/log/logger";
import { getRequestId } from "@/lib/log/request-id";

/**
 * GDPR-dataexport (M0-24, M0-39, F-PR-03).
 *
 * Returnerar en JSON-fil med all data Vera lagrar om användaren.
 * Content-Disposition: attachment triggar browser-nedladdning.
 *
 * Just nu inkluderar exporten:
 *  - user (id, email, timestamps från Supabase auth.users)
 *  - profile (mål, nivå, utrustning, dagar, tid)
 *  - consent_history (hela append-only-loggen med textShown)
 *  - injury_flags (Klass 2 — note dekrypteras så användaren ser klartext
 *    av sina egna anteckningar)
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
  const logger = log.child({ requestId: await getRequestId(), route: "export", userId: user.id });

  const [profile, consents, injuryFlags] = await Promise.all([
    db.profile.findUnique({ where: { id: user.id } }),
    db.consent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    db.injuryFlag.findMany({
      where: { userId: user.id },
      orderBy: { area: "asc" },
    }),
  ]);

  const injuryFlagsExported = injuryFlags.map((row) => {
    let note: string | null = null;
    try {
      note = decryptColumnNullable(row.note);
    } catch (err) {
      logger.error("Kunde inte dekryptera injury note", { err, injuryFlagId: row.id });
    }
    return {
      id: row.id,
      area: row.area,
      severity: row.severity,
      note,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    };
  });

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
    injury_flags: injuryFlagsExported,
  };

  const filename = `vera-export-${new Date().toISOString().slice(0, 10)}.json`;

  logger.info("data export delivered", {
    profileIncluded: profile !== null,
    consentRows: consents.length,
    injuryRows: injuryFlagsExported.length,
  });

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
