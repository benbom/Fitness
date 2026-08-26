# @vera/prettier-config

Delad Prettier-konfiguration. En sanning för hela monorepot.

## Använd

I paketets `package.json`:

```json
{
  "prettier": "@vera/prettier-config",
  "devDependencies": {
    "@vera/prettier-config": "workspace:*",
    "prettier": "^3.3.3"
  }
}
```

## Val och varför

- **`singleQuote: false`** — double quotes matchar JSON och de flesta stilar i vår stack.
- **`printWidth: 100`** — bredare än 80, smalare än "obegränsat". Läsbart på moderna skärmar utan att bli en enda lång rad.
- **`trailingComma: "all"`** — cleaner diffs.
- **`endOfLine: "lf"`** — one line ending across OS. Windows-utvecklare stöttas via `.editorconfig`.
- **Markdown: `printWidth: 80` och `proseWrap: "preserve"`** — låt författaren styra radbrytning.
