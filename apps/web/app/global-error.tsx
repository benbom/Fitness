"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

/**
 * Global-error catches errors that bubble past all Error Boundaries.
 * Krävs av @sentry/nextjs för att fånga root-layout-fel — utan denna
 * ser Sentry inte den värsta klassen av crashes.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="sv">
      <body>
        <Error statusCode={500} />
      </body>
    </html>
  );
}
