# ADR-005: Postgres för allt vi äger

**Status:** Accepted
**Datum:** 2026-08-26

## Kontext

Det finns en frestelse att införa en dokumentdatabas för semi-strukturerat innehåll, en tidsseriedatabas för wearable-data, en grafdatabas för community-relationer. Varje ny databas är en ny operativ komponent, ny säkerhetsdomän, ny backup-rutin och en ny sak för teamet att kunna på djupet.

## Beslut

**Postgres 16 tills mätbar smärta.**

- JSONB för semi-strukturerat innehåll (notif_prefs, phase_map, reasoning-trace)
- Row-level security för åtkomstkontroll per användare
- Separata scheman per känslighetsklass enligt ADR-004
- TimescaleDB-extension om tidsseriebehov uppstår (wearable-data, RPE-trender)
- pgvector om ML-funktioner kräver embeddings (år 2+)
- Full-text search via Postgres tsvector innan vi når för Elasticsearch

Skala vertikalt först. Sharding är sista utvägen, inte första reaktionen.

## Konsekvens

**Positivt:** en operativ komponent att kunna djupt. En backup-strategi. En säkerhetsdomän. En performance-modell. Ett query-språk. Postgres är beprövat för 10M+ användare med rätt setup.

**Negativt:** vi måste vara disciplinerade när frestelsen att införa en annan store dyker upp — kräva mätdata som visar Postgres inte räcker, inte anta det. Vissa specialistmönster (graf-traversering på djupet) blir mindre eleganta.

Extraktion av en tabell till egen store är alltid möjlig senare. Att slå ihop två stores är dyrare.

## Referenser

- [Systemdesign v0.9 §04](../systemdesign.md)
