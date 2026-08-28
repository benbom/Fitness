-- Utökar profile-tabellen med de fält M0-26 kräver, samt lägger till
-- FK till auth.users(id) med CASCADE DELETE, RLS-policies och index.

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('get_stronger', 'feel_better', 'postpartum_recovery', 'perimenopause', 'event_prep');
CREATE TYPE "Level" AS ENUM ('beginner', 'experienced', 'lifts_heavy');
CREATE TYPE "Equipment" AS ENUM ('home', 'gym', 'outdoor');

-- AlterTable — lägg till de nya kolumnerna
ALTER TABLE "profile"
  ADD COLUMN "goals" "Goal"[] NOT NULL DEFAULT ARRAY[]::"Goal"[],
  ADD COLUMN "level" "Level",
  ADD COLUMN "equipment" "Equipment"[] NOT NULL DEFAULT ARRAY[]::"Equipment"[],
  ADD COLUMN "days_per_week" INTEGER,
  ADD COLUMN "time_per_session" INTEGER,
  ADD COLUMN "notif_prefs" JSONB NOT NULL DEFAULT '{}'::jsonb;

-- FK till Supabase auth.users — ON DELETE CASCADE så profil rensas med kontot (F-PR-04)
ALTER TABLE "profile"
  ADD CONSTRAINT "profile_id_fkey"
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

-- Row Level Security — ägaren är enda som får läsa/skriva egen rad
ALTER TABLE "profile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_select_own"
  ON "profile"
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profile_insert_own"
  ON "profile"
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profile_update_own"
  ON "profile"
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profile_delete_own"
  ON "profile"
  FOR DELETE
  USING (auth.uid() = id);

-- Anteckning: Prisma-klienten ansluter som postgres-user och bypassar RLS.
-- Application-lager-authorization i Server Actions är fortfarande obligatorisk
-- (filtrera alltid på user.id). RLS här är defense-in-depth mot direktanrop
-- via Supabase anon key (t.ex. framtida client-side queries).
