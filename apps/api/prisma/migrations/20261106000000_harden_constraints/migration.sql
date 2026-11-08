-- Harden the initial schema with database-enforced invariants.
-- Everything here is additive except the constraint/index replacements that
-- make an existing rule stricter.

-- Case-insensitive admin email needs the citext extension.
CREATE EXTENSION IF NOT EXISTS "citext";

-- CITEXT makes AdminUser.email case-insensitive. If this migration ever runs
-- against a database whose admin emails differ only by case, the unique index
-- rebuild fails. Before deploying, find duplicates with:
--   SELECT lower(email), count(*) FROM "AdminUser" GROUP BY 1 HAVING count(*) > 1;
-- Reconcile them, then retry. After a failed deploy, clear the failed record with
--   pnpm --filter @mec/api exec prisma migrate resolve --rolled-back 20261106000000_harden_constraints
-- and re-run the deploy.

-- Enforce Enrollment.type = Subject.type with a composite foreign key.
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_subjectId_fkey";

-- Deleting a teacher must not silently detach financial history.
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_teacherId_fkey";

-- An enrollment cannot have two sessions at the same instant.
DROP INDEX "Session_enrollmentId_startsAt_idx";

-- Store instants with time zone; calendar dates stay DATE. Existing values were
-- written by Prisma in UTC, so USING ... AT TIME ZONE 'UTC' preserves the
-- instant regardless of the connection's TimeZone setting.
ALTER TABLE "AdminUser"
  ALTER COLUMN "email" SET DATA TYPE CITEXT,
  ALTER COLUMN "recoveryCodeHashes" SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "lockedUntil" SET DATA TYPE TIMESTAMPTZ(3) USING "lockedUntil" AT TIME ZONE 'UTC',
  ALTER COLUMN "lastLoginAt" SET DATA TYPE TIMESTAMPTZ(3) USING "lastLoginAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

ALTER TABLE "Enrollment"
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

ALTER TABLE "ExchangeRate"
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

ALTER TABLE "Expense"
  ALTER COLUMN "voidedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "voidedAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

ALTER TABLE "GradeLevel"
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

ALTER TABLE "LedgerEntry"
  ALTER COLUMN "voidedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "voidedAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

ALTER TABLE "Session"
  ALTER COLUMN "startsAt" SET DATA TYPE TIMESTAMPTZ(3) USING "startsAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "endsAt" SET DATA TYPE TIMESTAMPTZ(3) USING "endsAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

ALTER TABLE "Setting"
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

ALTER TABLE "Student"
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

ALTER TABLE "Subject"
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

ALTER TABLE "Teacher"
  ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

CREATE UNIQUE INDEX "Session_enrollmentId_startsAt_key" ON "Session"("enrollmentId", "startsAt");

CREATE UNIQUE INDEX "Subject_id_type_key" ON "Subject"("id", "type");

ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_subjectId_type_fkey"
    FOREIGN KEY ("subjectId", "type") REFERENCES "Subject"("id", "type")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Expense"
  ADD CONSTRAINT "Expense_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Only one live enrollment per student, subject and format.
CREATE UNIQUE INDEX "enrollment_one_active_per_subject_format"
  ON "Enrollment" ("studentId", "subjectId", "format")
  WHERE "status" = 'ACTIVE';

-- ---------- LedgerEntry ----------

ALTER TABLE "LedgerEntry"
  DROP CONSTRAINT "ledger_cash_fields";

