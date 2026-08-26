import { Module } from "@nestjs/common";

/**
 * Bounded context C-01 — Identity & Access.
 *
 * Ansvar: konton, sessions, MFA, consent-loggning, dataexport, radering.
 * Backas av Ory Kratos + Hydra (self-hosted i EU) enligt ADR-002 och
 * systemdesign §03. Denna monolit-modul agerar tunn fasad ovanpå Ory.
 *
 * Skarp implementering börjar i M0-19 (Deploy Ory Kratos + Hydra) och
 * fylls på genom M0-20…M0-25.
 */
@Module({})
export class IdentityModule {}
