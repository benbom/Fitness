# @vera/tsconfig

Delade TypeScript-konfigurationer. Alla paket och appar utgår från en av tre.

## Använd

I paketets `tsconfig.json`:

```jsonc
// apps/api/tsconfig.json
{
  "extends": "@vera/tsconfig/node.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
  },
  "include": ["src/**/*"],
}
```

```jsonc
// apps/web/tsconfig.json
{
  "extends": "@vera/tsconfig/react.json",
  "include": ["src/**/*"],
}
```

Lägg till som devDependency:

```json
{
  "devDependencies": {
    "@vera/tsconfig": "workspace:*",
    "typescript": "^5.6.2"
  }
}
```

## Varianter

| Preset       | För                                 | Nyckelval                                            |
| ------------ | ----------------------------------- | ---------------------------------------------------- |
| `base.json`  | Delad domänkod, isolerade bibliotek | `strict`, `noUncheckedIndexedAccess`, ingen `outDir` |
| `node.json`  | apps/api, apps/engine-workers       | `module: NodeNext`, `types: ["node"]`                |
| `react.json` | apps/web                            | `jsx: react-jsx`, `noEmit: true`, DOM-libs           |

## Strikta val

- `strict: true` — grundläggande.
- `noUncheckedIndexedAccess: true` — array/object-lookup returnerar `T | undefined`. Fångar en hel klass av runtime-buggar vid indexering.
- `noImplicitOverride: true` — måste vara explicit om du åsidosätter en klass-metod.
- `useUnknownInCatchVariables: true` — `catch (err)` typas som `unknown`, inte `any`.
