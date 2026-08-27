import { z } from "zod";

import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";

export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ange en e-postadress.")
    .email("E-postadressen ser inte rätt ut."),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Lösenordet behöver vara minst ${MIN_PASSWORD_LENGTH} tecken.`),
  consent: z.literal("on", {
    errorMap: () => ({
      message: "Du behöver godkänna villkoren och integritetspolicyn för att fortsätta.",
    }),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>;
