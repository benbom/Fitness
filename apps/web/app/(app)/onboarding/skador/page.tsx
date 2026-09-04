import { redirect } from "next/navigation";

import { InjuriesForm } from "@/app/(app)/profile/injuries/injuries-form";
import type { InjuryFormEntry } from "@/app/(app)/profile/injuries/state";
import { requireUser } from "@/lib/auth/require-user";
import { decryptColumnNullable } from "@/lib/crypto/column";
import { db } from "@/lib/db";
import { log } from "@/lib/log/logger";
import { getRequestId } from "@/lib/log/request-id";
import { hasCompletedOnboarding, nextOnboardingHref } from "@/lib/onboarding/status";
import type { InjuryArea, InjurySeverity } from "@/lib/validators/injury";
import { INJURY_AREAS } from "@/lib/validators/injury";

import { OnboardingHeader } from "../_components/onboarding-header";

export const metadata = {
  title: "Skador — Vera",
  robots: { index: false, follow: false },
};

export default async function OnboardingInjuriesPage() {
  const user = await requireUser("/onboarding/skador");

  // Om användaren inte satt profil än — skicka till steg 1
  if (!(await hasCompletedOnboarding(user.id))) {
    redirect("/onboarding/mal");
  }

  const logger = log.child({
    requestId: await getRequestId(),
    page: "onboarding-skador",
    userId: user.id,
  });

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
      logger.error("Kunde inte dekryptera note — visar tomt fält", { err, area: row.area });
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

  const nextHref = nextOnboardingHref("skador");

  return (
    <>
      <OnboardingHeader
        slug="skador"
        title="Något vi bör ta hänsyn till?"
        intro="Vad du väljer här filtrerar övningsval. Din anteckning är krypterad i databasen och syns inte i loggar — bara du och support (efter break-glass) kan läsa den i klartext. Hoppa gärna över om inget är aktuellt."
      />
      <InjuriesForm initial={initial} nextHref={nextHref} skipHref={nextHref} />
    </>
  );
}
