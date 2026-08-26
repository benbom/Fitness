/**
 * Commitlint-konfiguration för Vera-monorepot.
 *
 * Bygger på @commitlint/config-conventional (Angular-varianten):
 *   type(scope): subject
 *
 * Godkända typer (från config-conventional):
 *   feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
 *
 * Scope-listan nedan är vår — kortnamn per bounded context (systemdesign §03),
 * app eller övrig område. Warning, inte error, så nya scopes inte blockar
 * legitim utveckling — höjs till error när teamet växer.
 *
 * Kolla ett meddelande manuellt: `pnpm exec commitlint --edit path/to/msg`
 * Testa det senaste commit-meddelandet: `pnpm exec commitlint --from HEAD~1`
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      1,
      "always",
      [
        "identity",
        "profile",
        "cycle",
        "workout",
        "content",
        "wearable",
        "community",
        "coaching",
        "live",
        "billing",
        "notifications",
        "engine",
        "api",
        "web",
        "ios",
        "android",
        "infra",
        "ci",
        "docs",
        "deps",
        "config",
        "release",
      ],
    ],
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [1, "always", 120],
  },
};
