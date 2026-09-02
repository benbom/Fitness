"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { log } from "@/lib/log/logger";
import { getRequestId } from "@/lib/log/request-id";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resetRequestSchema } from "@/lib/validators/reset-password";

import type { ResetRequestFormState } from "./state";

/**
 * Server Action för password-reset-begäran.
 *
 * Anti-enumeration: redirect till /reset-password/check-email
 * oavsett om e-posten existerar eller inte. Supabase's
 * resetPasswordForEmail rapporterar redan alltid success för att
 * inte läcka — vi speglar det på UI-nivå.
 */
export async function requestResetAction(
  _prev: ResetRequestFormState,
  formData: FormData,
): Promise<ResetRequestFormState> {
  const logger = log.child({ requestId: await getRequestId(), action: "request-reset" });

  const raw = { email: formData.get("email") };

  const parsed = resetRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      status: "error",
      fieldErrors: { email: flat.fieldErrors.email?.[0] },
      values: { email: typeof raw.email === "string" ? raw.email : "" },
    };
  }

  const { email } = parsed.data;

  let redirectTo: string | undefined;
  try {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
    const proto = headerList.get("x-forwarded-proto") ?? "https";
    if (host) {
      redirectTo = `${proto}://${host}/auth/callback?next=/reset-password/new`;
    }
  } catch (err) {
    logger.error("Kunde inte läsa request headers", { err });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      logger.warn("Supabase resetPasswordForEmail returned error", {
        status: error.status,
        message: error.message,
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
    }
  } catch (err) {
    logger.error("Unexpected error", { err });
    return {
      status: "error",
      fieldErrors: {
        form: "Något gick fel. Detaljer finns i Vercel Function Logs.",
      },
      values: { email },
    };
  }

  redirect("/reset-password/check-email");
}
