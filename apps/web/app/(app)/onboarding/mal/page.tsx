import { ProfileForm } from "@/app/(app)/profile/setup/profile-form";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { nextOnboardingHref } from "@/lib/onboarding/status";
import type { Equipment, Goal, Level } from "@/lib/validators/profile";

import { OnboardingHeader } from "../_components/onboarding-header";

export const metadata = {
  title: "Mål och förutsättningar — Vera",
  robots: { index: false, follow: false },
};

export default async function OnboardingGoalsPage() {
  const user = await requireUser("/onboarding/mal");

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

  return (
    <>
      <OnboardingHeader
        slug="mal"
        title="Berätta hur du vill träna."
        intro="Vad du väljer här styr vilka pass som föreslås. Inget svar är slutgiltigt — du kan ändra dem när som helst under Din profil."
      />
      <ProfileForm initial={initial} nextHref={nextOnboardingHref("mal")} />
    </>
  );
}
