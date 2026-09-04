import { redirect } from "next/navigation";

import { NotificationsForm } from "@/app/(app)/profile/notifications/notifications-form";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { hasCompletedOnboarding, nextOnboardingHref } from "@/lib/onboarding/status";
import { parseStoredPrefs } from "@/lib/validators/notification-prefs";

import { OnboardingHeader } from "../_components/onboarding-header";

export const metadata = {
  title: "Notifikationer — Vera",
  robots: { index: false, follow: false },
};

export default async function OnboardingNotifsPage() {
  const user = await requireUser("/onboarding/notiser");

  if (!(await hasCompletedOnboarding(user.id))) {
    redirect("/onboarding/mal");
  }

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { notifPrefs: true },
  });

  const initial = parseStoredPrefs(profile?.notifPrefs);
  const nextHref = nextOnboardingHref("notiser");

  return (
    <>
      <OnboardingHeader
        slug="notiser"
        title="När vill du höra av oss?"
        intro="Marknadsföring är av som standard — vi kopplar aldrig notiser till cykel eller andra hälsodata utan att du bett om det. Du kan ändra allt senare."
      />
      <NotificationsForm initial={initial} nextHref={nextHref} skipHref={nextHref} />
    </>
  );
}
