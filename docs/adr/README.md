# Architecture Decision Records

Ett beslut som är dyrt att ångra får en ADR. En publicerad ADR ändras aldrig — den ersätts av en ny som refererar tillbaka.

## Format

Varje ADR har fyra sektioner:

1. **Kontext** — vad står vi inför? Vilka begränsningar?
2. **Beslut** — vad valde vi? Alternativ vi valde bort och varför.
3. **Konsekvens** — vad följer? Positivt och negativt.
4. **Status** — Proposed / Accepted / Superseded by ADR-NNN.

## Index

| Nr                                                | Beslut                                     | Status   |
| ------------------------------------------------- | ------------------------------------------ | -------- |
| [001](./001-native-mobile-over-cross-platform.md) | Native mobil framför cross-platform        | Accepted |
| [002](./002-modular-monolith.md)                  | Modulär monolit istället för mikrotjänster | Accepted |
| [003](./003-adaptive-engine-python.md)            | Egen adaptiv motor i Python                | Accepted |
| [004](./004-data-classification.md)               | Data-klassning styr allt                   | Accepted |
| [005](./005-postgres-for-everything.md)           | Postgres för allt vi äger                  | Accepted |
| [006](./006-video-off-datapath.md)                | Video utanför datastigen                   | Accepted |
| [007](./007-no-third-party-analytics.md)          | Ingen tredjeparts-analytics i klienten     | Accepted |

## Nästa ADR

Använd [`000-template.md`](./000-template.md). Numrera i sekvens.
