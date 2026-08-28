import { NewPasswordForm } from "./new-password-form";

export const metadata = {
  title: "Sätt nytt lösenord — Vera",
  robots: { index: false, follow: false },
};

export default function NewPasswordPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Nytt lösenord</p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Välj ett nytt lösenord.
        </h1>
        <p className="text-pretty text-muted-foreground">
          Skriv in ett nytt lösenord. Det ersätter det gamla direkt när du sparat.
        </p>
      </div>

      <NewPasswordForm />
    </div>
  );
}
