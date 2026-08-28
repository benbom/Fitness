-- Consent-loggning: append-only tabell för samtyckesbeslut per ADR-004.

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('terms_privacy', 'marketing', 'health_data');
CREATE TYPE "ConsentAction" AS ENUM ('granted', 'revoked');

-- CreateTable
CREATE TABLE "consent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "ConsentType" NOT NULL,
    "action" "ConsentAction" NOT NULL,
    "text_shown" TEXT NOT NULL,
    "screen_id" TEXT NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT "consent_pkey" PRIMARY KEY ("id")
);

-- Index för att snabbt hitta senaste samtycke per typ per användare
CREATE INDEX "consent_user_id_type_created_at_idx"
    ON "consent" ("user_id", "type", "created_at" DESC);

-- FK till auth.users — CASCADE så historiken rensas med kontot (F-PR-04)
ALTER TABLE "consent"
    ADD CONSTRAINT "consent_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;

-- Row Level Security — ägaren är enda som får läsa/insertera egna rader
ALTER TABLE "consent" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consent_select_own"
    ON "consent"
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "consent_insert_own"
    ON "consent"
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Ingen UPDATE-policy. Ingen DELETE-policy. Append-only enforcement:
-- Prisma bypassar RLS (postgres-user), men application-koden anropar
-- aldrig .update() eller .delete() på Consent-modellen. Om vi vill ha
-- hårdare skydd senare — lägg till triggers RAISE EXCEPTION ON UPDATE OR DELETE.

COMMENT ON TABLE "consent" IS 'Append-only samtyckesloggning per ADR-004. Ingen UPDATE eller DELETE i application-kod.';
