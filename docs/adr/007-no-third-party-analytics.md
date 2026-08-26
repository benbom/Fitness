# ADR-007: Ingen tredjeparts-analytics i klienten

**Status:** Accepted
**Datum:** 2026-08-26

## Kontext

Google Analytics, Meta Pixel, TikTok Pixel och liknande SDK:er skickar användarens beteende — inklusive skärm-URL, klickmönster och kontext — till annonssystem. För en app som hanterar cykel-, gravid- och hälsodata (Klass 1 enligt ADR-004) är detta en oacceptabel läcka, även om själva Klass 1-fältet inte skickas. En URL som `/pregnancy/week-24` läcker allt en annonssortering behöver.

Detta är inte en teoretisk risk — press- och regulatorgranskning av cykel-appar har upprepade gånger pekat på exakt detta mönster. Vi kan inte hävda vår positionering och samtidigt tanka den datan till annonsnätverk.

## Beslut

**Ingen tredjeparts-analytics eller marknadsförings-SDK i mobil eller web.**

- **Egen analytics**: PostHog self-hosted i EU. Alla events, funnel-analys, cohort-analys sker mot vår egen instans.
- **Attribution**: server-side via reklamnätverkens conversion-API:er (Meta CAPI, Google Enhanced Conversions) — utan pixel i klienten. Attribution-signalen är utgående, aldrig data-läcka in.
- **Crash reporting**: Sentry med aggressiv PII-scrubbing för hälsorelaterade fält.
- **Debug/support**: aldrig med tredjepartsdrivna session-replay-verktyg.

## Konsekvens

**Positivt:** vår positionering blir sann i praktiken, inte bara i marknadsföring. En transparent integritetspolicy vi kan stå bakom. Skydd mot regulatorisk risk och press-negativt narrativ.

**Negativt:** sämre attribution-precision för betald tillväxt. Något dyrare CAC eftersom vi måste modellera attribution istället för att köpa den. Kompenseras av positionering och organisk tillväxt via förtroende.

Undantaget: server-till-server-integrationer med annonsnätverk för konvertering får byggas, med tydlig samtycke, utan att någon PII kopplad till Klass 1 eller Klass 2 skickas.

## Referenser

- [Systemdesign v0.9 §07](../systemdesign.md)
- [ADR-004](./004-data-classification.md)
- Kravspec: differentierings-punkt 3 & 4
