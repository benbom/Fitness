/**
 * Next.js instrumentation hook. Körs en gång per runtime vid uppstart.
 *
 * Vi laddar bara server-config i Node-runtime. Edge runtime (middleware)
 * initieras INTE med Sentry i M0 — det orsakade MIDDLEWARE_INVOCATION_TIMEOUT
 * vid cold-start. Edge-fel loggas via server-side Sentry när Route Handlers
 * eller Server Components ändå triggar felet, vilket räcker för prod-observability.
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}

/**
 * Fångar Server Component/Route Handler-fel så Sentry ser dem.
 * Next.js kallar `onRequestError`; Sentry exporterar den under
 * namnet `captureRequestError` sedan v8.24.
 */
export { captureRequestError as onRequestError } from "@sentry/nextjs";
