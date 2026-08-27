# ADR-008: Vercel + Supabase som hostingplattform

**Status:** Accepted
**Datum:** 2026-08-27
**Ersätter:** [ADR-002 (modulär monolit)](./002-modular-monolith.md), [ADR-003 (adaptiv motor i Python)](./003-adaptive-engine-python.md)

## Kontext

Original-planen (v0.9) förutsatte ett självförvaltat AWS-setup: ECS Fargate, RDS Postgres, ElastiCache Redis, Ory Kratos, KMS, Secrets Manager, Terraform-hanterat. Realistisk minimikostnad var ~$300/mån innan vi ens hade en användare, och en icke-teknisk produktägare kan inte förvalta det.

Produktägaren är ensam, budget-medveten och vill kunna se och redigera data själv utan att köra kod. Vi behöver en stack som:

1. Halverar minsta månadskostnad (gratis-tier tills produkt-market-fit).
2. Kräver ingen DevOps-kompetens i teamet.
3. Ger produktägaren självservice på databasnivå via en webb-UI.
4. Har EU-hemvist för hälsodata.
5. Låter oss iterera snabbt (deploy via git push).

## Beslut

**Next.js på Vercel + Supabase Postgres/Auth/Storage/Realtime, båda i EU-region.**

Följdbeslut som är oundvikliga:

- **Backend-logik** flyttar från långlivad NestJS-process till Next.js Route Handlers (Vercel Serverless Functions).
- **Adaptiv motor** implementeras i TypeScript istället för Python, körs som Vercel Serverless Function. Ren funktion, deterministisk givet input-snapshot (samma beslutsordning som ADR-003 beskrev).
- **Auth** använder Supabase Auth istället för Ory Kratos.
- **Cache** blir Upstash Redis (Vercel Marketplace) om vi behöver det, annars klarar vi oss länge med Postgres+ISR.
- **Live-klasser** blir Mux Live eller LiveKit Cloud — ingen egen SFU.
- **Terraform försvinner** — Vercel och Supabase konfigureras via deras dashboards + IaC via deras egna CLI:er om vi vill.

Alternativ vi övervägde:

- **Kvar på NestJS + Fly.io/Railway** — undviker den nu-obsoleta AWS-planen men behåller egen server som behöver förvaltas. Ingen självservice-databas. Ingen realtidsflöden ur lådan.
- **Cloudflare Workers + D1** — snarlik "serverless-first" tanke, men D1 är fortfarande under mognad för hälsodata, och Cloudflare's EU-integritet är mer opak.
- **Bygga endast med Supabase (inget Next.js)** — funkar för CRUD men vår adaptiva motor och Stripe-webhooks behöver plats för egen kod utan att ligga i browsern.

## Konsekvens

**Positivt:**

- Minsta månadskostnad går från ~$300 till ~$0 tills gratis-tier klarar av trafiken.
- Deploy sker automatiskt vid git push till main; preview-deploy per PR.
- Supabase dashboard låter produktägaren se, filtrera och redigera användardata direkt i browsern.
- Row Level Security (RLS) tvingar oss att uttrycka behörighetsregler explicit i databasen, vilket förstärker [ADR-004](./004-data-classification.md).
- `pgsodium`-extensionen ger envelope-kryptering per användare för Klass 1-data utan att vi bygger nyckelhantering själva.
- Vercel Analytics + Sentry ger observability utan konfiguration.

**Negativt:**

- Vendor-koppling till både Vercel och Supabase. Migrering framöver blir arbete, men Prisma-schema och Next.js-koden är portabel.
- Serverless har cold starts och 10s/60s timeouts. Adaptiv motor måste hålla sig inom det (utformad för det).
- Vercels prissättning trappar upp brant om trafiken exploderar innan vi hunnit reagera — kräver kostnadsövervakning.
- Vi förlorar kontroll över underliggande infra. Om Supabase har outage sitter vi utan databas.

## Referenser

- [Systemdesign v1.0](../systemdesign.md)
- [ADR-004 (data-klassning)](./004-data-classification.md) — förstärks av Supabase RLS
- [ADR-005 (Postgres för allt)](./005-postgres-for-everything.md) — Supabase levererar Postgres 16
- [ADR-006 (video off datapath)](./006-video-off-datapath.md) — Mux fortfarande giltigt
- [ADR-007 (ingen tredjeparts-analytics)](./007-no-third-party-analytics.md) — förstärks; PostHog EU + Vercel Analytics duger
