"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { deleteAccountAction } from "./actions";
import { INITIAL_DELETE_STATE } from "./state";

export function DeleteAccountForm() {
  const [state, formAction] = useActionState(deleteAccountAction, INITIAL_DELETE_STATE);

  const actionError = state.status === "error" ? state.fieldErrors.action : undefined;
  const confirmationError = state.status === "error" ? state.fieldErrors.confirmation : undefined;
  const formError = state.status === "error" ? state.fieldErrors.form : undefined;

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {formError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {formError}
        </div>
      ) : null}

      <fieldset className="space-y-3">
        <Label className="text-base">Välj hur din data hanteras</Label>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4 hover:bg-muted">
            <input
              type="radio"
              name="action"
              value="delete"
              defaultChecked
              className="mt-1 h-4 w-4 accent-primary"
              required
            />
            <div className="space-y-1">
              <div className="font-medium">Radera allt</div>
              <p className="text-sm text-muted-foreground">
                Konto, profil och samtyckeshistorik försvinner helt inom 24 timmar. Din träningsdata
                kan inte återställas.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4 hover:bg-muted">
            <input
              type="radio"
              name="action"
              value="anonymize"
              className="mt-1 h-4 w-4 accent-primary"
            />
            <div className="space-y-1">
              <div className="font-medium">Anonymisera</div>
              <p className="text-sm text-muted-foreground">
                Din e-post och profil tas bort direkt. Samtyckeshistorik behålls anonymt för Veras
                interna statistik. Kontot blir oåtkomligt.
              </p>
            </div>
          </label>
        </div>
        {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="delete-confirmation">
          Skriv <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">RADERA</span> för
          att bekräfta
        </Label>
        <Input
          id="delete-confirmation"
          name="confirmation"
          type="text"
          autoComplete="off"
          required
          aria-invalid={Boolean(confirmationError)}
          aria-describedby={confirmationError ? "delete-confirmation-error" : undefined}
        />
        {confirmationError ? (
          <p id="delete-confirmation-error" className="text-sm text-destructive">
            {confirmationError}
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
    <Button type="submit" size="lg" variant="destructive" disabled={pending}>
      {pending ? "Bearbetar…" : "Bekräfta"}
    </Button>
  );
}
