import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Lösenord uppdaterat — Vera",
  robots: { index: false, follow: false },
};

export default function DonePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Klart</p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Lösenordet är uppdaterat.
        </h1>
        <p className="text-pretty text-muted-foreground">
          Du kan nu logga in med det nya lösenordet.
        </p>
      </div>

      <Button asChild size="lg">
        <Link href="/login">Logga in</Link>
      </Button>
    </div>
  );
}
