import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        {children}
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Vera · Fundament M0
        </div>
      </footer>
    </main>
  );
}
