import { z } from "zod";

export const goalEnum = z.enum([
  "get_stronger",
  "feel_better",
  "postpartum_recovery",
  "perimenopause",
  "event_prep",
]);

export const levelEnum = z.enum(["beginner", "experienced", "lifts_heavy"]);

export const equipmentEnum = z.enum(["home", "gym", "outdoor"]);

export const profileSchema = z.object({
  goals: z.array(goalEnum).min(1, "Välj minst ett mål."),
  level: levelEnum,
  equipment: z.array(equipmentEnum).min(1, "Välj minst ett träningsställe."),
  daysPerWeek: z.coerce.number().int().min(1).max(7),
  timePerSession: z.coerce.number().int().min(10).max(120),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type Goal = z.infer<typeof goalEnum>;
export type Level = z.infer<typeof levelEnum>;
export type Equipment = z.infer<typeof equipmentEnum>;

/**
 * Svenska etiketter för användar-UI. Håll här så form och andra ytor
 * (framtida programgenerering, adaptivmotorförklaringar) delar samma
 * texter.
 */
export const goalLabels: Record<Goal, string> = {
  get_stronger: "Bli starkare",
  feel_better: "Må bättre",
  postpartum_recovery: "Återhämta efter graviditet",
  perimenopause: "Hantera perimenopaus",
  event_prep: "Förbereda evenemang",
};

export const levelLabels: Record<Level, string> = {
  beginner: "Nybörjare",
  experienced: "Van",
  lifts_heavy: "Tränar tungt",
};

export const equipmentLabels: Record<Equipment, string> = {
  home: "Hemma",
  gym: "Gym",
  outdoor: "Utomhus",
};
