import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/require-user";
import { decryptColumnNullable } from "@/lib/crypto/column";
import { db } from "@/lib/db";
import type { InjuryArea, InjurySeverity } from "@/lib/validators/injury";
import { INJURY_AREAS } from "@/lib/validators/injury";

import { InjuriesForm } from "./injuries-form";
import type { InjuryFormEntry } from "./state";

export const metadata = {
  title: "Skador & kontraindikationer — Vera",
  robots: { index: false, follow: false },
};

export default async function InjuriesPage() {
  const user = await requireUser("/profile/injuries");

  const existing = await db.injuryFlag.findMany({
    where: { userId: user.id },
    select: { area: true, severity: true, note: true },
  });

  const byArea = new Map<string, { severity: InjurySeverity; note: string }>();
  for (const row of existing) {
    let plain = "";
    try {
      plain = decryptColumnNullable(row.note) ?? "";
    } catch (err) {
      console.error("[injuries] Kunde inte dekryptera note — visar tomt fält:", err);
    }
    byArea.set(row.area, { severity: row.severity, note: plain });
  }

  const initial: InjuryFormEntry[] = INJURY_AREAS.map((area) => {
    const found = byArea.get(area);
    return {
      area: area as InjuryArea,
      severity: (found?.severity ?? "none") as InjurySeverity,
      note: found?.note ?? "",
    };
  });

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-10 space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Skador & kontraindikationer
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Berätta vad du behöver ta hänsyn till.
        </h1>
        <p className="text-pretty text-muted-foreground">
          Vad du väljer här filtrerar övningsval. Din anteckning är krypterad i databasen och syns
          inte i loggar — bara du och support (efter break-glass) kan läsa den i klartext.
        </p>
      </div>

      <InjuriesForm initial={initial} />

      <div className="mt-16 border-t border-border pt-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/profile/setup">← Tillbaka till profil</Link>
        </Button>
      </div>
    </div>
  );
}
