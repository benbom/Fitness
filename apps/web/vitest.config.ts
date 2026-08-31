import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["lib/**/*.spec.ts", "app/**/*.spec.ts", "tests/**/*.spec.ts"],
    exclude: ["node_modules", ".next", "dist"],
    alias: {
      // @/-alias för imports som `@/lib/foo` — matchar tsconfig.json paths.
      "@/": `${path.resolve(__dirname, ".")}/`,
      // Undvik att importer av 'server-only' failar utanför Next.js-runtime.
      "server-only": path.resolve(__dirname, "./tests/mocks/server-only.ts"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary", "json"],
      include: ["lib/**/*.ts", "app/**/actions.ts"],
      exclude: [
        "**/*.spec.ts",
        "**/*.d.ts",
        "**/*.config.ts",
        "tests/**",
        "lib/supabase/**",
        "lib/db.ts",
      ],
    },
  },
});
