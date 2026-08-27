import "server-only";

export const MIN_PASSWORD_LENGTH = 12;

export type PasswordValidationResult =
  { ok: true } | { ok: false; reason: "too_short" | "compromised" };

async function sha1Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * K-Anonymity-koll mot Have I Been Pwned. Vi skickar bara de fem första
 * tecknen av SHA-1-hashen, aldrig lösenordet självt.
 *
 * Fail-open: om HIBP är nere blockerar vi inte signup. Det är ett
 * medvetet val — signup-friktion tunnar ut användare, medan en kort
 * outage sällan sammanfaller med en aktiv säkerhetsattack.
 * `Add-Padding: true`-headern gör svaret konstant i storlek så
 * mellanhänder inte kan gissa vilket prefix vi frågade om.
 */
export async function isPasswordCompromised(password: string): Promise<boolean> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const text = await res.text();
    return text
      .split("\n")
      .some((line) => line.trim().split(":")[0]?.trim().toUpperCase() === suffix);
  } catch {
    return false;
  }
}

export async function validatePassword(password: string): Promise<PasswordValidationResult> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, reason: "too_short" };
  }
  if (await isPasswordCompromised(password)) {
    return { ok: false, reason: "compromised" };
  }
  return { ok: true };
}

/**
 * Läsbara felmeddelanden på svenska. Håll dem konstruktiva —
 * en "för svagt"-text ska inte skämma användaren utan hjälpa
 * dem över tröskeln.
 */
export function passwordErrorMessage(reason: "too_short" | "compromised"): string {
  switch (reason) {
    case "too_short":
      return `Lösenordet behöver vara minst ${MIN_PASSWORD_LENGTH} tecken.`;
    case "compromised":
      return "Det här lösenordet har läckt i en känd databas. Välj ett nytt — vad som helst du inte använder någon annanstans.";
  }
}
