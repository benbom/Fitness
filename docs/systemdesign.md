# Systemdesign — Vera v0.9

**Status:** Utkast för beslut
**Datum:** 2026-08-26
**Refererar:** [Kravspec v0.9](./kravspec.md)
**Visuell version:** [claude.ai/code/artifact/d4afbaee](https://claude.ai/code/artifact/d4afbaee-5060-4426-9810-bdb934da07b8)

## Designprinciper

1. **Offline-first.** Klienten är sanning för dagens pass. Sync är eventuell.
2. **Modulär monolit.** Ett deployerbart backend i tydliga moduler. Tjänster extraheras när mätbart nödvändigt.
3. **Känslig data är dess egen medborgare.** Cykel-, gravid-, hälsodata bor i separata scheman med egna nycklar.
4. **Innehåll är en produkt.** Övningar, program, video har egen CMS-livscykel med versionering.
5. **Bygg tråkigt.** Postgres framför NoSQL. HTTP framför protobuf. Nyfikenhet i motorn, inte i infra.

## Bounded contexts

| ID | Namn | Klass | Ansvar |
|---|---|---|---|
| C-01 | Identity & Access | Generic | Konton, sessions, MFA, consent |
| C-02 | Profile & Preferences | Support | Mål, nivå, utrustning, skador |
| C-03 | Cycle & Health | **Core** | Menscykel, faser, symtom, livsfas |
| C-04 | Adaptive Engine | **Core** | Genererar dagens pass. Egen tjänst. |
| C-05 | Workout Execution & Logging | **Core** | Set, reps, vikt, RPE. Offline-first. |
| C-06 | Content Catalog | Support | Program, video, artiklar. Sanity CMS. |
| C-07 | Wearable Sync | Support | Apple Health, Google Fit, Oura, Whoop, Garmin |
| C-08 | Community & Moderation | **Core** | Små grupper, prestations-delning, moderering |
| C-09 | Coaching & Messaging | Support | Fråga tränare, coach marketplace |
| C-10 | Live Classes | Support | LiveKit SFU + HLS-fallback |
| C-11 | Billing & Subscription | Generic | Stripe, Klarna, Swish |
| C-12 | Notifications | Generic | APNs, FCM, e-post via Postmark |

## Teknikstack

| Lager | Val | Motivering |
|---|---|---|
| iOS | Swift + SwiftUI | HealthKit-djup, offline, videokvalitet |
| Android | Kotlin + Jetpack Compose | Samma resonemang |
| Backend-monolit | TypeScript + NestJS + Node 20 | Bred rekryteringsbas i Norden, typad domän |
| Adaptiv motor | Python + FastAPI | Egen deploy, ML-ekosystem |
| Databas | PostgreSQL 16 (eu-north-1) | Relationell, row-level security |
| Cache/kö | Redis 7 + BullMQ | Enkelt, känt, räcker |
| Video VOD | Mux | Adaptiv bitrate, DRM, direkt till klient |
| Live | LiveKit (self-hosted EU) | WebRTC, öppen källkod |
| Auth | Ory Kratos + Hydra | Self-hosted EU |
| Betalning | Stripe + Klarna + Swish | Global + nordisk konvertering |
| Infra | AWS eu-north-1 (Stockholm) | Låg latens, EU-hemvist |
| Compute | ECS Fargate | Ingen k8s-overhead i startfas |
| CMS | Sanity | Bra editor-UX för tränare/granskare |
| Feature flags | Unleash (self-hosted) | EU-drift, ingen extern feature-data |
| Observability | OpenTelemetry → Grafana Cloud EU + Sentry | Öppen standard, EU-hosting |
| CI/CD | GitHub Actions + Turborepo | Redan i GitHub, snabb monorepo-build |

## Datamodell — känslighetsklassning

| Klass | Exempel | Skydd |
|---|---|---|
| **1 · Kritisk** | Cykel, gravid, symtom | Envelope-kryptering per användare. Egen nyckel. Radering < 24h. |
| **2 · Känslig** | Skador, RPE, hälsomål | Kolumn-kryptering. Break-glass-loggning. |
| **3 · Personlig** | Profil, träningslogg | Standard at-rest-kryptering. |
| **4 · Operativ** | Innehåll, teknik-logg | Öppen internt. |

En tabell som blandar klasser är alltid ett designfel.

## Adaptiv träningsmotor — beslutsordning

1. **Skador och kontraindikationer filtrerar först.** Aldrig en övning som strider mot skade-flagga.
2. **Livsfas låser en profil.** Gravid trimester 3 → gravid-profil. Perimenopaus → styrka/hopp-fokuserad.
3. **Återhämtning skalar intensitet.** RPE-medel > 8 eller sömn < 6h → dämpa volym 20%.
4. **Cykelfas justerar typ.** Menstruation → mobility som förslag, aldrig tvång. Follikulär → tunga PR tillåts.
5. **Progression läggs sist.** Om allt ovan tillåter — öka vikt 2.5% eller reps + 1.

Motorn är ren funktion, deterministisk givet input. Loggar strukturerat reasoning-trace för QA och användarförklaring.

## Roadmap i milstenar

| Milsten | Namn | Sikte | Fokus |
|---|---|---|---|
| M0 | Fundament | v0–v6 | Monorepo, infra, C-01/02/11 |
| M1 | Core träning | v7–v14 | C-05, C-06, videouppspelning |
| M2 | Cykel & motor | v15–v22 | C-03, C-04 v1, beta |
| M3 | MVP-launch | v23–v26 | App Store, Play, DPIA |
| M4 | v1.1 | +3–4 mån | C-07 wearables, C-10 live, gravid-spår |
| M5 | v1.2 | +6–8 mån | C-08 community, C-09 coach, ML |

Se [`docs/adr/`](./adr/) för de sju nyckelbeslut som formar arkitekturen.
