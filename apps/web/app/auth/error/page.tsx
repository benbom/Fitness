import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Något gick fel — Vera",
  robots: { index: false, follow: false },
};

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-svh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Vera · Utkast v0.1
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-destructive">
            Verifiering misslyckades
          </p>
          <h1 className="font-display text-4xl font-medium leading-tight tracking-tight">
            Länken kunde inte verifieras.
          </h1>
          <p className="text-pretty text-muted-foreground">
            Länken kan ha gått ut, redan använts eller inte matchat en pågående inloggning. Prova
            att registrera dig igen eller be om en ny länk.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">Registrera igen</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Till startsidan</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
