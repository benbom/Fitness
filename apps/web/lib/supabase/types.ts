/**
 * Placeholder Database-typ.
 *
 * När första schemat finns i Supabase-projektet (skapas i #48/M0-43),
 * generera riktig typ med:
 *
 *   pnpm dlx supabase gen types typescript \
 *     --project-id <PROJECT_ID> --schema public \
 *     > apps/web/lib/supabase/types.ts
 *
 * Fram tills dess: tom typ som räcker för att TypeScript ska godkänna
 * `.from("...")`-anrop utan att låta oss använda oexisterande tabeller.
 */
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type SupabaseSchema = Database["public"];
