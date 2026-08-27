# Vera

Träningsapp för kvinnor 25–55, byggd runt cykel- och livsfasanpassad periodisering, styrka som första princip och en community fri från kaloriskam.

**Nuvarande fas:** M0 Fundament (v1.0 — web-först på Vercel + Supabase).

## Dokumentation

All produkt- och teknikdokumentation lever i [`docs/`](./docs).

- **[Kravspec v0.9](./docs/kravspec.md)** — marknadsanalys av 12 konkurrenter, 42 funktionella krav (MoSCoW), differentiering
- **[Systemdesign v1.0](./docs/systemdesign.md)** — arkitektur på Vercel + Supabase, bounded contexts, teknikstack
- **[Milsten M0 · Fundament](./docs/m0.md)** — nya scope efter pivot, ~35 mandagar, ~3 veckor
- **[Beslutslogg (ADR)](./docs/adr/)** — 9 arkitekturbeslut, inklusive pivot-beslut (ADR-008, ADR-009)
- **[Runbooks](./docs/runbooks/)** — deploy, rollback, incident
- **[RFC:er](./docs/rfc/)** — förslag som ännu inte är beslut

## Stack (kortversion)

- **Frontend:** Next.js 15 (App Router) på Vercel · Tailwind + shadcn/ui
- **Databas + Auth:** Supabase Postgres (EU) med Row Level Security
- **Backend-logik:** Next.js Route Handlers (Vercel Serverless Functions)
- **Betalning:** Stripe (Klarna & Swish via Stripe)
- **Video:** Mux (VOD + live)
- **CMS:** Sanity (program, artiklar, granskat innehåll)
- **Analytics:** PostHog EU + Vercel Analytics · Sentry för fel

Se [systemdesign v1.0](./docs/systemdesign.md) för fullständiga val och motiveringar.

## Arbetsflöde

Issues för aktuell milsten: [`milestone:M0`](https://github.com/benbom/Fitness/issues?q=is%3Aissue+is%3Aopen+milestone%3AM0).

## Uppstart

```bash
corepack enable
pnpm install
```

Applikations-appen (`apps/web`) tillkommer i första M0-issue efter denna pivot.
