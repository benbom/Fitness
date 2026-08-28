import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Adjö — Vera",
  robots: { index: false, follow: false },
};

export default function GoodbyePage() {
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

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-16">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Klart</p>
          <h1 className="font-display text-5xl font-medium leading-tight tracking-tight">
            Ditt konto är borta.
          </h1>
          <p className="text-pretty font-display text-xl leading-snug text-muted-foreground">
            Tack för att du provade Vera. Om vi utvecklas i den riktning du hoppats på — dörren är
            öppen om du vill komma tillbaka.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="outline">
            <Link href="/">Till startsidan</Link>
          </Button>
        </div>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Vera
        </div>
      </footer>
    </main>
  );
}
