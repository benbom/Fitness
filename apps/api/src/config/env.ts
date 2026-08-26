import convict from "convict";

/**
 * Miljökonfiguration. Validerad vid uppstart.
 *
 * Nya nycklar läggs här — inte i process.env-lookups spridda i koden.
 * Klass 1-hemligheter ska aldrig ha default-värden och ska hämtas från
 * Secrets Manager (M0-12), inte från plain env i produktion.
 */
const config = convict({
  env: {
    doc: "Kör-miljö.",
    format: ["development", "staging", "production", "test"],
    default: "development",
    env: "NODE_ENV",
  },
  port: {
    doc: "TCP-port att lyssna på.",
    format: "port",
    default: 3000,
    env: "PORT",
  },
  logLevel: {
    doc: "Loggnivå (Pino).",
    format: ["fatal", "error", "warn", "info", "debug", "trace"],
    default: "info",
    env: "LOG_LEVEL",
  },
  version: {
    doc: "Applikationsversion (semver).",
    format: String,
    default: process.env["npm_package_version"] ?? "0.0.0",
    env: "APP_VERSION",
  },
  gitSha: {
    doc: "Git commit SHA (7 tecken).",
    format: String,
    default: "dev",
    env: "GIT_SHA",
  },
});

config.validate({ allowed: "strict" });

export const env = {
  env: config.get("env"),
  port: config.get("port"),
  logLevel: config.get("logLevel"),
  version: config.get("version"),
  gitSha: config.get("gitSha"),
} as const;

export type Env = typeof env;
