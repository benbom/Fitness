import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    /*
     * Kör middleware på alla request-paths förutom:
     *  - _next/static (Next.js-statik)
     *  - _next/image (bildoptimering)
     *  - favicon.ico
     *  - alla bildfiler (svg, png, jpg, jpeg, gif, webp)
     *  - alla filer i /public som slutar på font-extensions
     *
     * Route Handlers under /api måste hantera sin egen auth-kontroll
     * men gynnas fortfarande av att sessionen refreshas här först.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};
