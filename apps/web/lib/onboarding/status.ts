import "server-only";

import { db } from "@/lib/db";

/**
 * Onboarding-steg i den ordning användaren möter dem.
 * Håll i sync med app/(app)/onboarding/-routes.
 */
export const ONBOARDING_STEPS = [
  { slug: "mal", label: "Mål och förutsättningar", href: "/onboarding/mal" },
  { slug: "skador", label: "Skador och kontraindikationer", href: "/onboarding/skador" },
  { slug: "notiser", label: "Notifikationer", href: "/onboarding/notiser" },
] as const;

export type OnboardingSlug = (typeof ONBOARDING_STEPS)[number]["slug"];

export const ONBOARDING_TOTAL = ONBOARDING_STEPS.length;
export const ONBOARDING_DONE_HREF = "/onboarding/klar";

/**
 * Har användaren genomfört minsta obligatoriska onboarding-steget
 * (profil-setup med level satt)? Skador och notiser är valfria och
 * har defaults — de blockerar inte "onboarding klar".
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const profile = await db.profile.findUnique({
    where: { id: userId },
    select: { level: true },
  });
  return profile !== null && profile.level !== null;
}

/**
 * Nästa steg i sekvensen efter den given slug. Returnerar
 * ONBOARDING_DONE_HREF om det var sista steget.
 */
export function nextOnboardingHref(current: OnboardingSlug): string {
  const idx = ONBOARDING_STEPS.findIndex((s) => s.slug === current);
  const next = ONBOARDING_STEPS[idx + 1];
  return next ? next.href : ONBOARDING_DONE_HREF;
}

export function stepNumber(current: OnboardingSlug): number {
  return ONBOARDING_STEPS.findIndex((s) => s.slug === current) + 1;
}
