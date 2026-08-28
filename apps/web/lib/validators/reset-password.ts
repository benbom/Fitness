import { z } from "zod";

import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

export const resetRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ange en e-postadress.")
    .email("E-postadressen ser inte rätt ut."),
});

export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Lösenordet behöver vara minst ${MIN_PASSWORD_LENGTH} tecken.`),
});

export type ResetRequestInput = z.infer<typeof resetRequestSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
