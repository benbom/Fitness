-- Injury flag och audit-tabell (M0-29). Klass 2-data enligt ADR-004.
-- `note` är application-krypterad (AES-256-GCM, lib/crypto/column.ts) och
-- lagras som BYTEA. RLS gör att bara ägaren når sina egna rader.
-- Audit-triggern skriver append-only rader på alla ändringar.

-- Enums --------------------------------------------------------------------

CREATE TYPE "InjuryArea" AS ENUM (
  'back',
  'knee',
  'shoulder',
  'pelvic_floor',
  'diastasis',
  'other'
);

CREATE TYPE "InjurySeverity" AS ENUM (
  'none',
  'mild',
  'moderate',
  'severe'
);

CREATE TYPE "InjuryAuditAction" AS ENUM (
  'insert',
  'update',
  'delete'
);

-- injury_flag --------------------------------------------------------------

CREATE TABLE "injury_flag" (
  "id"         UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID              NOT NULL,
  "area"       "InjuryArea"      NOT NULL,
  "severity"   "InjurySeverity"  NOT NULL DEFAULT 'none',
  "note"       BYTEA,
  "created_at" TIMESTAMPTZ       NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ       NOT NULL DEFAULT now(),
  CONSTRAINT "injury_flag_user_area_unique" UNIQUE ("user_id", "area"),
  CONSTRAINT "injury_flag_user_fk" FOREIGN KEY ("user_id") REFERENCES auth.users("id") ON DELETE CASCADE
);

CREATE INDEX "injury_flag_user_id_idx" ON "injury_flag" ("user_id");

ALTER TABLE "injury_flag" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "injury_flag_select_own"
  ON "injury_flag" FOR SELECT
  USING (auth.uid() = "user_id");

CREATE POLICY "injury_flag_insert_own"
  ON "injury_flag" FOR INSERT
  WITH CHECK (auth.uid() = "user_id");

CREATE POLICY "injury_flag_update_own"
  ON "injury_flag" FOR UPDATE
  USING (auth.uid() = "user_id")
  WITH CHECK (auth.uid() = "user_id");

CREATE POLICY "injury_flag_delete_own"
  ON "injury_flag" FOR DELETE
  USING (auth.uid() = "user_id");

-- injury_flag_audit --------------------------------------------------------

CREATE TABLE "injury_flag_audit" (
  "id"              UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  "injury_flag_id"  UUID                 NOT NULL,
  "user_id"         UUID                 NOT NULL,
  "action"          "InjuryAuditAction"  NOT NULL,
  "changed_at"      TIMESTAMPTZ          NOT NULL DEFAULT now()
);

CREATE INDEX "injury_flag_audit_user_id_changed_at_idx"
  ON "injury_flag_audit" ("user_id", "changed_at" DESC);

ALTER TABLE "injury_flag_audit" ENABLE ROW LEVEL SECURITY;

-- Bara ägaren får läsa sin audit-historik. Inga INSERT-policies för
-- application-koden — bara triggern (som kör med definer-rättigheter)
-- får skriva. Inga UPDATE/DELETE-policies alls.
CREATE POLICY "injury_flag_audit_select_own"
  ON "injury_flag_audit" FOR SELECT
  USING (auth.uid() = "user_id");

-- Trigger som fångar alla ändringar --------------------------------------

CREATE OR REPLACE FUNCTION "injury_flag_audit_fn"()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO "injury_flag_audit" ("injury_flag_id", "user_id", "action")
    VALUES (NEW."id", NEW."user_id", 'insert');
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO "injury_flag_audit" ("injury_flag_id", "user_id", "action")
    VALUES (NEW."id", NEW."user_id", 'update');
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO "injury_flag_audit" ("injury_flag_id", "user_id", "action")
    VALUES (OLD."id", OLD."user_id", 'delete');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER "injury_flag_audit_trg"
AFTER INSERT OR UPDATE OR DELETE ON "injury_flag"
FOR EACH ROW EXECUTE FUNCTION "injury_flag_audit_fn"();
