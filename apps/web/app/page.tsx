import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-svh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Vera · Utkast v0.1
          </div>
          <nav className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
            {user ? (
              <>
                <span className="hidden text-muted-foreground sm:inline">{user.email}</span>
                <LogoutButton />
              </>
            ) : (
              <a
                href="https://github.com/benbom/Fitness"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Källkod
              </a>
            )}
          </nav>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-24">
        <div className="max-w-3xl space-y-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {user ? "Inloggad" : "Under uppbyggnad"}
          </p>

          <h1 className="text-balance font-display text-6xl font-medium leading-[0.92] tracking-tight sm:text-7xl md:text-[7.5rem]">
            {user ? (
              <>
                Välkommen <em className="text-primary italic">till</em> Vera.
              </>
            ) : (
              <>
                Träning på <em className="text-primary italic">kroppens</em> villkor.
              </>
            )}
          </h1>

          {user ? (
            <div className="space-y-6">
              <p className="max-w-2xl text-pretty font-display text-xl leading-snug text-muted-foreground">
                Du är inloggad som <strong className="text-foreground">{user.email}</strong>. Sätt
                din profil så vi vet vilka pass som passar dig — du kan ändra dem när som helst.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/profile/setup">Sätt din profil</Link>
                </Button>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Din träningsplan och första passet dyker upp här när M1 (Core träning) landar. Följ
                utvecklingen i{" "}
                <a
                  href="https://github.com/benbom/Fitness/milestone/1"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  M0-milstonen på GitHub
                </a>
                .
              </p>
            </div>
          ) : (
            <>
              <p className="max-w-2xl text-pretty font-display text-xl leading-snug text-muted-foreground">
                En träningsapp för kvinnor 25–55, byggd runt cykel- och livsfasanpassad
                periodisering, styrka som första princip och en community fri från kaloriskam.
              </p>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/signup">Skapa konto</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Logga in</Link>
                </Button>
              </div>
              <p className="pt-2 text-sm text-muted-foreground">
                <a
                  href="https://github.com/benbom/Fitness/blob/main/docs/kravspec.md"
                  className="underline-offset-4 hover:underline"
                >
                  Läs kravspecen på GitHub
                </a>
              </p>
            </>
          )}
        </div>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <span>Vera · Fundament M0</span>
          <span>Byggd i det öppna · benbom/Fitness</span>
        </div>
      </footer>
    </main>
  );
}
