# ADR-006: Video utanför datastigen

**Status:** Accepted
**Datum:** 2026-08-26

## Kontext

Video kommer utgöra 95%+ av all bandbredd som apparna konsumerar. Om vi låter backend-monoliten proxya video (transkoda, cacha, streama) blir backend-kostnaden linjär mot användarbasen och en tydlig prestationsrisk under live-klasser.

## Beslut

**Video går klient ↔ CDN direkt. Backend står utanför datastigen.**

- **VOD** (färdiga pass): Mux hanterar transkodning, DRM, adaptiv bitrate. Backend utfärdar signerade uppspelnings-tokens med kort TTL. Klienten talar direkt mot Mux CDN.
- **Live-klasser**: LiveKit SFU (self-hosted i EU). Klienten ansluter direkt till SFU:n via WebRTC. Backend utfärdar deltagar-tokens och håller reda på schema och närvaro.
- **HLS-fallback** för live-klass-deltagare som ansluter sent — även den serveras från Mux, inte från vår backend.

Alternativen som valdes bort:

- **Cloudflare Stream** — snarlik funktionalitet, men Mux har mognare DRM och EU-region.
- **Egen CDN + FFmpeg-pipeline** — vi bygger inte det som Mux gör bättre.

## Konsekvens

**Positivt:** låg backend-kostnad även vid stark tillväxt. Hög videokvalitet från dag ett. Backend-team behöver inte lära sig video-domänen.

**Negativt:** vendor-migrering (om vi någonsin behöver byta) kräver klient-uppdatering, inte bara en backend-swap. Signerade tokens är ytterligare en säkerhetsyta att förvalta korrekt. Vi är beroende av Mux SLA för VOD.

## Referenser

- [Systemdesign v0.9 §02, §04](../systemdesign.md)
- Kravspec F-TR-03, F-TR-05, F-TR-07
