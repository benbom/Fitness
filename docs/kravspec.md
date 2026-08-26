# Kravspec — Vera v0.9

**Status:** Utkast för produktbeslut
**Datum:** 2026-08-26
**Visuell version:** [claude.ai/code/artifact/975ce6c5](https://claude.ai/code/artifact/975ce6c5-b9a1-4537-8e5a-4a16cce86823)

En träningsapp för kvinnor 25–55, byggd runt cykel- och livsfasanpassad periodisering, styrka som första princip och en community fri från kaloriskam.

## Målgrupp

Primär: kvinnor 28–45 i Norden med tidigare träningsvana, fragmenterat schema. Två flanker: nybörjaren som behöver trygghet, den fysiskt aktiva 45+ som möter perimenopaus.

## Positionering

Fyra icke förhandlingsbara principer:

1. **Styrka är default, inte ett tillval.** Bentäthet, muskelmassa, bäckenbotten som hälsomått i klass med sömn.
2. **Cykel och livsfas är förstaklass-data.** Fas driver planen. Graviditet, postpartum, perimenopaus har egna granskade spår.
3. **Ingen viktnedgångs-primitivt.** Aldrig BMI som mål. Före/efter-bilder finns inte som feature.
4. **Trygg community by design.** Små modererade grupper. Inga öppna kommentarsfält på andras kroppar.

## Krav — MoSCoW

42 funktionella krav i sju grupper. Full lista och detaljerade acceptanskriterier i den [visuella versionen](https://claude.ai/code/artifact/975ce6c5-b9a1-4537-8e5a-4a16cce86823).

### Onboarding & profil (6)

- **Must:** F-ON-01 målbaserad onboarding utan viktvåg · F-ON-02 cykelstatus vid start · F-ON-03 erfarenhets- och utrustningsprofil · F-ON-04 skade- och kontraindikationsflagg
- **Should:** F-ON-05 wearable-parkoppling
- **Won't v1:** F-ON-06 BMI-mål eller viktnedgångs-plan

### Träning & program (9)

- **Must:** F-TR-01 periodiserade 8–12-veckorsprogram · F-TR-02 adaptiv passgenerering · F-TR-03 videoledda pass med kvinnliga tränare · F-TR-04 loggning · F-TR-05 offline-nedladdning
- **Should:** F-TR-06 ljudledda pass · F-TR-07 live-klasser
- **Could:** F-TR-08 AI-formkoll via kamera
- **Won't v1:** F-TR-09 PvP-utmaningar med rankning

### Cykel, hormon & livsfas (6)

- **Must:** F-CY-01 cykelspårning med symtomlogg · F-CY-02 fasanpassad plan · F-CY-03 utbildande innehåll
- **Should:** F-CY-04 gravid- och postpartumspår · F-CY-05 perimeno-/menopausspår
- **Could:** F-CY-06 prediktion av fas via wearable

### Återhämtning & mind-body (5)

- **Must:** F-RH-01 daglig återhämtningscheck · F-RH-02 mobility-pass
- **Should:** F-RH-03 andnings- och nedvarvningspass
- **Could:** F-RH-04 meditation
- **Won't v1:** F-RH-05 stresspoäng som huvudmetrik

### Kost & energi (5)

- **Should:** F-KO-01 protein- och energimål · F-KO-02 måltidsbank
- **Could:** F-KO-03 kostloggning med streckkod
- **Won't v1:** F-KO-04 kaloriunderskott-program · F-KO-05 fasteprotokoll

### Community & coach (6)

- **Should:** F-CO-01 små modererade grupper · F-CO-02 prestations-delning utan kroppsfokus · F-CO-03 fråga en tränare async
- **Could:** F-CO-04 uppgradering till 1:1 coach
- **Won't v1:** F-CO-05 öppen social feed · F-CO-06 före/efter-bilder som feature

### Progress, data & kontroll (5)

- **Must:** F-PR-01 progresshistorik · F-PR-02 månadsöversikt · F-PR-03 full dataexport (GDPR) · F-PR-04 radering & anonymisering
- **Should:** F-PR-05 notisdesign utan skam

## Icke-funktionella krav

- **Plattform:** iOS 16+, Android 12+
- **Prestanda:** P50 pass-start < 2s, video-buffring < 3s på 4G
- **Tillgänglighet:** WCAG 2.2 AA
- **Språk:** SE + EN från launch, NO/DK/FI fas 2
- **Integritet:** GDPR + hälsodata-klass. EU-hosting.
- **Tillförlitlighet:** 99.5% uptime, 99.9% för live-klasser

## Framgångsmått år 1

| Mått | Mål | Referens |
|---|---|---|
| Pass/vecka (median) | 3 | efter månad 2 |
| D90-retention (betalande) | 55% | Sweat ~40%, Peloton ~50% |
| Cykel-täckning | 70% | andel som loggar minst en full cykel |
| Styrke-progress | +15% | median-ökning i volym över 12 v (nybörjar) |
