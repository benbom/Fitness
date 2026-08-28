import * as Sentry from "@sentry/nextjs";

import { scrubKlass1 } from "@/lib/sentry/scrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Anpassa efter miljö
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",

  // Sampling — full på dev, 10% på prod
  tracesSampleRate: process.env.NEXT_PUBLIC_APP_ENV === "production" ? 0.1 : 1.0,

  // Session Replay: AV i M0 tills vi utformat regler för Klass 1-data
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Ingen tredjeparts-CDN — helt i egen kontroll (ADR-007)
  debug: false,

  // Scrubba Klass 1-fält innan events skickas
  beforeSend(event) {
    if (event.request?.data) {
      event.request.data = scrubKlass1(event.request.data);
    }
    if (event.extra) {
      event.extra = scrubKlass1(event.extra) as typeof event.extra;
    }
    if (event.contexts) {
      event.contexts = scrubKlass1(event.contexts) as typeof event.contexts;
    }
    return event;
  },

  // Ignorera brus som inte påverkar användare
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error promise rejection captured",
  ],
});
