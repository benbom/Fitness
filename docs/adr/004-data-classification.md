# ADR-004: Data-klassning styr allt

**Status:** Accepted
**Datum:** 2026-08-26

## Kontext

Cykel-, gravid- och symtomdata är den mest exponerade typen av användardata på marknaden. Post-Roe har cykel-appar granskats hårt av press, regulator och användare. Även i EU-marknaden är förväntningen på integritet högre för denna datatyp än för genomsnittlig hälsoapp. Vi kan inte behandla den som annan användardata utan att bygga in en risk vi inte vill ha på balansräkningen dag ett.

## Beslut

**Fyra känslighetsklasser styr schema, kryptering, loggning, backup-region, retention och åtkomst.**

| Klass             | Exempel               | Skydd                                                                              |
| ----------------- | --------------------- | ---------------------------------------------------------------------------------- |
| **1 · Kritisk**   | Cykel, gravid, symtom | Envelope-kryptering per användare. Egen KMS-nyckel. Radering < 24h. Aldrig i logg. |
| **2 · Känslig**   | Skador, RPE, hälsomål | Kolumn-kryptering. Break-glass-loggning för supportåtkomst.                        |
| **3 · Personlig** | Profil, träningslogg  | Standard at-rest-kryptering.                                                       |
| **4 · Operativ**  | Innehåll, teknik-logg | Öppen internt. Standard-backup.                                                    |

En tabell som blandar klasser är alltid ett designfel. Enforcement: kodgranskning tvingar klassning på nya entiteter. Logger-filter (M0-16) blockerar Klass 1-fält i klartext, med enhetstest som verifierar.

## Konsekvens

**Positivt:** när frågan kommer — från press, regulator eller press-släpp — har vi ett svar som är sant, kontrollerbart och kort. Ny funktionalitet som rör Klass 1 tvingas gå genom en mer noggrann granskning innan release, vilket är en feature, inte en bug.

**Negativt:** extra ceremoni vid varje ny entitet. Något högre kognitiv belastning för utvecklare. Kryptonyckelhantering är en egen operativ komponent (rotation, återställning, katastrofscenarier — se runbook).

## Referenser

- [Systemdesign v0.9 §05, §07](../systemdesign.md)
- Kravspec F-PR-03, F-PR-04
