# Bidra till Vera

## Kodstandard

- **Konventionella commits** — se format nedan.
- **PR-titel** följer samma format och valideras i CI (blir squash-commitens meddelande).
- **En PR = en logisk ändring.** Bryt upp stora förändringar. Undantag: refaktor + användning i samma commit när det ger tydligare diff.
- **Squash-merge** som standard. Feature-branchar korta (< 3 dagar).

## Commit-format

```
type(scope): subject
```

**Type** (obligatorisk): `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

**Scope** (valfri men rekommenderad) — bounded context, app eller område:

| Kategori         | Scopes                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Bounded contexts | `identity`, `profile`, `cycle`, `workout`, `content`, `wearable`, `community`, `coaching`, `live`, `billing`, `notifications`, `engine` |
| Apps             | `api`, `web`, `ios`, `android`                                                                                                          |
| Områden          | `infra`, `ci`, `docs`, `deps`, `config`, `release`                                                                                      |

**Subject** — imperativ, gemener som första bokstav, ingen punkt i slutet, max 100 tecken totalt.

Exempel:

```
feat(cycle): stötta luteal-fas i adaptiv motor
fix(billing): idempotent hantering av stripe webhook retries
docs(adr): lägg till ADR-008 om feature-flag-strategi
chore(deps): bump turborepo 2.10 -> 2.11
```

Enforcement: `commitlint` körs lokalt via husky commit-msg-hook (installeras automatiskt vid `pnpm install`) och i CI mot både PR-titeln och alla commits i PR:en. Se [`.commitlintrc.js`](./.commitlintrc.js).

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
