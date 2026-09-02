"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { passwordErrorMessage, validatePassword } from "@/lib/auth/password";
import { logConsent } from "@/lib/consent/log";
import { SIGNUP_CONSENT_TEXT } from "@/lib/consent/text";
import { log } from "@/lib/log/logger";
import { getRequestId } from "@/lib/log/request-id";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validators/signup";

import type { SignupFormState } from "./state";

/**
 * Server Action för signup.
 *
 * Flöde:
 *  1. Validera fältvärden med Zod-schemat.
 *  2. Kontrollera lösenordslängd + HIBP-läcka (server-side).
 *  3. Skicka email + password till Supabase Auth.
 *  4. Redirect till /verify oavsett om Supabase godkände registreringen —
 *     detta hindrar user-enumeration via UI-svar.
 *
 * Felhantering:
 *  - Konfigurationsfel (env vars saknas, Supabase nås ej): visas som
 *    formulär-fel med tydlig text. Loggas fullt i console.error så
 *    Vercel Function Logs kan visa detaljer.
 *  - Rate-limit (429): visas som e-post-fältfel.
 *  - Övriga Supabase-fel: loggas server-side, redirect ändå (anti-enum).
 *
 * OBS: `"use server"`-filer får bara exportera async functions. Typer och
 * konstanter för state bor i ./state.ts.
 */
export async function signupAction(
  _prev: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const requestId = await getRequestId();
  const logger = log.child({ requestId, action: "signup" });

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    consent: formData.get("consent"),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      status: "error",
      fieldErrors: {
        email: flat.fieldErrors.email?.[0],
        password: flat.fieldErrors.password?.[0],
        consent: flat.fieldErrors.consent?.[0],
      },
      values: { email: typeof raw.email === "string" ? raw.email : "" },
    };
  }

  const { email, password } = parsed.data;

  const passwordCheck = await validatePassword(password);
  if (!passwordCheck.ok) {
    return {
      status: "error",
      fieldErrors: { password: passwordErrorMessage(passwordCheck.reason) },
      values: { email },
    };
  }

  // Beräkna emailRedirectTo tidigt så vi kan logga det vid fel.
  let emailRedirectTo: string | undefined;
  try {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
    const proto = headerList.get("x-forwarded-proto") ?? "https";
    if (host) {
      emailRedirectTo = `${proto}://${host}/auth/callback`;
    }
  } catch (err) {
    logger.error("Kunde inte läsa request headers", { err });
  }

  // Anropa Supabase med explicit felhantering.
  let signUpErrorStatus: number | undefined;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    });

    if (error) {
      signUpErrorStatus = error.status;
      logger.warn("Supabase signUp returned error", {
        status: error.status,
        message: error.message,
        name: error.name,
      });
    } else {
      logger.info("Supabase signUp ok", {
        userId: data.user?.id,
        emailConfirmedAt: data.user?.email_confirmed_at,
        emailRedirectTo,
      });

      // Logga samtyckesbeslutet så vi har audit trail (ADR-004, M0-23).
      // Fail-open: om loggen inte kan skrivas, låt inte det stoppa
      // användarens signup — kontot är redan skapat i Supabase.
      if (data.user?.id) {
        try {
          await logConsent({
            userId: data.user.id,
            type: "terms_privacy",
            action: "granted",
            textShown: SIGNUP_CONSENT_TEXT,
            screenId: "signup",
          });
        } catch (consentErr) {
          logger.error("Failed to log consent (non-fatal)", { err: consentErr });
        }
      }
    }
  } catch (err) {
    logger.error("Unexpected error during Supabase signUp", { err });
    return {
      status: "error",
      fieldErrors: { form: konfigFel(err) },
      values: { email },
    };
  }

  // Rate-limit — visa som riktigt fel så användaren vet att vänta.
  if (signUpErrorStatus === 429) {
    return {
      status: "error",
      fieldErrors: {
        email: "För många försök just nu. Vänta en stund och försök igen.",
      },
      values: { email },
    };
  }

  // Alla andra utfall — inklusive fel — redirect till /verify för anti-enumeration.
  redirect("/verify");
}

/**
 * Tydligt felmeddelande baserat på vad som gick fel.
 */
function konfigFel(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("NEXT_PUBLIC_SUPABASE_URL") || message.includes("SUPABASE_ANON_KEY")) {
    return "Supabase-konfiguration saknas i produktion. Kontrollera Vercel Environment Variables — se detaljer i Vercel Function Logs.";
  }
  if (message.includes("fetch") || message.includes("network")) {
    return "Kunde inte nå Supabase. Kontrollera att Supabase-projektet är aktivt och att URL:en pekar rätt.";
  }
  return "Något gick fel när kontot skulle skapas. Detaljer finns i Vercel Function Logs (Deployments → senaste → Runtime Logs).";
}
