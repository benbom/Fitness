"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { requestResetAction } from "./actions";
import { INITIAL_RESET_REQUEST_STATE } from "./state";

export function ResetRequestForm() {
  const [state, formAction] = useActionState(requestResetAction, INITIAL_RESET_REQUEST_STATE);

  const emailError = state.status === "error" ? state.fieldErrors.email : undefined;
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
        <Label htmlFor="reset-email">E-post</Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={emailValue}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "reset-email-error" : undefined}
        />
        {emailError ? (
          <p id="reset-email-error" className="text-sm text-destructive">
            {emailError}
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
      {pending ? "Skickar…" : "Skicka återställningslänk"}
    </Button>
  );
}
