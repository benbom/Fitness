# ADR-009: Web-först lansering, mobil efter validering

**Status:** Accepted
**Datum:** 2026-08-27
**Ersätter:** [ADR-001 (native mobil framför cross-platform)](./001-native-mobile-over-cross-platform.md)

## Kontext

Original-planen (v0.9) förutsatte native iOS + Android från dag ett — motiverat av HealthKit-djup, offline-video, och wearable-integration. Det förutsätter samtidigt två mobilutvecklare och en App Store/Play-utrullnings-process innan vi ens vet om produkten träffar rätt.

Produktägaren är ensam. First-100-users-validering är viktigare än App Store-läge. Vi behöver en väg som:

1. Låter oss testa hela produktkonceptet på en liten användarbas inom veckor, inte månader.
2. Undviker App Store-godkännande som en risk vid iteration.
3. Kan hostas på Vercel enligt [ADR-008](./008-vercel-supabase-host.md).
4. Ändå håller dörren öppen för en mobilnativ version när produkten är validerad.

## Beslut

**Fas 1 (M0–M3): Next.js webbapp på Vercel.**

- Fungerar i browsern på både desktop och mobil.
- Progressive Web App (PWA)-tillägg planeras — installerbar på hemskärmen, offline-cache för dagens pass.
- HealthKit/HealthConnect exponeras inte i webben; wearables integreras via cloud-API (Oura, Whoop, Garmin har alla webb-OAuth).

**Fas 2 (M4+, efter first-100-users): utvärdera React Native (Expo).**

- Delar business-logik med webbappen via monorepo-paket (`packages/domain`, `packages/contracts`).
- Ger tillgång till HealthKit, HealthConnect, bakgrunds-sync, native push.
- Publiceras via Expo EAS — behöver inte hantera Xcode/Android Studio-toolchain manuellt.

**Fas 3 (om produkt-market-fit): endast om Expo-begränsningar tvingar oss.**

- Bara då överväger vi native Swift + Kotlin, eller RN med native-moduler för det som Expo inte klarar.

Alternativ vi övervägde:

- **Native från dag ett** — original-planen. Öppnar fler features, men fördubblar utvecklingskostnaden innan vi vet vad marknaden vill ha.
- **Endast PWA aldrig mobilnativ** — kan räcka länge, men iOS PWA-begränsningarna (bakgrunds-sync, push, health-data-integration) sätter tak vi förr eller senare når.

## Konsekvens

**Positivt:**

- MVP-launch kortas från 6 månader till 3–4 veckor för web-versionen.
- Ingen App Store-process → daglig deploy möjlig, snabb iteration efter användarfeedback.
- Rekryteringsbasen breddas — en full-stack-utvecklare med Next.js-erfarenhet är enklare att hitta än ett mobilteam.
- Delad affärslogik via monorepo betyder att RN-övergången återanvänder mycket.

**Negativt:**

- HealthKit/HealthConnect nås inte i webben — mobil-VO-koll och wearable-data hämtas via molnet först.
- iOS-PWA har kända begränsningar (bakgrunds-sync sparsam, push först nyligen). Vissa användare kan välja bort webb-versionen och vänta på mobilnativ.
- Om produkt-market-fit uppnås men Expo/RN-tröskeln blir hög, kan vi hamna i "två appar att förvalta" innan vi orkar konsolidera.

Bäckenbotten-, gravid- och postpartum-relaterat innehåll som bygger på specifik sensor-data (t.ex. bäckenbotten-EMG från specialenheter) skjuts till Fas 2 eller Fas 3.

## Referenser

- [Systemdesign v1.0 § Web-först lanseringsstrategi](../systemdesign.md)
- [ADR-008 (Vercel + Supabase)](./008-vercel-supabase-host.md)
- Kravspec F-TR-03 (videoledda pass), F-TR-05 (offline) — båda funkar i webb med PWA
