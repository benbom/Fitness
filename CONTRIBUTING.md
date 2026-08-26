# Bidra till Vera

## Kodstandard

- **Konventionella commits**: `feat(scope): ...`, `fix(scope): ...`, `docs(scope): ...`. Scope matchar bounded context (`identity`, `cycle`, `billing`, ...) eller `infra`, `ci`, `docs`.
- **PR-titel** följer samma format och valideras i CI.
- **En PR = en logisk ändring.** Bryt upp stora förändringar. Undantag: refaktor + användning i samma commit när det ger tydligare diff.
- **Squash-merge** som standard. Feature-branchar korta (< 3 dagar).

## Beslut

- **Trivial ändring** → PR, review, merge.
- **Icke-trivial arkitekturpåverkan** → öppna [RFC](./docs/rfc/) först.
- **Fattat beslut med långsiktig konsekvens** → skriv [ADR](./docs/adr/) direkt eller efter RFC.

## Data

Nya entiteter måste klassas enligt [ADR-004](./docs/adr/004-data-classification.md). Reviewer ska stoppa PR:er där klassning saknas eller är otydligt lägre än den borde vara.

## Säkerhet

- Aldrig secrets i repo — använd Secrets Manager (issue M0-12).
- Aldrig Klass 1-fält i logg — logger-filter (M0-16) finns för det.
- Aldrig tredjeparts-analytics eller marknadsförings-SDK i klienten ([ADR-007](./docs/adr/007-no-third-party-analytics.md)).

## Review

- Alla PR:er kräver minst en review.
- PR:er som rör Klass 1-data ([ADR-004](./docs/adr/004-data-classification.md)) kräver review av tech lead eller security-champion.
- CI måste vara grön innan merge.
