# @vera/web

Vera webbklient — Next.js 15 App Router på Vercel enligt [ADR-009](../../docs/adr/009-web-first-launch.md).

## Stack

- Next.js 15 (App Router, React 19)
- TypeScript strict via [`@vera/tsconfig/react.json`](../../packages/tsconfig/react.json)
- Tailwind CSS 4 (CSS-first-config i `app/globals.css`)
- shadcn/ui (Radix Primitives + CVA)
- next-themes för ljust/mörkt tema
- Google Fonts: Fraunces (display) + DM Sans (body) via `next/font`

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
pnpm --filter @vera/web dev         # http://localhost:3000
pnpm --filter @vera/web build       # produktionsbygge
pnpm --filter @vera/web lint        # Next.js + delade regler
pnpm --filter @vera/web typecheck
```

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
