import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { parseStoredPrefs } from "@/lib/validators/notification-prefs";

import { NotificationsForm } from "./notifications-form";

export const metadata = {
  title: "Notifikationer — Vera",
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const user = await requireUser("/profile/notifications");

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { notifPrefs: true },
  });

  const initial = parseStoredPrefs(profile?.notifPrefs);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-10 space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Notifikationer</p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Du bestämmer när vi hörs.
        </h1>
        <p className="text-pretty text-muted-foreground">
          Vi kopplar aldrig notiser till din cykel eller andra hälsodata utan att du bett om det.
          Marknadsföring är av som standard.
        </p>
      </div>

      <NotificationsForm initial={initial} />

      <div className="mt-16 border-t border-border pt-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/profile/data">← Tillbaka till din data</Link>
        </Button>
      </div>
    </div>
  );
}
