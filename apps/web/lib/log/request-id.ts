import "server-only";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";

/**
 * Returnerar request-id för aktuell HTTP-request.
 *
 * Prioritet: `x-request-id` (om klient/proxy skickar det) → `x-vercel-id`
 * (Vercel edge sätter alltid) → fallback egen UUID (t.ex. i lokala
 * tester eller utanför request-kontext).
 *
 * Fail-open: om headers() throwar (unit-test-miljö utan Next runtime)
 * returnerar vi en UUID istället för att kasta.
 */
export async function getRequestId(): Promise<string> {
  try {
    const h = await headers();
    const explicit = h.get("x-request-id");
    if (explicit) return explicit;
    const vercel = h.get("x-vercel-id");
    if (vercel) return vercel;
  } catch {
    // Utanför request-kontext — fallback nedan
  }
  return randomUUID();
}
