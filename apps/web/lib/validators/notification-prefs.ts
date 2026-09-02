import { z } from "zod";

/**
 * Notifikations-preferenser (M0-28, F-PR-05).
 *
 * Skam-fritt språk: aldrig antaga att användaren vill koppla notiser
 * till cykel-data. Tystnadsperioder är fri veckodags-val + timmar,
 * inte "under din mens".
 *
 * Default: allt marknadsföringsrelaterat är AV. Träning + framsteg
 * är på så första passet inte tystnas i onboarding.
 */

export const notificationCategoryKeys = [
  "training_reminders",
  "progress_updates",
  "content_tips",
  "product_news",
  "community_mentions",
] as const;

export type NotificationCategoryKey = (typeof notificationCategoryKeys)[number];

export const notificationFrequencyEnum = z.enum(["immediate", "daily", "weekly", "off"]);
export type NotificationFrequency = z.infer<typeof notificationFrequencyEnum>;

const categorySchema = z.object({
  enabled: z.boolean(),
  frequency: notificationFrequencyEnum,
});

const hourSchema = z.coerce.number().int().min(0).max(23);

export const notificationPrefsSchema = z.object({
  categories: z.object({
    training_reminders: categorySchema,
    progress_updates: categorySchema,
    content_tips: categorySchema,
    product_news: categorySchema,
    community_mentions: categorySchema,
  }),
  quiet_hours: z.object({
    enabled: z.boolean(),
    startHour: hourSchema,
    endHour: hourSchema,
  }),
});

export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>;
export type CategoryPref = z.infer<typeof categorySchema>;

/**
 * Defaults per kategori. Marketing (product_news) är OFF by default —
 * kravspec F-PR-05 kräver aktivt samtycke.
 */
export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  categories: {
    training_reminders: { enabled: true, frequency: "daily" },
    progress_updates: { enabled: true, frequency: "weekly" },
    content_tips: { enabled: false, frequency: "weekly" },
    product_news: { enabled: false, frequency: "off" },
    community_mentions: { enabled: true, frequency: "immediate" },
  },
  quiet_hours: {
    enabled: true,
    startHour: 22,
    endHour: 7,
  },
};

/**
 * Svenska etiketter. Håll skam-fritt: säg vad notisen gör, inte varför
 * användaren "behöver" den.
 */
export const categoryLabels: Record<NotificationCategoryKey, string> = {
  training_reminders: "Träningspåminnelser",
  progress_updates: "Framsteg och milstolpar",
  content_tips: "Artiklar och guider",
  product_news: "Produktnyheter och erbjudanden",
  community_mentions: "När någon svarar dig i community",
};

export const categoryDescriptions: Record<NotificationCategoryKey, string> = {
  training_reminders: "En knuff om dagens pass — inget mer.",
  progress_updates: "När du når en ny nivå eller stänger en veckas mål.",
  content_tips: "Nya guider när vi publicerar dem.",
  product_news: "Marknadsföring. Av som standard. Slår du på det tackar vi.",
  community_mentions: "Direkt om någon skriver till dig.",
};

export const frequencyLabels: Record<NotificationFrequency, string> = {
  immediate: "När det händer",
  daily: "Dagligen",
  weekly: "Veckovis",
  off: "Aldrig",
};

/**
 * Marketing-kategori. Används i tester för att verifiera att default
 * håller sig av även om schema ändras.
 */
export const MARKETING_CATEGORY: NotificationCategoryKey = "product_news";

/**
 * Parse-hjälp: säkerställ att data som kommer tillbaka från DB följer
 * schemat. Om något är felformat (t.ex. gammal version) återgår vi
 * till defaults för de trasiga fälten via mergning i UI-lagret.
 */
export function parseStoredPrefs(raw: unknown): NotificationPrefs {
  const result = notificationPrefsSchema.safeParse(raw);
  if (result.success) return result.data;
  return DEFAULT_NOTIFICATION_PREFS;
}
