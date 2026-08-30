import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

const sentryOptions = {
  // Auth token för att ladda upp source maps till Sentry
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Sentry-org och projekt — matchar sentry.io-projektet 'javascript-nextjs'
  // under org 'lieber-tech'. Utan dessa laddas source-maps inte upp och
  // stacktraces visar minifierad kod istället för TypeScript-källor.
  org: "lieber-tech",
  project: "javascript-nextjs",

  // Tystnare bygg om Sentry-auth saknas (första lokala bygget kan sakna det)
  silent: !process.env.CI,

  // Ladda upp source maps även för client
  widenClientFileUpload: true,

  // Dölj source maps från publik åtkomst
  hideSourceMaps: true,

  // Deaktivera Sentry-CLI-uppladdning om auth-token saknas
  disableLogger: true,

  // Tunnel-route är AV i M0 — det lägger middleware-rewrites som
  // kan förlänga edge-invocation och riskera MIDDLEWARE_INVOCATION_TIMEOUT.
  // Läggs tillbaka när vi ser adblocker-orsakade tapp i prod-metrics.
  // tunnelRoute: "/monitoring",
};

export default withSentryConfig(config, sentryOptions);
