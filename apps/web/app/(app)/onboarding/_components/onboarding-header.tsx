import { ONBOARDING_STEPS, type OnboardingSlug, stepNumber } from "@/lib/onboarding/status";

interface OnboardingHeaderProps {
  slug: OnboardingSlug;
  title: string;
  intro: string;
}

export function OnboardingHeader({ slug, title, intro }: OnboardingHeaderProps) {
  const current = stepNumber(slug);
  const total = ONBOARDING_STEPS.length;

  return (
    <div className="mb-10 space-y-4">
      <div
        className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted-foreground"
        aria-label={`Steg ${current} av ${total}`}
      >
        <span className="text-accent">
          Steg {current} / {total}
        </span>
        <ol className="flex flex-1 gap-1.5" aria-hidden="true">
          {ONBOARDING_STEPS.map((step, idx) => (
            <li
              key={step.slug}
              className={
                "h-1 flex-1 rounded-full " + (idx + 1 <= current ? "bg-accent" : "bg-border")
              }
            />
          ))}
        </ol>
      </div>

      <h1 className="font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
        {title}
      </h1>

      <p className="text-pretty text-muted-foreground">{intro}</p>
    </div>
  );
}
