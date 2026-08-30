/**
 * Vitest-stub för Next.js `server-only`-paketet.
 *
 * `server-only` finns för att failar hårt om en Client Component
 * importerar server-kod. Under tester finns ingen sådan boundary,
 * så vi aliasar den till en tom modul via vitest.config.ts.
 */
export {};
