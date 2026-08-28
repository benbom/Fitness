import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",

  tracesSampleRate: process.env.NEXT_PUBLIC_APP_ENV === "production" ? 0.1 : 1.0,

  debug: false,

  // Edge runtime — hålla config minimal. Klass 1-scrubbning görs inte här
  // eftersom middleware inte tar user-input body (bara cookies + headers).
});
