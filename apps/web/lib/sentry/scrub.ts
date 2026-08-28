/**
 * Klass 1-fältnamn som aldrig får skickas till Sentry (ADR-004).
 *
 * Sentry-events (både klient och server) kan innehålla fetch-payloads,
 * form-data, request-bodies etc. som råkar bära känslig data. Vi
 * scrubbrar alla dessa fält i beforeSend-hooken.
 *
 * Håll listan i sync med apps/web/... när Klass 1-fält tillkommer i
 * datamodellen (t.ex. i M2 när cycle-tabellen kommer).
 */
export const KLASS_1_FIELDS = new Set([
  "cycleEntry",
  "cycle_entry",
  "symptoms",
  "flow",
  "lifeStage",
  "life_stage",
  "pregnancyStatus",
  "pregnancy_status",
]);

const REDACTED = "[REDACTED]";

/**
 * Djupt scrubba objekt och strängar. Rekursivt.
 * Fält vars nyckel finns i KLASS_1_FIELDS ersätts med [REDACTED].
 * Strängar som innehåller känsliga URL-mönster (t.ex. tokens i query)
 * lämnas dock orörda — Sentry hanterar dem via default-scrubbers.
 */
export function scrubKlass1(value: unknown, depth = 0): unknown {
  if (depth > 6 || value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((v) => scrubKlass1(v, depth + 1));
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (KLASS_1_FIELDS.has(key)) {
        result[key] = REDACTED;
      } else {
        result[key] = scrubKlass1(val, depth + 1);
      }
    }
    return result;
  }

  return value;
}