-- The init migration keeps ledger_amount_usd_nonnegative (>= 0). A CHARGE may be
-- exactly zero when a discount covers the whole monthly price, but a PAYMENT or
-- REFUND of zero is meaningless.
ALTER TABLE "LedgerEntry"
  ADD CONSTRAINT "ledger_amount_usd_positive"
    CHECK ("type" = 'CHARGE' OR "amountUsd" > 0),
  ADD CONSTRAINT "ledger_amount_positive"
    CHECK ("amount" IS NULL OR "amount" > 0),
  ADD CONSTRAINT "ledger_receipt_positive"
    CHECK ("receiptNumber" IS NULL OR "receiptNumber" > 0),
  ADD CONSTRAINT "ledger_receipt_only_for_payment"
    CHECK ("type" = 'PAYMENT' OR "receiptNumber" IS NULL),
  ADD CONSTRAINT "ledger_cash_fields_required"
    CHECK (
      "type" NOT IN ('PAYMENT', 'REFUND') OR (
        "amount" IS NOT NULL AND
        "currency" IS NOT NULL AND
        "lbpPerUsd" IS NOT NULL AND
        "method" IS NOT NULL
      )
    ),
  ADD CONSTRAINT "ledger_cash_fields_only"
    CHECK (
      "type" IN ('PAYMENT', 'REFUND') OR (
        "amount" IS NULL AND
        "currency" IS NULL AND
        "lbpPerUsd" IS NULL AND
        "method" IS NULL
      )
    ),
  ADD CONSTRAINT "ledger_currency_consistent"
    CHECK (
      "type" NOT IN ('PAYMENT', 'REFUND') OR
      ("currency" = 'USD' AND "amount" = "amountUsd") OR
      ("currency" = 'LBP' AND "amountUsd" = round("amount" / "lbpPerUsd", 2))
    ),
  ADD CONSTRAINT "ledger_period_first_day"
    CHECK ("periodMonth" IS NULL OR EXTRACT(DAY FROM "periodMonth") = 1);

-- ---------- Enrollment / Subject ----------

ALTER TABLE "Enrollment"
  ADD CONSTRAINT "enrollment_music_sessions_only"
    CHECK ("type" = 'MUSIC' OR "sessionsPerMonth" IS NULL),
  ADD CONSTRAINT "enrollment_music_requires_sessions"
    CHECK ("type" <> 'MUSIC' OR "sessionsPerMonth" IS NOT NULL);

ALTER TABLE "Subject"
  ADD CONSTRAINT "subject_music_sessions_only"
    CHECK ("type" = 'MUSIC' OR "monthlySessions" IS NULL),
  ADD CONSTRAINT "subject_one_on_one_at_least_group"
    CHECK ("oneOnOnePrice" >= "groupPrice");

-- ---------- Identity text ----------

ALTER TABLE "Student"
  ADD CONSTRAINT "student_full_name_nonblank"
    CHECK (btrim("fullName", E' \t\n\r\f\u000b\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff') <> '');

ALTER TABLE "Teacher"
  ADD CONSTRAINT "teacher_full_name_nonblank"
    CHECK (btrim("fullName", E' \t\n\r\f\u000b\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff') <> '');

ALTER TABLE "Subject"
  ADD CONSTRAINT "subject_name_nonblank"
    CHECK (btrim("name", E' \t\n\r\f\u000b\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff') <> '');

ALTER TABLE "GradeLevel"
  ADD CONSTRAINT "grade_name_nonblank"
    CHECK (btrim("name", E' \t\n\r\f\u000b\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff') <> '');

ALTER TABLE "Setting"
  ADD CONSTRAINT "setting_key_nonblank"
    CHECK (btrim("key", E' \t\n\r\f\u000b\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff') <> '');

ALTER TABLE "AdminUser"
  ADD CONSTRAINT "admin_email_nonblank"
    CHECK (btrim("email"::text, E' \t\n\r\f\u000b\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff') <> ''),
  ADD CONSTRAINT "admin_name_nonblank"
    CHECK (btrim("name", E' \t\n\r\f\u000b\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff') <> ''),
  ADD CONSTRAINT "admin_2fa_requires_secret"
    CHECK (NOT "twoFactorEnabled" OR "totpSecretEncrypted" IS NOT NULL);

-- ---------- Expense ----------

ALTER TABLE "Expense"
  ADD CONSTRAINT "expense_description_nonblank"
    CHECK (btrim("description", E' \t\n\r\f\u000b\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff') <> ''),
  ADD CONSTRAINT "expense_currency_consistent"
    CHECK (
      ("currency" = 'USD' AND "amount" = "amountUsd") OR
      ("currency" = 'LBP' AND "amountUsd" = round("amount" / "lbpPerUsd", 2))
    );
