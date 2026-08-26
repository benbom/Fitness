# Vera-dokumentation

Kanonisk källa för produkt- och teknikbeslut. Håll aktuellt: en föråldrad doc är värre än ingen doc.

## Struktur

| Katalog                                | Innehåll                            | Ändringsprocess                            |
| -------------------------------------- | ----------------------------------- | ------------------------------------------ |
| [`kravspec.md`](./kravspec.md)         | Produktkrav, MoSCoW                 | PR + produktägare                          |
| [`systemdesign.md`](./systemdesign.md) | Arkitektur, bounded contexts, stack | PR + tech lead                             |
| [`m0.md`](./m0.md)                     | Aktuell milsten, issues             | Uppdateras löpande                         |
| [`adr/`](./adr/)                       | Arkitekturella beslut               | Ny fil per beslut, aldrig ändra publicerad |
| [`runbooks/`](./runbooks/)             | Ops-procedurer                      | PR, testad i staging först                 |
| [`rfc/`](./rfc/)                       | Förslag under diskussion            | PR med `rfc`-label                         |

## När skriver vi vad?

**ADR** — vi har fattat ett beslut som är dyrt att ångra (val av databas, ramverk, plattform). Beskriver kontext, beslut, konsekvens. Nya ADR:er överskriver aldrig gamla — de tillägger.

**RFC** — vi står inför ett beslut men är inte färdiga. Öppna PR med `docs/rfc/NNN-namn.md`, label `rfc`, diskutera i PR:en. När beslutat: konvertera till ADR.

**Runbook** — reproducerbar procedur (deploy, rollback, on-call, nyckelrotation). Sista raden: "senast testad YYYY-MM-DD av X".

**Systemdesign** — beskriver systemet som det ÄR. Uppdateras när verkligheten ändras, inte innan.

## Levande artefakter

Publicerade i Claude Artifact, kopior i markdown-form ovan:

- [Kravspec — visuell version](https://claude.ai/code/artifact/975ce6c5-b9a1-4537-8e5a-4a16cce86823)
- [Systemdesign — visuell version](https://claude.ai/code/artifact/d4afbaee-5060-4426-9810-bdb934da07b8)
- [M0 Fundament — visuell version](https://claude.ai/code/artifact/063c818d-f1eb-4d9d-8970-6733b7ac2752)
