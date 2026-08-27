/**
 * Klass 1-fältnamn som aldrig får loggas i klartext (ADR-004).
 *
 * Enforcement: Pino-loggern konfigureras med dessa paths i
 * `logger.module.ts`. Enhetstestet i `redaction.spec.ts` verifierar
 * att varje fält faktiskt censoreras — inklusive nested förekomster
 * och i request-body.
 *
 * Lägg *aldrig* till ett fält här utan att också:
 *   1. Uppdatera ADR-004 om det inför en ny kategori
 *   2. Utöka testet så det nya fältet verifieras
 *
 * Klass 2 (skador, RPE, hälsomål) hanteras separat i M0-29 och
 * framåt — inte med samma hårda redaktion, utan med access-loggning.
 */
export const KLASS_1_FIELD_NAMES = [
  "cycleEntry",
  "cycle_entry",
  "symptoms",
  "flow",
  "lifeStage",
  "life_stage",
  "pregnancyStatus",
  "pregnancy_status",
] as const;

export type Klass1FieldName = (typeof KLASS_1_FIELD_NAMES)[number];

const NEST_LEVELS = 3;

/**
 * Pino redact-paths — expanderade så både top-level och nested
 * förekomster (upp till 3 nivåer djupt) samt fält i req.body,
 * req.query och req.headers alla träffas.
 */
export const REDACT_PATHS: readonly string[] = KLASS_1_FIELD_NAMES.flatMap((field) => {
  const paths: string[] = [field];
  let wildcards = "";
  for (let i = 0; i < NEST_LEVELS; i += 1) {
    wildcards += "*.";
    paths.push(`${wildcards}${field}`);
  }
  paths.push(`req.body.${field}`);
  paths.push(`req.body.*.${field}`);
  paths.push(`req.query.${field}`);
  paths.push(`req.headers.${field}`);
  return paths;
});

export const REDACT_CENSOR = "[REDACTED]";
