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

// Uppladdning av source maps + release-skapande kräver giltig
// SENTRY_AUTH_TOKEN. Vi styr det via en enda "på-flagga":
//   SENTRY_UPLOAD_SOURCEMAPS=true  → försöker ladda upp
//   (default / annat)              → hoppa över helt
//
// Motivering: en utgången/ogiltig token får INTE blockera prod-deploy.
// Att kräva aktiv opt-in gör det explicit när vi vill ladda upp, och
// säkerställer att bygget alltid går även om Sentry-projektet raderats,
// nyckeln roterats, eller Sentry har outage. Runtime error-reporting
// funkar oavsett — det som saknas utan uppladdning är de-minifiering
// av stacktraces i Sentry-UI.
const uploadSourceMaps =
  process.env.SENTRY_UPLOAD_SOURCEMAPS === "true" && Boolean(process.env.SENTRY_AUTH_TOKEN);

const sentryOptions = {
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Sentry-org och projekt — matchar sentry.io-projektet 'javascript-nextjs'
  // under org 'lieber-tech'.
  org: "lieber-tech",
  project: "javascript-nextjs",

  // Tystnare bygg lokalt; verbose i CI
  silent: !process.env.CI,

  // Ladda upp source maps även för client (om upload aktiverat)
  widenClientFileUpload: true,

  // Dölj source maps från publik åtkomst
  hideSourceMaps: true,

  // Deaktivera Sentry-CLI-loggning
  disableLogger: true,

  // Skippa alla nätverkscalls mot Sentry API vid build om vi inte
  // aktivt sagt att vi vill ladda upp. Både source-map-upload och
  // release-skapande styrs av samma flagga.
  sourcemaps: {
    disable: !uploadSourceMaps,
  },
  release: {
    create: uploadSourceMaps,
    finalize: uploadSourceMaps,
  },

  // Tunnel-route är AV i M0 — det lägger middleware-rewrites som
  // kan förlänga edge-invocation och riskera MIDDLEWARE_INVOCATION_TIMEOUT.
  // Läggs tillbaka när vi ser adblocker-orsakade tapp i prod-metrics.
  // tunnelRoute: "/monitoring",
};

export default withSentryConfig(config, sentryOptions);
