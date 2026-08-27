# Systemdesign — Vera v1.0

**Status:** Aktiv
**Datum:** 2026-08-27
**Ersätter:** v0.9 (AWS + NestJS-baserad, se git-historik för commit `1c6329d`)
**Refererar:** [Kravspec v0.9](./kravspec.md)

## Vad ändrades från v0.9

Vi pivoterade från en självförvaltad AWS-stack (ECS, RDS, Ory Kratos) till **Vercel + Supabase**. Kravspecen är oförändrad — bara hur vi levererar den ändras.

Skäl: produktägaren är ensam, budget-medveten och vill kunna se/redigera data själv utan att köra kod. Vercel + Supabase halverar time-to-launch, sänker minsta månadskostnaden från ~$300 till ~$0, och ger en webbaserad admin-UI för databasen.

Vi lanserar **webb-först** (browser, funkar på mobil) och evaluerar mobilnativ eller React Native efter first-100-users.

## Designprinciper

1. **Offline-first när det räknas.** Pass-loggning i browsern via IndexedDB, sync mot Supabase. Övrigt kan vara online-first.
2. **Supabase-first, Next.js API när det behövs.** Klient talar direkt mot Supabase när Row Level Security räcker som skydd. Route Handlers på Vercel för det som RLS inte kan uttrycka (Stripe-webhooks, adaptiv motor, tredjeparts-integrationer).
3. **Känslig data har egna regler.** Klass 1-data (cykel, gravid, symtom) skyddas av RLS + `pgsodium`-kryptering. Aldrig i vanliga tabeller ihop med marknadsföringsdata.
4. **Innehåll är en produkt.** Övningar, program, artiklar bor i Sanity CMS. Klienten hämtar manifest, aldrig hårdkodade IDn.
5. **Bygg tråkigt.** Postgres framför exotiska stores. React framför nya ramverk. Nyfikenhet i den adaptiva motorn — inte i infra.

## Bounded contexts

Oförändrade från v0.9 — vad kontextet ansvarar för är oberoende av leverantör. Implementering flyttar dock hem.

| ID   | Namn                        | Klass    | Ny hemvist                                                       |
| ---- | --------------------------- | -------- | ---------------------------------------------------------------- |
| C-01 | Identity & Access           | Generic  | Supabase Auth + Next.js Route Handler för consent-logg           |
| C-02 | Profile & Preferences       | Support  | Supabase-tabell + RLS                                            |
| C-03 | Cycle & Health              | **Core** | Supabase-tabell + RLS + `pgsodium`-kryptering per användare      |
| C-04 | Adaptive Engine             | **Core** | Vercel Serverless Function (TypeScript, port från Python-planen) |
| C-05 | Workout Execution & Logging | **Core** | Supabase-tabell + IndexedDB-cache i klient                       |
| C-06 | Content Catalog             | Support  | Sanity CMS (oförändrat)                                          |
| C-07 | Wearable Sync               | Support  | Next.js Route Handlers för webhooks + OAuth-callbacks            |
| C-08 | Community & Moderation      | **Core** | Supabase Realtime + moderations-kö-tabell                        |
| C-09 | Coaching & Messaging        | Support  | Supabase Realtime + tabell                                       |
| C-10 | Live Classes                | Support  | Mux Live embed på Next.js-sida                                   |
| C-11 | Billing & Subscription      | Generic  | Stripe + Next.js webhook route                                   |
| C-12 | Notifications               | Generic  | Resend (e-post) + web push via VAPID                             |

## Teknikstack v1.0

