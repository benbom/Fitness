import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";

export const metadata = {
  title: "Din data — Vera",
  robots: { index: false, follow: false },
};

export default async function DataPage() {
  const user = await requireUser("/profile/data");

  const [profileExists, consentCount, injuryCount] = await Promise.all([
    db.profile.findUnique({ where: { id: user.id }, select: { id: true } }),
    db.consent.count({ where: { userId: user.id } }),
    db.injuryFlag.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-10 space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Din data</p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Full kontroll.
        </h1>
        <p className="text-pretty text-muted-foreground">
          Vera lagrar bara det vi behöver för att din träningsplan ska funka. Du kan ladda ner allt
          eller radera allt — utan hjälp från oss.
        </p>
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 space-y-1">
            <h2 className="font-display text-2xl font-medium tracking-tight">
              Vad Vera har om dig
            </h2>
            <p className="text-sm text-muted-foreground">
              Snabb överblick — full fil via nedladdningen nedan.
            </p>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Konto
              </dt>
              <dd className="text-foreground">{user.email}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Profil
              </dt>
              <dd className="text-foreground">{profileExists ? "Sparad" : "Inte satt"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Samtyckesrader
              </dt>
              <dd className="text-foreground">{consentCount}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Skade-flaggor
              </dt>
              <dd className="text-foreground">
                {injuryCount === 0 ? "Inga" : `${injuryCount} st (krypterade)`}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Konto skapat
              </dt>
              <dd className="text-foreground">
                {new Date(user.created_at).toLocaleDateString("sv-SE")}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 space-y-1">
            <h2 className="font-display text-2xl font-medium tracking-tight">Ladda ner all data</h2>
            <p className="text-sm text-muted-foreground">
              JSON-fil med konto, profil och full samtyckeshistorik. Klart att importera eller bara
              spara för säkerhets skull.
            </p>
          </div>
          <Button asChild size="lg">
            <a href="/api/profile/export" download>
              Ladda ner min data (JSON)
            </a>
          </Button>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 space-y-1">
            <h2 className="font-display text-2xl font-medium tracking-tight">Notifikationer</h2>
            <p className="text-sm text-muted-foreground">
              Bestäm vad du vill höra av oss — och när. Marknadsföring är av som standard.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <Link href="/profile/notifications">Ändra preferenser</Link>
          </Button>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 space-y-1">
            <h2 className="font-display text-2xl font-medium tracking-tight">Radera konto</h2>
            <p className="text-sm text-muted-foreground">
              Ta bort allt Vera vet om dig, eller anonymisera för intern statistik. Går inte att
              ångra — ladda ner exporten först om du vill spara ditt spår.
            </p>
          </div>
          <Button asChild size="lg" variant="destructive">
            <Link href="/profile/delete">Fortsätt till radering</Link>
          </Button>
        </section>

        <div className="pt-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/profile/setup">← Tillbaka till profilen</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
