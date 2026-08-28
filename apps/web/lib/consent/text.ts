/**
 * Kanoniska samtyckestexter — versionerade.
 *
 * När vi ändrar texten ska den EXAKT samma text visas i UI:t som sparas
 * i consent-loggen. Utan detta kan användaren i efterhand hävda "jag
 * godkände inte det här", och vi kan inte bevisa vad de såg.
 *
 * Regel: skapa nytt versionsdatum om texten ändras. Lämna gamla texter
 * kvar så äldre loggrader fortfarande kan förklaras.
 */
export const CONSENT_TEXTS = {
  terms_privacy_signup_2026_08_28:
    "Jag godkänner Veras villkor och integritetspolicy. Jag förstår att min träningsdata lagras i EU och inte delas med annonsnätverk.",
} as const;

export type ConsentTextKey = keyof typeof CONSENT_TEXTS;

/**
 * Hämta aktuell text för signup-samtycket. Endast en käll-till-sanning
 * för både form-JSX och Server Action:s consent-loggning.
 */
export const SIGNUP_CONSENT_TEXT = CONSENT_TEXTS.terms_privacy_signup_2026_08_28;
