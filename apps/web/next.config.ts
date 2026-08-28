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

  // Vera-organisation + project i Sentry — anpassas när Sentry-projektet finns
  // org: "vera",
  // project: "vera-web",

  // Tystnare bygg om Sentry-auth saknas (första lokala bygget kan sakna det)
  silent: !process.env.CI,

  // Ladda upp source maps även för client
  widenClientFileUpload: true,

  // Dölj source maps från publik åtkomst
  hideSourceMaps: true,

  // Deaktivera Sentry-CLI-uppladdning om auth-token saknas
  disableLogger: true,

  // Tunnla Sentry-events genom vår egen /monitoring-route för att kringgå
  // adblockers — undviker att prod-fel försvinner i användarens uBlock Origin
  tunnelRoute: "/monitoring",
};

export default withSentryConfig(config, sentryOptions);
