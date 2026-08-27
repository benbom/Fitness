import Link from "next/link";

import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Skapa konto — Vera",
  description: "Registrera dig för Vera. Ingen viktnedgång som mål. Cykel som takt.",
};

export default function SignupPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Skapa konto</p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Välkommen till Vera.
        </h1>
        <p className="text-pretty text-muted-foreground">
          Registrera dig med e-post och ett lösenord. Vi mailar en verifieringslänk du behöver
          klicka innan du kan logga in.
        </p>
      </div>

      <SignupForm />

      <p className="text-sm text-muted-foreground">
        Har du redan ett konto?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Logga in
        </Link>
      </p>
    </div>
  );
}
