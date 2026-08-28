import { z } from "zod";

export const deleteAccountSchema = z.object({
  action: z.enum(["delete", "anonymize"]),
  confirmation: z.literal("RADERA", {
    errorMap: () => ({
      message: 'Skriv exakt "RADERA" (versaler) för att bekräfta.',
    }),
  }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
