# ADR-003: Egen adaptiv motor i Python

**Status:** Superseded by [ADR-008](./008-vercel-supabase-host.md) på 2026-08-27
**Datum:** 2026-08-26

> **Superseded-not:** Vi implementerar motorn i TypeScript som Next.js Serverless Function på Vercel. Beslutsordningen (skador → livsfas → återhämtning → cykelfas → progression) är oförändrad — bara språket byter. ML-versionen (år 2+) kan fortfarande läggas som separat Python-tjänst om regel-motorn inte räcker. Original-beslutet nedan bevaras som beslutshistorik.

## Kontext

Den adaptiva träningsmotorn (C-04) är vår strategiska kärna — den gör att appen känns annorlunda för varje användare varje dag. Motorns kvalitet avgör retention. Den behöver snabb iteration, statistisk analys och senare (år 2+) ML-modeller. Om vi bakar in den i backend-monoliten binder vi dess release-takt till backendens och tappar Python-ekosystemets styrka på just periodisering och statistik.

## Beslut

**Egen tjänst, Python + FastAPI, statslös och deterministisk.**

Motorn tar en input-snapshot (cykelfas, RPE-historik, skador, wearable-signal, programkontext) och returnerar dagens pass plus ett strukturerat _reasoning-trace_ som förklarar varför.

Beslutsordning i motorn är regel-baserad först (se systemdesign §06). ML läggs på progressions-heuristiken tidigast när vi har 6 månader äkta data. Filtren (skador, livsfas) förblir regel-baserade — aldrig ML.

Alternativet — en TS-modul i monoliten — valdes bort för att låsa release-takten och för Python-ekosystemet.

## Konsekvens

**Positivt:** motorn kan itereras utan att röra backend-monoliten. A/B-testar regel-versioner via Unleash mot pass-genomförande och rapporterad känsla (aldrig mot viktförlust). Reasoning-trace ger användaren möjlighet att fråga "varför det här passet?".

**Negativt:** två språk att förvalta. Kräver att teamet har minst en person med Python-djup. Kontraktet mellan monolit och motor blir en versionerad HTTP-yta.

## Referenser

- [Systemdesign v0.9 §06](../systemdesign.md)
- Kravspec F-TR-01, F-TR-02, F-CY-02
