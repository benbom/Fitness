import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Supabase Auth email-callback.
 *
 * Två flöden landar här:
 *
 * 1. **Verifieringslänk från signup-mail**
 *    Format: /auth/callback?code=<pkce_code>
 *    Skapas av `signUp({ options: { emailRedirectTo } })`.
 *    Vi växlar koden mot en session och redirect:ar till /welcome.
 *
 * 2. **Magic link / OTP-verifiering**
 *    Format: /auth/callback?token_hash=<hash>&type=<magiclink|recovery|...>
 *    Skapas av `signInWithOtp` (används från M0-21 och framåt).
 *    Vi anropar `verifyOtp` och redirect:ar.
 *
 * `next` query-param respekteras som redirect-target om den finns och
 * pekar på en relativ path. Annars default: `/welcome` (kommer i M0-27
 * eller närliggande — nu redirecte till `/`).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next");

  const target = nextParam && nextParam.startsWith("/") ? nextParam : "/";

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${target}`);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
