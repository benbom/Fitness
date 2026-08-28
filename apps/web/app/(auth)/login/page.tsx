import Link from "next/link";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Logga in — Vera",
  description: "Logga in på ditt Vera-konto.",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : undefined;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Logga in</p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Välkommen tillbaka.
        </h1>
        <p className="text-pretty text-muted-foreground">Fyll i din e-post och ditt lösenord.</p>
      </div>

      <LoginForm next={next} />

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          Glömt lösenordet?{" "}
          <Link href="/reset-password" className="text-primary underline-offset-4 hover:underline">
            Återställ det här
          </Link>
        </p>
        <p>
          Har du inget konto än?{" "}
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            Skapa konto
          </Link>
        </p>
      </div>
    </div>
  );
}
