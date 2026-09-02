/**
 * Strukturerad JSON-logger (M0-16, ADR-004).
 *
 * En rad = ett JSON-objekt. Vercel plockar upp stdout och parsar
 * automatiskt till strukturerade fält i deras log-viewer.
 *
 * Klass 1-fält (cycleEntry, symptoms, flow, lifeStage, pregnancyStatus)
 * REDACTAS före serialisering — även om anropande kod råkar skicka in
 * dem via context, ska de aldrig läcka till loggen. Detta är primärt
 * skydd; Sentry beforeSend är sekundärt.
 *
 * Fungerar i alla runtimes (Node + Edge) — använder bara console.*
 * och globala Date/JSON.
 */

import { scrubKlass1 } from "@/lib/sentry/scrub";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function readEnvLevel(): LogLevel {
  const raw = process.env["LOG_LEVEL"]?.toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }
  return process.env["NODE_ENV"] === "production" ? "info" : "debug";
}

let cachedMinLevel: LogLevel | null = null;

function minLevel(): LogLevel {
  if (cachedMinLevel) return cachedMinLevel;
  cachedMinLevel = readEnvLevel();
  return cachedMinLevel;
}

/** Endast för test — nollställer cachad level. */
export function _resetLoggerLevelForTest(): void {
  cachedMinLevel = null;
}

/**
 * Bygg själva JSON-rad. Håll svaret ren från exotiska värden (t.ex.
 * Error → { message, stack, name }) och scrubba Klass 1.
 */
function buildRecord(
  level: LogLevel,
  msg: string,
  boundCtx: Record<string, unknown>,
  callCtx: Record<string, unknown> | undefined,
): string {
  const merged: Record<string, unknown> = {
    level,
    ts: new Date().toISOString(),
    msg,
    ...boundCtx,
    ...(callCtx ?? {}),
  };

  // Normalisera Error → { message, stack, name } för alla top-level-fält
  for (const key of Object.keys(merged)) {
    const v = merged[key];
    if (v instanceof Error) {
      merged[key] = { name: v.name, message: v.message, stack: v.stack };
    }
  }

  const scrubbed = scrubKlass1(merged) as Record<string, unknown>;
  return JSON.stringify(scrubbed);
}

function write(level: LogLevel, line: string): void {
  // console.warn/error → stderr; övriga → stdout. Vercel klassar
  // stderr som warning oavsett innehåll så vi håller info/debug på stdout.
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export interface Logger {
  debug(msg: string, ctx?: Record<string, unknown>): void;
  info(msg: string, ctx?: Record<string, unknown>): void;
  warn(msg: string, ctx?: Record<string, unknown>): void;
  error(msg: string, ctx?: Record<string, unknown>): void;
  /** Ny logger med bundna kontext-fält som skickas med varje rad. */
  child(ctx: Record<string, unknown>): Logger;
}

function makeLogger(boundCtx: Record<string, unknown>): Logger {
  const emit = (level: LogLevel, msg: string, ctx?: Record<string, unknown>) => {
    if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[minLevel()]) return;
    write(level, buildRecord(level, msg, boundCtx, ctx));
  };

  return {
    debug: (msg, ctx) => emit("debug", msg, ctx),
    info: (msg, ctx) => emit("info", msg, ctx),
    warn: (msg, ctx) => emit("warn", msg, ctx),
    error: (msg, ctx) => emit("error", msg, ctx),
    child: (ctx) => makeLogger({ ...boundCtx, ...ctx }),
  };
}

/** Rot-loggern. Använd direkt eller `.child({ requestId })` per request. */
export const log: Logger = makeLogger({});
