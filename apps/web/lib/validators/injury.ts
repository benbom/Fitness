import { z } from "zod";

export const injuryAreaEnum = z.enum([
  "back",
  "knee",
  "shoulder",
  "pelvic_floor",
  "diastasis",
  "other",
]);

export const injurySeverityEnum = z.enum(["none", "mild", "moderate", "severe"]);

export type InjuryArea = z.infer<typeof injuryAreaEnum>;
export type InjurySeverity = z.infer<typeof injurySeverityEnum>;

export const NOTE_MAX_LEN = 500;

const injuryEntrySchema = z.object({
  area: injuryAreaEnum,
  severity: injurySeverityEnum,
  note: z
    .string()
    .trim()
    .max(NOTE_MAX_LEN, `Anteckning får vara max ${NOTE_MAX_LEN} tecken.`)
    .optional()
    .default(""),
});

export const injuriesInputSchema = z.object({
  entries: z.array(injuryEntrySchema).max(20),
});

export type InjuryEntryInput = z.infer<typeof injuryEntrySchema>;
export type InjuriesInput = z.infer<typeof injuriesInputSchema>;

/** Svenska etiketter för UI. Delas mellan formulär och framtida vyer. */
export const injuryAreaLabels: Record<InjuryArea, string> = {
  back: "Rygg",
  knee: "Knä",
  shoulder: "Axel",
  pelvic_floor: "Bäckenbotten",
  diastasis: "Diastas (magmuskeldelning)",
  other: "Annat",
};

export const injurySeverityLabels: Record<InjurySeverity, string> = {
  none: "Ingen begränsning",
  mild: "Lätt — jag anpassar själv",
  moderate: "Måttlig — undvik tunga lyft",
  severe: "Svår — hoppa över helt",
};

export const INJURY_AREAS: InjuryArea[] = [
  "back",
  "knee",
  "shoulder",
  "pelvic_floor",
  "diastasis",
  "other",
];
