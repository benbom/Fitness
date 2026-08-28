import "server-only";

import { PrismaClient } from "@prisma/client";

/**
 * Prisma-klient singleton för Next.js.
 *
 * Vid dev + hot-reload skapar Next.js nya modul-instanser flera gånger,
 * vilket utan singleton skulle skapa en ny Prisma-anslutning per omladdning
 * och snabbt slå i Postgres connection-pool. Vi lagrar därför klienten på
 * globalThis så samma instans återanvänds.
 *
 * Loggnivå:
 *  - production: bara error (håll loggarna rena för Sentry/Axiom)
 *  - annat:      query, error, warn (bra för debugging lokalt)
 *
 * OBS: `query`-loggen visar SQL med parametrar. Klass 1-data (cykel, gravid,
 * symtom) får aldrig loggas i klartext (ADR-004). När vi börjar skriva till
 * dessa tabeller måste vi verifiera att Prisma-log-nivån är "error" i produktion,
 * eller flytta till en custom logger som redaktar känsliga fält.
 *
 * Filen är markerad `server-only` så en oavsiktlig client-import failar vid build.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env["NODE_ENV"] === "production" ? ["error"] : ["query", "error", "warn"],
  });

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = db;
}
