import * as Sentry from "@sentry/nextjs";

import { scrubKlass1 } from "@/lib/sentry/scrub";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",

  tracesSampleRate: process.env.NEXT_PUBLIC_APP_ENV === "production" ? 0.1 : 1.0,

  debug: false,

  // Scrubba Klass 1-fält innan events lämnar processen
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
});
