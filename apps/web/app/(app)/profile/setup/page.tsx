import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import type { Equipment, Goal, Level } from "@/lib/validators/profile";

import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "Din profil — Vera",
  robots: { index: false, follow: false },
};

export default async function ProfileSetupPage() {
  const user = await requireUser("/profile/setup");

  const existing = await db.profile.findUnique({
    where: { id: user.id },
    select: {
      goals: true,
      level: true,
      equipment: true,
      daysPerWeek: true,
      timePerSession: true,
    },
  });

  const initial = {
    goals: (existing?.goals ?? []) as Goal[],
    level: (existing?.level ?? null) as Level | null,
    equipment: (existing?.equipment ?? []) as Equipment[],
    daysPerWeek: existing?.daysPerWeek ?? null,
    timePerSession: existing?.timePerSession ?? null,
  };

  const hasExisting = existing !== null && existing.level !== null;

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-10 space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          {hasExisting ? "Uppdatera profil" : "Sätt din profil"}
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          {hasExisting ? "Justera dina val." : "Berätta hur du vill träna."}
        </h1>
        <p className="text-pretty text-muted-foreground">
          Det vi vet om dig styr vilka pass som föreslås. Inga svar är slutgiltiga — du kan ändra
          dem när som helst.
        </p>
      </div>

      <ProfileForm initial={initial} />
    </div>
  );
}
