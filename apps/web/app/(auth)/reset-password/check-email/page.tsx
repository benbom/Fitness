import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Kolla din mail — Vera",
  robots: { index: false, follow: false },
};

export default function CheckEmailPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Länk på väg</p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight">
          Kolla din mail.
        </h1>
        <p className="text-pretty text-muted-foreground">
          Om e-posten är kopplad till ett konto har vi skickat en återställningslänk. Klicka på
          länken för att sätta ett nytt lösenord.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Inget mail? Kolla skräpposten. Om du använder en annan adress kan du{" "}
          <Link href="/reset-password" className="text-primary underline-offset-4 hover:underline">
            begära en ny länk
          </Link>
          .
        </p>
      </div>

      <Button asChild variant="ghost" size="sm">
        <Link href="/">← Tillbaka till startsidan</Link>
      </Button>
    </div>
  );
}
