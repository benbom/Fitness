# @vera/eslint-config

Delad ESLint-konfiguration. TypeScript + import-ordning + prettier-integration som bas. Två presets ovanpå för miljöspecifika regler.

## Använd

```jsonc
// .eslintrc.json i ett paket
{
  "extends": ["@vera/eslint-config"]        // default (bibliotek/isolerat)
  // eller
  "extends": ["@vera/eslint-config/node"]   // för apps/api, apps/engine-workers
  // eller
  "extends": ["@vera/eslint-config/react"]  // för apps/web
}
```

Lägg till som devDependency i paketets `package.json`:

```json
{
  "devDependencies": {
    "@vera/eslint-config": "workspace:*",
    "eslint": "^8.57.0"
  }
}
```

## Filosofi

- Fel som är riktiga fel (`no-unused-vars`, `no-undef`) är errors.
- Stilfrågor lämnas till Prettier — därav `eslint-config-prettier` sist i extends.
- `import/no-default-export` som warn — vi föredrar namngivna exports, men vissa ramverk (Next.js pages, config-filer) kräver default. Overrides finns.
