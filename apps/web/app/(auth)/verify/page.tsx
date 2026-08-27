import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Kolla din mail — Vera",
  robots: { index: false, follow: false },
};

export default function VerifyPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Verifiera e-post</p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight">
          Kolla din mail.
        </h1>
        <p className="text-pretty text-muted-foreground">
          Vi har skickat en verifieringslänk till adressen du angav. Klicka på länken för att
          slutföra registreringen. Länken är giltig i 24 timmar.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Hittar du inte mailet? Kolla skräpposten — vissa e-postleverantörer är hårdare mot nya
          avsändare. Vill du använda en annan adress kan du{" "}
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            registrera igen
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
