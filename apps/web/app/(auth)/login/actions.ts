"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signinSchema } from "@/lib/validators/signin";

import type { SigninFormState } from "./state";

/**
 * Server Action för sign-in.
 *
 * Flöde:
 *  1. Validera fältvärden med Zod-schemat.
 *  2. Anropa Supabase Auth `signInWithPassword`.
 *  3. Vid framgång: session-cookies sätts automatiskt av @supabase/ssr.
 *     Redirect till `next`-param om den finns och är säker, annars `/`.
 *  4. Vid fel: visa generiskt felmeddelande — vi skiljer aldrig
 *     "fel lösenord" från "e-post finns inte" i UI (anti-enumeration).
 *
 * Om användarens e-post inte är verifierad returnerar Supabase ett
 * specifikt fel. Vi visar det som eget meddelande så användaren
 * förstår vad som ska göras (kolla mailet, klicka länken).
 *
 * OBS: `"use server"`-filer får bara exportera async functions.
 */
export async function signinAction(
  _prev: SigninFormState,
  formData: FormData,
): Promise<SigninFormState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signinSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      status: "error",
      fieldErrors: {
        email: flat.fieldErrors.email?.[0],
        password: flat.fieldErrors.password?.[0],
      },
      values: { email: typeof raw.email === "string" ? raw.email : "" },
    };
  }

  const { email, password } = parsed.data;
  const nextParam = formData.get("next");
  const target = typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/";

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.warn("[signin] Supabase signIn returned error:", {
        status: error.status,
        message: error.message,
        name: error.name,
      });

      if (error.status === 429) {
        return {
          status: "error",
          fieldErrors: {
            email: "För många försök just nu. Vänta en stund och försök igen.",
          },
          values: { email },
        };
      }

      if (
        error.message.toLowerCase().includes("email not confirmed") ||
        error.message.toLowerCase().includes("not confirmed")
      ) {
        return {
          status: "error",
          fieldErrors: {
            form: "E-posten är inte verifierad än. Kolla din inbox efter länken från registreringen.",
          },
          values: { email },
        };
      }

      // Generiskt fel — vi läcker inte om e-posten finns eller ej.
      return {
        status: "error",
        fieldErrors: {
          form: "Fel e-post eller lösenord.",
        },
        values: { email },
      };
    }
  } catch (err) {
    console.error("[signin] Unexpected error during Supabase signIn:", err);
    return {
      status: "error",
      fieldErrors: {
        form: "Något gick fel vid inloggning. Detaljer finns i Vercel Function Logs.",
      },
      values: { email },
    };
  }

  redirect(target);
}
