import Link from "next/link";

import { ResetRequestForm } from "./reset-request-form";

export const metadata = {
  title: "Återställ lösenord — Vera",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Återställ lösenord
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Glömt lösenordet?
        </h1>
        <p className="text-pretty text-muted-foreground">
          Ange e-posten som är kopplad till kontot så mailar vi dig en länk för att sätta ett nytt
          lösenord.
        </p>
      </div>

      <ResetRequestForm />

      <p className="text-sm text-muted-foreground">
        Kommer på det?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Tillbaka till inloggning
        </Link>
      </p>
    </div>
  );
}
