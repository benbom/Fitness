import { Module } from "@nestjs/common";

/**
 * Bounded context C-02 — Profile & Preferences.
 *
 * Ansvar: mål, nivå, utrustning, dagar per vecka, notif-preferenser,
 * skade- och kontraindikationsflaggor. Klass 2-data för skador (ADR-004).
 *
 * Skarp implementering börjar i M0-26 (Profile-modell + migrations)
 * och fylls på genom M0-27…M0-29.
 */
@Module({})
export class ProfileModule {}
