# @vera/web

Vera webbklient — Next.js 15 App Router på Vercel enligt [ADR-009](../../docs/adr/009-web-first-launch.md).

## Stack

- Next.js 15 (App Router, React 19)
- TypeScript strict via [`@vera/tsconfig/react.json`](../../packages/tsconfig/react.json)
- Tailwind CSS 4 (CSS-first-config i `app/globals.css`)
- shadcn/ui (Radix Primitives + CVA)
- next-themes för ljust/mörkt tema
- Google Fonts: Fraunces (display) + DM Sans (body) via `next/font`
- Prisma 5 mot Supabase Postgres (datamodell)
- @supabase/ssr för auth + session-hantering

## Struktur

```
apps/web/
├── app/
│   ├── layout.tsx           # Root layout, fontladdning, ThemeProvider
│   ├── page.tsx             # Hero-landningssida
│   └── globals.css          # Tailwind + design tokens
├── components/
│   ├── theme-provider.tsx   # next-themes wrapper
│   └── ui/                  # shadcn-primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── input.tsx
├── lib/
│   └── utils.ts             # cn() helper (clsx + tailwind-merge)
├── components.json          # shadcn CLI-konfig
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

## Kommandon

Från repo-roten:

```bash
pnpm --filter @vera/web dev              # http://localhost:3000
pnpm --filter @vera/web build            # prisma generate + next build
pnpm --filter @vera/web lint
pnpm --filter @vera/web typecheck

# Prisma / databas
pnpm --filter @vera/web db:generate      # generera Prisma-klient
pnpm --filter @vera/web db:migrate       # skapa + applicera migration lokalt
pnpm --filter @vera/web db:migrate:deploy # applicera migrationer i prod (körs manuellt vid deploy)
pnpm --filter @vera/web db:studio        # webbaserad db-editor
pnpm --filter @vera/web db:format        # formatera schema.prisma
```

## Prisma + Supabase

Prisma är ORM:et; Supabase är hosten. Fördelning av ansvar:

| Vad                    | Var det bor                      | Skäl                                                            |
| ---------------------- | -------------------------------- | --------------------------------------------------------------- |
| Datamodell (schema)    | `prisma/schema.prisma`           | Typad, versionerad tillsammans med koden                        |
| Migrations             | `prisma/migrations/*.sql`        | Prisma genererar, vi committar SQL:en                           |
| Auth (users, sessions) | Supabase-managerad `auth`-schema | Supabase äger, vi refererar bara `auth.users(id)`               |
| RLS-policies           | SQL i migrations                 | Prisma stöder inte RLS direkt — vi skriver policies som raw SQL |
| Klass 1-kryptering     | `pgsodium`-extensionen           | Deklareras i `extensions = [...]` i schema.prisma               |

**Migrations-flöde för nya tabeller** (M0-26 och framåt):

1. Editera `prisma/schema.prisma` med ny modell
2. Kör `pnpm --filter @vera/web db:migrate` — Prisma genererar SQL, applicerar lokalt, sparar i `prisma/migrations/`
3. Editera den genererade SQL:en om nödvändigt (t.ex. lägga till FK till `auth.users(id)`, RLS-policies)
4. Committa både schema.prisma och migrations-mappen i din PR
5. När PR:en mergas till main → GitHub Actions kör `db:migrate:deploy:ci` automatiskt mot Supabase (se `.github/workflows/db-migrate.yml`)

## CI-driven migrations

Workflow:en `db-migrate.yml` triggas när något ändras under `apps/web/prisma/migrations/`. Den behöver två GitHub Secrets:

| Secret         | Värde                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL` | Transaction Pooler-URL (port 6543, `?pgbouncer=true`) — samma som Vercel |
| `DIRECT_URL`   | Session Pooler-URL (port 5432) — samma som Vercel                        |

**Sätt upp secrets:**

1. Gå till https://github.com/benbom/Fitness/settings/secrets/actions
2. New repository secret → namn `DATABASE_URL`, value = samma som i din `.env.local`
3. Repeat för `DIRECT_URL`

**Manuell trigger:** Actions-fliken → "DB Migrate" → Run workflow. Använd om du behöver applicera en existerande migration mot en ny miljö utan att pusha kod.

**Rollback:** Prisma migrate deploy är append-only. Om en migration måste ångras: skapa en NY migration som gör motsatsen och pusha. Databasen har ingen automatisk rollback.

**Klient-användning** — importera från `@/lib/db`:

```ts
import { db } from "@/lib/db";

const profile = await db.profile.findUnique({ where: { id: userId } });
```

`lib/db.ts` är `server-only` och exporterar en singleton så vi inte skapar nya connections vid varje hot-reload.

## Design-tokens

Palett medvetet distanserad från "shrink-it-and-pink" och AI-defaulten cream+terracotta:

| Roll    | Ljust                  | Mörkt                 |
| ------- | ---------------------- | --------------------- |
| Ground  | Parchment `#F1EDE4`    | Deep coffee `#16130E` |
| Primary | Deep garnet `#6E1F2B`  | Warm blush `#E58095`  |
| Accent  | Russet `#B85742`       | Warm russet `#E89075` |
| Ink     | Coffee-black `#1A1712` | Warm cream `#F4EEDE`  |

Tokens deklareras i `:root` för ljust och `.dark` för mörkt tema (via next-themes). System-preference stödjs via `@media (prefers-color-scheme: dark)` när ingen explicit klass finns.

## Nya shadcn-komponenter

När fler komponenter behövs — Sheet, DropdownMenu, Select osv — kör från denna katalog:

```bash
pnpm dlx shadcn@latest add sheet dropdown-menu select
```

CLI:t använder `components.json`-konfigurationen och lägger filerna i `components/ui/`.

## Vad denna app **inte** gör (ännu)

- Ingen Supabase-integration — kommer i #49 (M0-44)
- Ingen auth — kommer i #20, #21, #22
- Ingen data-hantering — kommer i #26–#29 (profile) och framåt

Den här filen (M0-36) är rent baseline: hero-sida som verifierar att fonts, tokens, shadcn och Vercel-deploy fungerar ihop.
