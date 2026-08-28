import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { requireUser } from "@/lib/auth/require-user";

/**
 * Layout för inloggade vyer.
 *
 * requireUser() redirect:ar till /login om ingen session finns —
 * alla sidor under app/(app)/ är därför automatiskt skyddade.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Vera · Utkast v0.1
          </Link>
          <nav className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
            <span className="hidden text-muted-foreground sm:inline">{user.email}</span>
            <LogoutButton />
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <span>Vera · Fundament M0</span>
          <span>Byggd i det öppna · benbom/Fitness</span>
        </div>
      </footer>
    </div>
  );
}
