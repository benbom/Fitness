"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  equipmentLabels,
  goalLabels,
  levelLabels,
  type Equipment,
  type Goal,
  type Level,
} from "@/lib/validators/profile";

import { saveProfileAction } from "./actions";
import { INITIAL_PROFILE_STATE } from "./state";

interface ProfileFormProps {
  initial: {
    goals: Goal[];
    level: Level | null;
    equipment: Equipment[];
    daysPerWeek: number | null;
    timePerSession: number | null;
  };
  /**
   * Om satt: efter lyckad spara visas en "Fortsätt →"-knapp som länkar
   * dit istället för det vanliga bekräftelsemeddelandet. Används i
   * onboarding-flödet för att gå vidare till nästa steg.
   */
  nextHref?: string;
  nextLabel?: string;
}

export function ProfileForm({ initial, nextHref, nextLabel = "Fortsätt →" }: ProfileFormProps) {
  const [state, formAction] = useActionState(saveProfileAction, INITIAL_PROFILE_STATE);

  const err = state.status === "error" ? state.fieldErrors : {};
  const saved = state.status === "saved";

  return (
    <form action={formAction} className="space-y-10" noValidate>
      {err.form ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {err.form}
        </div>
      ) : null}

      {saved ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-accent/40 bg-accent/10 p-4 text-sm text-accent-foreground"
        >
          <span>Profilen är sparad. Du kan ändra den när du vill.</span>
          {nextHref ? (
            <Button asChild size="sm">
              <Link href={nextHref}>{nextLabel}</Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      <fieldset className="space-y-3">
        <Label className="text-base">Vad är ditt mål?</Label>
        <p className="text-sm text-muted-foreground">Välj en eller flera.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(goalLabels) as Goal[]).map((goal) => (
            <label
              key={goal}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-muted"
            >
              <input
                type="checkbox"
                name="goals"
                value={goal}
                defaultChecked={initial.goals.includes(goal)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span>{goalLabels[goal]}</span>
            </label>
          ))}
        </div>
        {err.goals ? <p className="text-sm text-destructive">{err.goals}</p> : null}
      </fieldset>

      <fieldset className="space-y-3">
        <Label className="text-base">Erfarenhetsnivå</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(levelLabels) as Level[]).map((level) => (
            <label
              key={level}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-muted"
            >
              <input
                type="radio"
                name="level"
                value={level}
                defaultChecked={initial.level === level}
                required
                className="h-4 w-4 accent-primary"
              />
              <span>{levelLabels[level]}</span>
            </label>
          ))}
        </div>
        {err.level ? <p className="text-sm text-destructive">{err.level}</p> : null}
      </fieldset>

      <fieldset className="space-y-3">
        <Label className="text-base">Var tränar du?</Label>
        <p className="text-sm text-muted-foreground">Välj en eller flera.</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(equipmentLabels) as Equipment[]).map((eq) => (
            <label
              key={eq}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-muted"
            >
              <input
                type="checkbox"
                name="equipment"
                value={eq}
                defaultChecked={initial.equipment.includes(eq)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span>{equipmentLabels[eq]}</span>
            </label>
          ))}
        </div>
        {err.equipment ? <p className="text-sm text-destructive">{err.equipment}</p> : null}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="daysPerWeek">Dagar i veckan du kan träna</Label>
          <select
            id="daysPerWeek"
            name="daysPerWeek"
            defaultValue={initial.daysPerWeek?.toString() ?? ""}
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="" disabled>
              Välj antal dagar
            </option>
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} dagar
              </option>
            ))}
          </select>
          {err.daysPerWeek ? <p className="text-sm text-destructive">{err.daysPerWeek}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timePerSession">Tid per pass</Label>
          <select
            id="timePerSession"
            name="timePerSession"
            defaultValue={initial.timePerSession?.toString() ?? ""}
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="" disabled>
              Välj tid
            </option>
            {[20, 30, 45, 60, 75, 90].map((n) => (
              <option key={n} value={n}>
                {n} minuter
              </option>
            ))}
          </select>
          {err.timePerSession ? (
            <p className="text-sm text-destructive">{err.timePerSession}</p>
          ) : null}
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Sparar…" : "Spara profil"}
    </Button>
  );
}