| Lager             | Val                                          | Motivering                                                               |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| Web-klient        | Next.js 15 (App Router) + React 19           | Vercel-native, SSR-vänligt, snabb SEO för content-sidor                  |
| UI-komponenter    | Tailwind CSS 4 + shadcn/ui                   | Design-tokens vi äger, ingen tredjepart tar över look-and-feel           |
| Databas           | Supabase Postgres (EU-central-1 / Frankfurt) | Managed, RLS, pgsodium-kryptering, admin-UI                              |
| ORM               | Prisma 5                                     | Migrations-pipeline, typad datamodell                                    |
| Auth              | Supabase Auth                                | Email/password, TOTP MFA, magic-links, OAuth. Sessioner via cookies      |
| Backend logik     | Next.js Route Handlers på Vercel             | Serverless, EU-region, ingen egen infra                                  |
| Adaptiv motor     | Next.js Serverless Function (TS)             | Deterministisk, regel-baserad. ML läggs som separat tjänst om det behövs |
| Realtidsflöden    | Supabase Realtime                            | Community-chat, live-class-state, coach-meddelanden                      |
| Filstorage        | Supabase Storage                             | Export-PDF:er, ev framtida CV för coaches                                |
| Video (VOD)       | Mux                                          | Adaptiv bitrate, DRM, direkt klient↔CDN                                  |
| Video (live)      | Mux Live eller LiveKit Cloud                 | Managed, ingen egen SFU att drifta                                       |
| CMS               | Sanity                                       | Bra editor-UX för tränare och medicinska granskare                       |
| Betalning         | Stripe (Klarna & Swish via Stripe)           | Global + nordisk konvertering                                            |
| E-post            | Resend                                       | Developer-first, EU-region, transactional + broadcast                    |
| Feature flags     | Vercel Flags SDK                             | Native integration, edge-evaluerat, ingen extern feature-data            |
| Product analytics | PostHog EU (self-hosted eller cloud EU)      | Egen data, funnels, cohorts. Ingen tredjepartspixel                      |
| Web analytics     | Vercel Analytics                             | Core Web Vitals utan cookies                                             |
| Fel-tracking      | Sentry                                       | Klient- och server-fel, source maps                                      |
| Log-aggregering   | Axiom (EU) eller Vercel Logs + Better Stack  | Sökbar historik för Route Handlers                                       |
| CI/CD             | GitHub Actions + Vercel auto-deploy          | Preview-deploy per PR                                                    |
| Monorepo          | Turborepo + pnpm 9                           | Delad kod mellan web nu och mobile senare                                |

## Datamodell — känslighetsklassning (bevarad från v0.9)

| Klass             | Exempel               | Skydd i Supabase                                                                                                       |
| ----------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **1 · Kritisk**   | Cykel, gravid, symtom | RLS: endast ägaren + service_role. `pgsodium`-krypterade kolumner med per-user datakryptonyckel. Aldrig i publik view. |
| **2 · Känslig**   | Skador, RPE, hälsomål | RLS: endast ägaren. Access-loggning via Postgres audit-logg.                                                           |
| **3 · Personlig** | Profil, träningslogg  | RLS: endast ägaren + service_role. Standard at-rest-kryptering (Supabase-hanterad).                                    |
| **4 · Operativ**  | Innehåll, teknik-logg | Öppen internt via service_role.                                                                                        |

En tabell som blandar klasser är fortfarande ett designfel.

## Web-först lanseringsstrategi

Fas 1: **Next.js webbapp** på Vercel. Alla funktioner i browsern. Fungerar på mobil-safari/chrome. PWA-installation möjlig (app-liknande på hemskärmen) men inte krav.

Fas 2 (efter first-100-users-validering): utvärdera **React Native (Expo)** för mobil-nativa funktioner (HealthKit/HealthConnect, bakgrunds-sync, push-notiser). Delar business-logik via monorepo-paket.

Fas 3 (om produkt-market fit): eventuellt native Swift + Kotlin om Expo-begränsningar bits, eller behåll RN med native-moduler för det som fattas.

## Adaptiv träningsmotor — oförändrad beslutsordning

Migreras från Python-planen till TypeScript på Vercel Serverless. Beslutsordningen står:

1. Skador och kontraindikationer filtrerar först.
2. Livsfas låser en profil.
3. Återhämtning skalar intensitet.
4. Cykelfas justerar typ.
5. Progression läggs sist.

Statslös, deterministisk givet input-snapshot. Loggar strukturerat reasoning-trace till Supabase-tabell för QA och användarförklaring.

## Roadmap i milstenar

| Milsten | Namn          | Sikte    | Fokus                                                                 |
| ------- | ------------- | -------- | --------------------------------------------------------------------- |
| M0      | Fundament     | v0–v3    | Repo, Vercel-deploy, Supabase-projekt, Next.js-skelett, auth          |
| M1      | Core träning  | v4–v8    | C-05, C-06 (Sanity), video-uppspelning, loggning                      |
| M2      | Cykel & motor | v9–v13   | C-03 med RLS+pgsodium, C-04 adaptiv motor                             |
| M3      | MVP-launch    | v14–v17  | Beta 100 användare, DPIA, PostHog EU-koppling                         |
| M4      | v1.1          | +3–4 mån | C-07 wearables (Apple/Google Fit web), C-10 live-klasser, gravid-spår |
| M5      | v1.2          | +6–8 mån | C-08 community, C-09 coach, RN-mobilbeslut                            |

Se [`docs/adr/`](./adr/) för arkitekturbeslut.
