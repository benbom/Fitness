# ADR-001: Native mobil framför cross-platform

**Status:** Accepted
**Datum:** 2026-08-26

## Kontext

Vera-appen ska leverera videobaserad träning offline, integrera djupt med HealthKit och HealthConnect samt med tredjepartswearables (Oura, Whoop, Garmin), och skickar/tar emot dagliga bakgrundssignaler. Videokvalitet och sömnlös offline-upplevelse på gym med dåligt wifi är kritiska för retention.

Alternativ i grunden: React Native, Flutter, Kotlin Multiplatform (KMP-first), eller native per plattform.

## Beslut

**Native mobil på båda plattformarna.** Swift + SwiftUI på iOS, Kotlin + Jetpack Compose på Android.

Delad domänmodell via Kotlin Multiplatform övervägs för workout-logging-lagret när mobilteamet växer förbi 6 utvecklare — inte innan.

Alternativen valdes bort för:

- **React Native / Flutter** — otillräckligt djup för HealthKit-specifika API:er, video-DRM-integration och långlivade bakgrundstasks. Retention-kritiska features skulle behöva bridge-kod ändå.
- **KMP-first** — kräver mognare mobilteam än vi har vid MVP. Räntan på abstraktionen betalas för tidigt.

## Konsekvens

Vi accepterar två kodbaser, två release-cykler och något högre rekryteringskostnad — mot högre kvalitet i det som räknas mest för retention (video, offline, wearable-data).

Två-veckors mobilrelease-cadens med bakåtkompatibelt API-kontrakt i tre versioner (se systemdesign §09).

## Referenser

- [Systemdesign v0.9 §04](../systemdesign.md)
- Kravspec F-TR-03 (videoledda pass), F-TR-05 (offline), F-ON-05 (wearables)
