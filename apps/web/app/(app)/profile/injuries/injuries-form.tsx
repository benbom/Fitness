"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { InjurySeverity } from "@/lib/validators/injury";
import { NOTE_MAX_LEN, injuryAreaLabels, injurySeverityLabels } from "@/lib/validators/injury";

import { saveInjuriesAction } from "./actions";
import { INITIAL_INJURIES_STATE, type InjuryFormEntry } from "./state";

interface InjuriesFormProps {
  initial: InjuryFormEntry[];
}

const SEVERITIES: InjurySeverity[] = ["none", "mild", "moderate", "severe"];

export function InjuriesForm({ initial }: InjuriesFormProps) {
  const [state, formAction] = useActionState(saveInjuriesAction, INITIAL_INJURIES_STATE);
  const saved = state.status === "saved";
  const formError = state.status === "error" ? state.formError : undefined;

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

      {saved ? (
        <div
          role="status"
          className="rounded-md border border-accent/40 bg-accent/10 p-4 text-sm text-accent-foreground"
        >
          Sparat. Du kan uppdatera när som helst.
        </div>
      ) : null}

      <div className="space-y-6">
        {initial.map((entry) => (
          <fieldset key={entry.area} className="space-y-3 rounded-md border border-border p-4">
            <input type="hidden" name="area" value={entry.area} />
            <Label className="text-base">{injuryAreaLabels[entry.area]}</Label>

            <div className="grid gap-2 sm:grid-cols-2">
              {SEVERITIES.map((sev) => (
                <label
                  key={sev}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent p-2 hover:border-border"
                >
                  <input
                    type="radio"
                    name="severity"
                    value={sev}
                    defaultChecked={entry.severity === sev}
                    required
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm">{injurySeverityLabels[sev]}</span>
                </label>
              ))}
            </div>

            <div className="space-y-1">
              <Label htmlFor={`note-${entry.area}`} className="text-xs uppercase tracking-wide">
                Anteckning (valfritt)
              </Label>
              <textarea
                id={`note-${entry.area}`}
                name="note"
                defaultValue={entry.note}
                maxLength={NOTE_MAX_LEN}
                rows={2}
                placeholder="T.ex. undvik böjning i länd, max 60 kg i marklyft"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </fieldset>
        ))}
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Sparar…" : "Spara"}
    </Button>
  );
}
