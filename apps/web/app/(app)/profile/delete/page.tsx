import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/require-user";

import { DeleteAccountForm } from "./delete-form";

export const metadata = {
  title: "Radera konto — Vera",
  robots: { index: false, follow: false },
};

export default async function DeleteAccountPage() {
  const user = await requireUser("/profile/delete");

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-10 space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-destructive">Radera konto</p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Är du säker?
        </h1>
        <p className="text-pretty text-muted-foreground">
          Du är på väg att göra en åtgärd som inte går att ångra. Ta gärna en{" "}
          <Link
            href="/api/profile/export"
            className="text-primary underline-offset-4 hover:underline"
          >
            dataexport
          </Link>{" "}
          först om du vill spara ditt spår.
        </p>
        <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Kontot som raderas: <strong className="text-foreground">{user.email}</strong>
        </p>
      </div>

      <DeleteAccountForm />

      <div className="mt-10 border-t border-border pt-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/profile/data">← Ångra, tillbaka till din data</Link>
        </Button>
      </div>
    </div>
  );
}
