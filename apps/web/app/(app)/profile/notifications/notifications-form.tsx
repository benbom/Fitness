"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  categoryDescriptions,
  categoryLabels,
  frequencyLabels,
  notificationCategoryKeys,
  type NotificationPrefs,
} from "@/lib/validators/notification-prefs";

import { saveNotificationPrefsAction } from "./actions";
import { INITIAL_NOTIF_PREFS_STATE } from "./state";

interface NotificationsFormProps {
  initial: NotificationPrefs;
}

const FREQUENCIES = ["immediate", "daily", "weekly", "off"] as const;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function NotificationsForm({ initial }: NotificationsFormProps) {
  const [state, formAction] = useActionState(
    saveNotificationPrefsAction,
    INITIAL_NOTIF_PREFS_STATE,
  );
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
          Sparat. Ändringarna gäller från nästa notis.
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight">Vad du får notis om</h2>
          <p className="text-sm text-muted-foreground">
            Ingen notis skickas i tystnadsperioden nedan, oavsett vad du väljer här.
          </p>
        </div>

        {notificationCategoryKeys.map((key) => {
          const cat = initial.categories[key];
          return (
            <fieldset key={key} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <Label className="text-base">{categoryLabels[key]}</Label>
                  <p className="text-sm text-muted-foreground">{categoryDescriptions[key]}</p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    name={`category[${key}].enabled`}
                    defaultChecked={cat.enabled}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm">På</span>
                </label>
              </div>

              <div className="mt-3">
                <Label
                  htmlFor={`freq-${key}`}
                  className="font-mono text-xs uppercase tracking-wide"
                >
                  Frekvens
                </Label>
                <select
                  id={`freq-${key}`}
                  name={`category[${key}].frequency`}
                  defaultValue={cat.frequency}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {frequencyLabels[f]}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>
          );
        })}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight">Tystnadsperiod</h2>
          <p className="text-sm text-muted-foreground">
            Vi skickar inga notiser under de här timmarna. Du väljer själv.
          </p>
        </div>

        <fieldset className="space-y-4 rounded-md border border-border p-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="quiet_hours.enabled"
              defaultChecked={initial.quiet_hours.enabled}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className="text-sm">Använd tystnadsperiod</span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="quiet-start" className="font-mono text-xs uppercase tracking-wide">
                Från
              </Label>
              <select
                id="quiet-start"
                name="quiet_hours.startHour"
                defaultValue={initial.quiet_hours.startHour}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="quiet-end" className="font-mono text-xs uppercase tracking-wide">
                Till
              </Label>
              <select
                id="quiet-end"
                name="quiet_hours.endHour"
                defaultValue={initial.quiet_hours.endHour}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
      </section>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Sparar…" : "Spara preferenser"}
    </Button>
  );
}
