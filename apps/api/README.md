# @vera/api

Vera backend-monolit. NestJS 10 på Fastify. TypeScript strict. Modulär enligt bounded contexts i [systemdesign §03](../../docs/systemdesign.md).

## Struktur

```
src/
├── main.ts                 # Fastify bootstrap
├── app.module.ts           # Root module — importerar alla contexts
├── config/
│   └── env.ts              # convict-baserad, validerad vid uppstart
├── health/
│   ├── health.module.ts
│   ├── health.controller.ts       # GET /health/live
│   └── health.controller.spec.ts
└── modules/
    ├── identity/           # C-01 — implementeras M0-19..M0-25
    ├── profile/            # C-02 — implementeras M0-26..M0-29
    └── billing/            # C-11 — implementeras M0-30..M0-35

test/
└── health.e2e-spec.ts      # In-memory e2e mot Fastify
```

## Kommandon

Från repo-roten:

```bash
pnpm --filter @vera/api dev         # nest start --watch
pnpm --filter @vera/api build       # nest build -> dist/
pnpm --filter @vera/api start       # kör byggd artefakt
pnpm --filter @vera/api test        # jest (enhet)
pnpm --filter @vera/api test:e2e    # jest (e2e, in-memory)
pnpm --filter @vera/api lint
pnpm --filter @vera/api typecheck
```

Eller från denna katalog med `pnpm dev`, `pnpm build` osv.

## Lokal utveckling mot Postgres/Redis

För M0-13 räcker det att starta API:t utan externa beroenden — health-endpointen kräver ingen db. När M0-14 (Prisma) landar behövs Postgres. Starta docker-compose från repo-roten:

```bash
docker compose up -d postgres redis
```

## Konfiguration

Miljövariabler validerade i [`src/config/env.ts`](./src/config/env.ts):

| Nyckel        | Default       | Doc                                 |
| ------------- | ------------- | ----------------------------------- |
| `NODE_ENV`    | `development` | development/staging/production/test |
| `PORT`        | `3000`        | TCP-port                            |
| `LOG_LEVEL`   | `info`        | fatal/error/warn/info/debug/trace   |
| `APP_VERSION` | `0.0.0`       | Semver (sätts av CI)                |
| `GIT_SHA`     | `dev`         | 7-tecken git-sha (sätts av CI)      |

Se [`.env.example`](../../.env.example) i repo-roten.

## Health-endpoint

```
GET /health/live
```

```json
{
  "status": "ok",
  "version": "0.0.0",
  "gitSha": "dev",
  "env": "development",
  "timestamp": "2026-08-26T20:00:00.000Z"
}
```

`/health/ready` med db/redis/ory-check läggs till i M0-18.
