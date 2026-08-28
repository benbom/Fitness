"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { signinAction } from "./actions";
import { INITIAL_SIGNIN_STATE } from "./state";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signinAction, INITIAL_SIGNIN_STATE);

  const emailError = state.status === "error" ? state.fieldErrors.email : undefined;
  const passwordError = state.status === "error" ? state.fieldErrors.password : undefined;
  const formError = state.status === "error" ? state.fieldErrors.form : undefined;
  const emailValue = state.status === "error" ? state.values.email : "";

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {formError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {formError}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="signin-email">E-post</Label>
        <Input
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={emailValue}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "signin-email-error" : undefined}
        />
        {emailError ? (
          <p id="signin-email-error" className="text-sm text-destructive">
            {emailError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signin-password">Lösenord</Label>
        <Input
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "signin-password-error" : undefined}
        />
        {passwordError ? (
          <p id="signin-password-error" className="text-sm text-destructive">
            {passwordError}
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
      {pending ? "Loggar in…" : "Logga in"}
    </Button>
  );
}
