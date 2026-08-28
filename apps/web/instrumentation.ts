/**
 * Next.js instrumentation hook. Körs en gång per runtime vid uppstart.
 * Här laddar vi rätt Sentry-config baserat på runtime (Node vs Edge).
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Fångar Server Component/Route Handler-fel så Sentry ser dem.
 * Next.js kallar `onRequestError`; Sentry exporterar den under
 * namnet `captureRequestError` sedan v8.24 — vi re-exporterar.
 */
export { captureRequestError as onRequestError } from "@sentry/nextjs";
