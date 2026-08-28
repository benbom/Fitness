import "server-only";

import { headers } from "next/headers";

import { db } from "@/lib/db";

export type ConsentType = "terms_privacy" | "marketing" | "health_data";
export type ConsentAction = "granted" | "revoked";

interface LogConsentInput {
  userId: string;
  type: ConsentType;
  action: ConsentAction;
  /** Den exakta texten användaren såg. Från lib/consent/text.ts. */
  textShown: string;
  /** Var samtycket registrerades: 'signup', 'settings', 'privacy_banner' osv. */
  screenId: string;
}

/**
 * Lägger en rad i append-only consent-loggen.
 *
 * Aldrig UPDATE eller DELETE — revoke är en ny rad med action='revoked'.
 * Fångar user-agent från headers om vi är i en request-kontext,
 * annars null.
 *
 * Fail-behavior: kastar vid db-fel så anroparen kan välja att stoppa
 * flödet (t.ex. signup). Anroparen bör wrappa i try/catch om samtycket
 * inte är kritiskt för det pågående flödet (t.ex. loggning kan misslyckas
 * utan att signup rullar tillbaka — vi vill inte förlora ett skapat konto).
 */
export async function logConsent(input: LogConsentInput): Promise<void> {
  let userAgent: string | null = null;
  try {
    const h = await headers();
    userAgent = h.get("user-agent");
  } catch {
    // Utanför request-kontext (t.ex. batch-jobb) — inte fatalt
  }

  await db.consent.create({
    data: {
      userId: input.userId,
      type: input.type,
      action: input.action,
      textShown: input.textShown,
      screenId: input.screenId,
      userAgent,
    },
  });
}
