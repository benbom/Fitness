# ADR-002: Modulär monolit istället för mikrotjänster

**Status:** Accepted
**Datum:** 2026-08-26

## Kontext

Team &lt; 10 vid MVP-launch. Ingen skalningspress under år 1. Domänen har tydliga bounded contexts (12 st, se systemdesign §03) men de flesta har mycket lågt trafikövergångsflöde till andra.

Avvägningen: deploy-komplexitet, operativ overhead, tvingad kontraktsdesign, versionshantering — mot domäntydlighet och möjlig framtida skalning per tjänst.

## Beslut

**En NestJS-monolit + två utbrutna specialtjänster.**

Monoliten hyser Identity, Profile, Cycle, Workout Logging, Content Catalog, Wearable Sync, Community, Coaching, Billing, Notifications — som interna NestJS-moduler med tydliga gränssnitt (inte publik API).

Utbrutna från dag ett:

- **Adaptive Engine** (Python/FastAPI) — behöver egen release-takt för snabb iteration
- **Live Classes** (LiveKit SFU) — kräver egen skalning och nätverkskaraktäristik

En bounded context extraheras till egen tjänst när mätbart tvingas: mätning ska visa (a) egen skalningsbehov, (b) egen release-takt, eller (c) egen språk-/runtime-behov.

## Konsekvens

**Positivt:** låg operativ overhead nu. Ett dashboard att titta på. En release-pipeline. En databaskoppling. Refaktorering över "tjänstegränser" är ett funktionsbyte, inte en API-versionshantering.

**Negativt:** frestelsen att kortsluta modulgränser i kod. Motverkas av arkitekturregler (dependency-cruiser i CI) som förbjuder cross-modul-import av implementation, bara av kontrakt.

## Referenser

- [Systemdesign v0.9 §02, §03](../systemdesign.md)
