"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

import { signupAction } from "./actions";
import { INITIAL_SIGNUP_STATE } from "./state";

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, INITIAL_SIGNUP_STATE);

  const emailError = state.status === "error" ? state.fieldErrors.email : undefined;
  const passwordError = state.status === "error" ? state.fieldErrors.password : undefined;
  const consentError = state.status === "error" ? state.fieldErrors.consent : undefined;
  const formError = state.status === "error" ? state.fieldErrors.form : undefined;
  const emailValue = state.status === "error" ? state.values.email : "";

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {formError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {formError}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="signup-email">E-post</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={emailValue}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "signup-email-error" : undefined}
        />
        {emailError ? (
          <p id="signup-email-error" className="text-sm text-destructive">
            {emailError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Lösenord</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "signup-password-error" : "signup-password-hint"}
        />
        {passwordError ? (
          <p id="signup-password-error" className="text-sm text-destructive">
            {passwordError}
          </p>
        ) : (
          <p id="signup-password-hint" className="text-sm text-muted-foreground">
            Minst {MIN_PASSWORD_LENGTH} tecken. Vi kollar mot kända läckor via Have I Been Pwned.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="consent"
            className="mt-1 h-4 w-4 rounded border-input accent-primary"
            aria-invalid={Boolean(consentError)}
            aria-describedby={consentError ? "signup-consent-error" : undefined}
            required
          />
          <span>
            Jag godkänner Veras villkor och integritetspolicy. Jag förstår att min träningsdata
            lagras i EU och inte delas med annonsnätverk.
          </span>
        </label>
        {consentError ? (
          <p id="signup-consent-error" className="text-sm text-destructive">
            {consentError}
          </p>
        ) : null}
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Skapar konto…" : "Skapa konto"}
    </Button>
  );
}
