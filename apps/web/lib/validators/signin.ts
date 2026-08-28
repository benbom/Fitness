import { z } from "zod";

export const signinSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ange en e-postadress.")
    .email("E-postadressen ser inte rätt ut."),
  password: z.string().min(1, "Ange ditt lösenord."),
});

export type SigninInput = z.infer<typeof signinSchema>;
