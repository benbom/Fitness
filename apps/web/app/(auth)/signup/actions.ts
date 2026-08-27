"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { MIN_PASSWORD_LENGTH, passwordErrorMessage, validatePassword } from "@/lib/auth/password";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validators/signup";

export type SignupFormState =
  | { status: "idle" }
  | {
      status: "error";
      fieldErrors: { email?: string; password?: string; consent?: string };
      values: { email: string };
    };

/**
 * Server Action för signup.
 *
 * Flöde:
 *  1. Validera formulärvärden med Zod-schemat.
 *  2. Kontrollera lösenordslängd + HIBP-läcka (server-side, aldrig till klient).
 *  3. Skicka email + password till Supabase Auth med emailRedirectTo pekande
 *     mot /auth/callback så verifieringslänken landar rätt.
 *  4. Även om Supabase returnerar fel för en existerande email — vi skickar
 *     användaren till /verify oavsett. Det förhindrar user-enumeration:
 *     angriparen kan inte skilja "existerar" från "existerar inte" via UI.
 *
 * OBS: rate-limit hanteras av Supabase Auth (per email + per IP). Vi lägger
 * inga extra räknare på vår sida i M0 — Vercels edge middleware kan
 * kompletteras senare om vi ser missbruk.
 */
export async function signupAction(
  _prev: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
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
      fieldErrors: {
        password: passwordErrorMessage(passwordCheck.reason),
      },
      values: { email },
    };
  }

  const supabase = await createSupabaseServerClient();
  const headerList = await headers();
  const origin = headerList.get("origin") ?? headerList.get("host") ?? "";
  const emailRedirectTo = origin
    ? `https://${origin.replace(/^https?:\/\//, "")}/auth/callback`
    : undefined;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: emailRedirectTo ? { emailRedirectTo } : undefined,
  });

  // Rate-limit-fel: visa faktisk felmeddelande. Övriga fel: dölj så vi
  // inte läcker information om användarbasen.
  if (error && error.status === 429) {
    return {
      status: "error",
      fieldErrors: {
        email: "För många försök just nu. Vänta en stund och försök igen.",
      },
      values: { email },
    };
  }

  // Vid alla andra fall — även fel — redirect till /verify. Vi vill inte
  // ge angriparen möjlighet att avgöra om email finns.
  void error;
  redirect("/verify");
}

export const INITIAL_STATE: SignupFormState = { status: "idle" };
export { MIN_PASSWORD_LENGTH };
