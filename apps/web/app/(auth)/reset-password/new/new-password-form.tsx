"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

import { setNewPasswordAction } from "./actions";
import { INITIAL_NEW_PASSWORD_STATE } from "./state";

export function NewPasswordForm() {
  const [state, formAction] = useActionState(setNewPasswordAction, INITIAL_NEW_PASSWORD_STATE);

  const passwordError = state.status === "error" ? state.fieldErrors.password : undefined;
  const formError = state.status === "error" ? state.fieldErrors.form : undefined;

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
        <Label htmlFor="new-password">Nytt lösenord</Label>
        <Input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "new-password-error" : "new-password-hint"}
        />
        {passwordError ? (
          <p id="new-password-error" className="text-sm text-destructive">
            {passwordError}
          </p>
        ) : (
          <p id="new-password-hint" className="text-sm text-muted-foreground">
            Minst {MIN_PASSWORD_LENGTH} tecken. Vi kollar mot kända läckor via Have I Been Pwned.
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Sparar…" : "Sätt nytt lösenord"}
    </Button>
  );
}
