import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/require-user";
import { hasCompletedOnboarding } from "@/lib/onboarding/status";

export const metadata = {
  title: "Onboarding klar — Vera",
  robots: { index: false, follow: false },
};

export default async function OnboardingDonePage() {
  const user = await requireUser("/onboarding/klar");

  if (!(await hasCompletedOnboarding(user.id))) {
    redirect("/onboarding/mal");
  }

  return (
    <div className="space-y-8 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Onboarding klar</p>
      <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
        Redo att köra igång.
      </h1>
      <p className="mx-auto max-w-lg text-pretty text-muted-foreground">
        Din profil är sparad. När Core Träning (M1) landar dyker ditt första pass upp här. Under
        tiden — utforska gärna och justera preferenser när du vill.
      </p>

      <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href="/">Till startsidan</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/profile/data">Din data</Link>
        </Button>
      </div>
    </div>
  );
}
