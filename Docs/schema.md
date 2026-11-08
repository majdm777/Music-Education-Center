# Database Schema (Prisma v6)

Music & Education Center Management System. PostgreSQL, Prisma 6.
**11 tables.** Version 6, 4 Nov 2026. This document is the database source of truth; `apps/api/prisma/schema.prisma` mirrors it.

---

## 1. Invariants

These rules are enforced by the application and, where PostgreSQL allows it, by the database. They must not be re-litigated during implementation.

1. **Prices are snapshotted.** `Enrollment.monthlyPrice` is calculated when the student is enrolled and saved. Later changes to `Subject` prices or `GradeLevel` rates never affect existing enrollments.
2. **Balance is never stored.** It is computed from non-voided `LedgerEntry` rows: `CHARGE - PAYMENT + REFUND`, per enrollment and summed per student. A negative balance is a credit.
3. **Music sessions are counted, never stored as a counter.** Remaining = `Enrollment.sessionsPerMonth` minus the number of `Session` rows inside the Asia/Beirut calendar month. The count resets monthly with no carry-over.
4. **Money rows are voided, never deleted.** A correction sets `voidedAt`; the row stays for audit. A refund is a real, separate `REFUND` entry, not a void.
5. **Every transaction snapshots its currency.** Payments, refunds and expenses store `amount`, `currency`, `lbpPerUsd` and `amountUsd`. Changing the exchange rate never rewrites history.
6. **All stored money amounts are positive.** Direction comes from `LedgerEntry.type`; the balance formula applies the sign.
7. **One live charge per enrollment per month.** Enforced by a partial unique index that ignores voided rows, so a voided charge can be re-issued.
8. **Calendar dates are Beirut dates.** Timestamps are stored in UTC; month windows, "today" and display are computed in `Asia/Beirut`.
9. **An enrollment's type matches its subject.** A composite foreign key on `(subjectId, type)` makes a MUSIC enrollment on an EDUCATION subject impossible, and vice versa.
10. **One live slot per student.** Only one `ACTIVE` enrollment may exist per `(studentId, subjectId, format)`, and a student may have only one `Session` at a given instant.
11. **Cash fields have one meaning.** `amount`, `currency`, `lbpPerUsd` and `method` exist only on payments and refunds; only payments carry a receipt number.

---

## 2. Tables

| Table | Purpose |
| --- | --- |
| `Student` | The person, archived rather than deleted |
| `Teacher` | Teachers and their pay notes; no login |
| `Subject` | Instruments and school subjects/agenda, with two prices, lesson minutes and a music session allowance |
| `GradeLevel` | Grade name and price rate (education only) |
| `Enrollment` | One student, one subject, one format, one teacher; saved price and discount |
| `Session` | One student in one calendar slot; a group class is several rows with the same slot |
| `LedgerEntry` | Every charge, payment and refund, with void date |
| `Expense` | Costs used for profit, optionally linked to a teacher |
| `ExchangeRate` | Manual USD to LBP rates, one per effective date |
| `Setting` | Key/value configuration (center, calendar, defaults, backup state) |
| `AdminUser` | Login, encrypted TOTP secret, recovery codes, lockout state |

---

## 3. Prisma schema

```prisma
// ============================================================
// Music & Education Center -- Database Schema v6
// PostgreSQL + Prisma 6
//
// 11 tables:
//   Student, Teacher, Subject, GradeLevel, Enrollment, Session,
//   LedgerEntry, Expense, ExchangeRate, Setting, AdminUser
//
// Invariants:
//   * Prices are monthly, in USD, and saved on the Enrollment.
//   * Balance = CHARGE - PAYMENT + REFUND over non-voided rows.
//   * Remaining music sessions = sessionsPerMonth - Session rows
//     in the Beirut calendar month. Counted, never stored.
//   * Money rows are voided, never deleted.
//   * Transactions store the exchange rate they used.
//   * Stored money amounts are positive; the type gives direction.
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ---------------- Enums ----------------

enum SubjectType {
  MUSIC     // instruments
  EDUCATION // school subjects and agenda
}

enum ClassFormat {
  ONE_ON_ONE
  GROUP
}

enum EnrollmentStatus {
  ACTIVE
  PAUSED
  ENDED
}

enum DiscountType {
  PERCENT
  FIXED
}

enum LedgerType {
  CHARGE  // adds to what the student owes
  PAYMENT // reduces what the student owes
  REFUND  // money returned; adds back to what is owed
}

enum Currency {
  USD
  LBP
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  WHISH
  OMT
  CARD
  OTHER
}

enum ExpenseCategory {
  TEACHER_PAY
  RENT
  UTILITIES
  EQUIPMENT
  MARKETING
  OTHER
}

enum Language {
  AR
  EN
}

// ---------------- People ----------------

model Student {
  id          String    @id @default(cuid())
  fullName    String
  birthDate   DateTime? @db.Date
  phone       String?
  parentName  String?
  parentPhone String?
  school      String?
  notes       String?
  isArchived  Boolean   @default(false)
  createdAt   DateTime @db.Timestamptz(3)  @default(now())
  updatedAt   DateTime @db.Timestamptz(3)  @updatedAt

  enrollments Enrollment[]

  @@index([fullName])
  @@index([parentPhone])
  @@index([isArchived, fullName])
}

model Teacher {
  id        String   @id @default(cuid())
  fullName  String
  phone     String?
  payNotes  String?  // agreed pay terms, free text
  isActive  Boolean  @default(true)
  createdAt DateTime @db.Timestamptz(3) @default(now())
  updatedAt DateTime @db.Timestamptz(3) @updatedAt

  enrollments Enrollment[]
  sessions    Session[]
  expenses    Expense[]

  @@index([isActive, fullName])
}

// ---------------- Price book ----------------

// Every instrument and every school subject / agenda service.
// "Piano" (MUSIC), "Math" (EDUCATION), "Agenda" (EDUCATION)
model Subject {
  id              String      @id @default(cuid())
  name            String
  type            SubjectType
  groupPrice      Decimal     @db.Decimal(12, 2) // USD per month
  oneOnOnePrice   Decimal     @db.Decimal(12, 2) // USD per month
  monthlySessions Int?        // MUSIC: default sessions per month
  groupMinutes    Int?        // default lesson length, GROUP; null -> Setting default
  oneOnOneMinutes Int?        // default lesson length, ONE_ON_ONE
  isActive        Boolean     @default(true)
  createdAt       DateTime @db.Timestamptz(3)    @default(now())
  updatedAt       DateTime @db.Timestamptz(3)    @updatedAt

  enrollments Enrollment[]

  @@unique([id, type]) // supports the composite FK from Enrollment
  @@unique([name, type])
  @@index([type, isActive])
}

// School grades and their price rate: "Grade 3" = 1.2
model GradeLevel {
  id        String   @id @default(cuid())
  name      String   @unique
  rate      Decimal  @db.Decimal(6, 3)
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @db.Timestamptz(3) @default(now())
  updatedAt DateTime @db.Timestamptz(3) @updatedAt

  enrollments Enrollment[]
}

// ---------------- Enrollment ----------------

// One student, one subject. Every enrollment is a one-month plan that renews.
// type MUSIC: gradeLevelId stays empty.
// type EDUCATION: gradeLevelId is required (service + DB check).
model Enrollment {
  id           String           @id @default(cuid())
  type         SubjectType
  studentId    String
  subjectId    String
  gradeLevelId String?
  teacherId    String
  format       ClassFormat
  status       EnrollmentStatus @default(ACTIVE)
  startDate    DateTime         @db.Date
  endDate      DateTime?        @db.Date

  sessionsPerMonth Int?    // MUSIC only: copied from the subject, editable per student
  monthlyPrice     Decimal @db.Decimal(12, 2) // USD, saved at enrollment, before discount
  discountType     DiscountType?
  discountValue    Decimal? @db.Decimal(12, 2)

  notes     String?
  createdAt DateTime @db.Timestamptz(3) @default(now())
  updatedAt DateTime @db.Timestamptz(3) @updatedAt

  student    Student     @relation(fields: [studentId], references: [id])
  // Composite FK: Enrollment.type must equal Subject.type.
  subject    Subject     @relation(fields: [subjectId, type], references: [id, type], onDelete: Restrict)
  gradeLevel GradeLevel? @relation(fields: [gradeLevelId], references: [id])
  teacher    Teacher     @relation(fields: [teacherId], references: [id])

  sessions Session[]
  ledger   LedgerEntry[]

  @@index([studentId])
  @@index([teacherId])
  @@index([subjectId, status])
  @@index([status])
}

// ---------------- Calendar ----------------

// One student in one calendar slot. A group class is several rows with the
// same teacher and time, one per student. Deleting a row returns the session.
// Group identity is the tuple (teacherId, startsAt, endsAt): overlap warnings
// ignore rows inside the same tuple.
// repeatGroupId links the rows created by one weekly repeat; editing scope
// "one" or "following" uses it.
model Session {
  id            String   @id @default(cuid())
  enrollmentId  String
  teacherId     String
  startsAt      DateTime @db.Timestamptz(3)
  endsAt        DateTime @db.Timestamptz(3)
  note          String?
  repeatGroupId String?
  createdAt     DateTime @db.Timestamptz(3) @default(now())
  updatedAt     DateTime @db.Timestamptz(3) @updatedAt

  enrollment Enrollment @relation(fields: [enrollmentId], references: [id])
  teacher    Teacher    @relation(fields: [teacherId], references: [id])

  @@unique([enrollmentId, startsAt]) // one enrollment cannot have two sessions at the same instant
  @@index([teacherId, startsAt])
  @@index([startsAt])
  @@index([repeatGroupId, startsAt])
}

// ---------------- Money ----------------

// Every charge, payment and refund of an enrollment.
// To fix a mistake, set voidedAt. Never delete.
//
// CHARGE  : periodMonth = first day of the covered month (required)
// PAYMENT : receiptNumber + currency + amount + lbpPerUsd + method (required)
// REFUND  : same cash fields as PAYMENT, no receipt, no periodMonth
model LedgerEntry {
  id           String     @id @default(cuid())
  enrollmentId String
  type         LedgerType
  date         DateTime   @db.Date
  periodMonth  DateTime?  @db.Date // CHARGE: first day of the month it covers
  note         String?

  // Value in USD (what the balance uses)
  amountUsd Decimal @db.Decimal(14, 2)

  // PAYMENT / REFUND only: what was actually moved
  amount        Decimal?       @db.Decimal(18, 2)
  currency      Currency?
  lbpPerUsd     Decimal?       @db.Decimal(18, 2) // rate used when recorded
  method        PaymentMethod?
  receiptNumber Int?           @unique // assigned by the app; payments only

  voidedAt  DateTime? @db.Timestamptz(3)
  createdAt DateTime @db.Timestamptz(3)  @default(now())
  updatedAt DateTime @db.Timestamptz(3)  @updatedAt

  enrollment Enrollment @relation(fields: [enrollmentId], references: [id])

  @@index([enrollmentId])
  @@index([date])
  @@index([type, periodMonth])
  @@index([voidedAt])

  // NOTE: the "one live charge per month" rule is a PARTIAL unique index,
  // not a Prisma @@unique. See the SQL appendix.
}

model Expense {
  id          String          @id @default(cuid())
  category    ExpenseCategory
  description String
  date        DateTime        @db.Date
  teacherId   String?         // optional; any category may name a related teacher
  notes       String?

  amount    Decimal  @db.Decimal(18, 2)
  currency  Currency
  lbpPerUsd Decimal  @db.Decimal(18, 2)
  amountUsd Decimal  @db.Decimal(14, 2)

  voidedAt  DateTime? @db.Timestamptz(3)
  createdAt DateTime @db.Timestamptz(3)  @default(now())
  updatedAt DateTime @db.Timestamptz(3)  @updatedAt

  teacher Teacher? @relation(fields: [teacherId], references: [id], onDelete: Restrict)

  @@index([date])
  @@index([category, date])
  @@index([voidedAt])
}

// The USD to LBP rate the admin updates by hand.
// "Rate in effect" = the row with the latest effectiveDate <= the transaction date.
model ExchangeRate {
  id            String   @id @default(cuid())
  lbpPerUsd     Decimal  @db.Decimal(18, 2)
  effectiveDate DateTime @db.Date @unique
  createdAt     DateTime @db.Timestamptz(3) @default(now())
  updatedAt     DateTime @db.Timestamptz(3) @updatedAt
}

// ---------------- Configuration ----------------

// Key/value settings. Values are JSON so the registry can be typed in Zod.
// Keys are listed in section 6.
model Setting {
  key       String   @id
  value     Json
  updatedAt DateTime @db.Timestamptz(3) @updatedAt
}

// ---------------- Login ----------------

model AdminUser {
  id                  String    @id @default(cuid())
  email               String    @unique @db.Citext // case-insensitive login identity
  name                String
  passwordHash        String
  language            Language  @default(EN)
  totpSecretEncrypted String?
  twoFactorEnabled    Boolean   @default(false)
  recoveryCodeHashes  String[]  @default([])

  // Lockout and session revocation without an extra session table.
  failedLoginAttempts Int       @default(0)
  lockedUntil         DateTime? @db.Timestamptz(3)
  tokenVersion        Int       @default(0)
  lastLoginAt         DateTime? @db.Timestamptz(3)

  createdAt DateTime @db.Timestamptz(3) @default(now())
  updatedAt DateTime @db.Timestamptz(3) @updatedAt
}
```

---

## 4. SQL appendix

Prisma cannot express partial unique indexes or `CHECK` constraints. Composite keys, `citext`, and `timestamptz` are also written explicitly so the database shape is unambiguous. The SQL lives in two migrations:

- `migrations/20261104000000_init` — tables, base indexes, base checks, the charge index, and the receipt sequence.
- `migrations/20261106000000_harden_constraints` — `citext`, `timestamptz`, the composite subject FK, stricter unique indexes, and the remaining checks.

`pnpm db:verify` checks the names and key definitions. `pnpm db:drift` compares the live database with `prisma/schema.prisma`.

### 4.1 Unique rules

```sql
-- One live charge per enrollment per month. Voided rows are ignored so a
-- corrected charge can be created.
CREATE UNIQUE INDEX "ledger_one_charge_per_month"
  ON "LedgerEntry" ("enrollmentId", "periodMonth")
  WHERE "type" = 'CHARGE' AND "voidedAt" IS NULL;

-- One live enrollment per student, subject, and format.
CREATE UNIQUE INDEX "enrollment_one_active_per_subject_format"
  ON "Enrollment" ("studentId", "subjectId", "format")
  WHERE "status" = 'ACTIVE';

-- One enrollment cannot have two sessions at the same instant. Two enrollments
-- of the same student can still be booked at once; that cross-enrollment rule
-- is not enforced by the database.
CREATE UNIQUE INDEX "Session_enrollmentId_startsAt_key"
  ON "Session" ("enrollmentId", "startsAt");

-- Target for the Enrollment -> Subject composite foreign key.
CREATE UNIQUE INDEX "Subject_id_type_key" ON "Subject" ("id", "type");
```

### 4.2 Composite and foreign keys

```sql
ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_subjectId_type_fkey"
    FOREIGN KEY ("subjectId", "type") REFERENCES "Subject" ("id", "type")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- An expense may name a teacher (any category); that teacher cannot be deleted
-- while the expense still references them.
ALTER TABLE "Expense"
  ADD CONSTRAINT "Expense_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
```

### 4.3 Ledger constraints

```sql
ALTER TABLE "LedgerEntry"
  -- The init migration keeps ledger_amount_usd_nonnegative (>= 0). A CHARGE may
  -- be exactly zero when a discount covers the whole price; a PAYMENT or REFUND
  -- of zero is meaningless.
  ADD CONSTRAINT "ledger_amount_usd_positive"
    CHECK ("type" = 'CHARGE' OR "amountUsd" > 0),
  ADD CONSTRAINT "ledger_amount_positive"
    CHECK ("amount" IS NULL OR "amount" > 0),
  ADD CONSTRAINT "ledger_charge_requires_period"
    CHECK ("type" <> 'CHARGE' OR "periodMonth" IS NOT NULL),
  ADD CONSTRAINT "ledger_period_only_for_charge"
    CHECK ("type" = 'CHARGE' OR "periodMonth" IS NULL),
  ADD CONSTRAINT "ledger_period_first_day"
    CHECK ("periodMonth" IS NULL OR EXTRACT(DAY FROM "periodMonth") = 1),
  ADD CONSTRAINT "ledger_payment_requires_receipt"
    CHECK ("type" <> 'PAYMENT' OR "receiptNumber" IS NOT NULL),
  ADD CONSTRAINT "ledger_receipt_only_for_payment"
    CHECK ("type" = 'PAYMENT' OR "receiptNumber" IS NULL),
  ADD CONSTRAINT "ledger_receipt_positive"
    CHECK ("receiptNumber" IS NULL OR "receiptNumber" > 0),
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
  ADD CONSTRAINT "ledger_rate_positive"
    CHECK ("lbpPerUsd" IS NULL OR "lbpPerUsd" > 0);
```

### 4.4 Enrollment and price constraints

```sql
ALTER TABLE "Enrollment"
  ADD CONSTRAINT "enrollment_price_nonnegative"
    CHECK ("monthlyPrice" >= 0),
  ADD CONSTRAINT "enrollment_discount_nonnegative"
    CHECK ("discountValue" IS NULL OR "discountValue" >= 0),
  ADD CONSTRAINT "enrollment_discount_percent_range"
    CHECK (
      "discountType" IS NULL OR
      "discountType" <> 'PERCENT' OR
      ("discountValue" >= 0 AND "discountValue" <= 100)
    ),
  ADD CONSTRAINT "enrollment_discount_pair"
    CHECK (("discountType" IS NULL) = ("discountValue" IS NULL)),
  ADD CONSTRAINT "enrollment_education_requires_grade"
    CHECK ("type" <> 'EDUCATION' OR "gradeLevelId" IS NOT NULL),
  ADD CONSTRAINT "enrollment_music_has_no_grade"
    CHECK ("type" <> 'MUSIC' OR "gradeLevelId" IS NULL),
  ADD CONSTRAINT "enrollment_music_sessions_only"
    CHECK ("type" = 'MUSIC' OR "sessionsPerMonth" IS NULL),
  ADD CONSTRAINT "enrollment_music_requires_sessions"
    CHECK ("type" <> 'MUSIC' OR "sessionsPerMonth" IS NOT NULL),
  ADD CONSTRAINT "enrollment_dates_ordered"
    CHECK ("endDate" IS NULL OR "endDate" >= "startDate"),
  ADD CONSTRAINT "enrollment_ended_has_end_date"
    CHECK ("status" <> 'ENDED' OR "endDate" IS NOT NULL),
  ADD CONSTRAINT "enrollment_sessions_positive"
    CHECK ("sessionsPerMonth" IS NULL OR "sessionsPerMonth" > 0);

ALTER TABLE "Subject"
  ADD CONSTRAINT "subject_prices_nonnegative"
    CHECK ("groupPrice" >= 0 AND "oneOnOnePrice" >= 0),
  ADD CONSTRAINT "subject_one_on_one_at_least_group"
    CHECK ("oneOnOnePrice" >= "groupPrice"),
  ADD CONSTRAINT "subject_sessions_positive"
    CHECK ("monthlySessions" IS NULL OR "monthlySessions" > 0),
  ADD CONSTRAINT "subject_music_sessions_only"
    CHECK ("type" = 'MUSIC' OR "monthlySessions" IS NULL),
  ADD CONSTRAINT "subject_minutes_positive"
    CHECK (
      ("groupMinutes" IS NULL OR "groupMinutes" > 0) AND
      ("oneOnOneMinutes" IS NULL OR "oneOnOneMinutes" > 0)
    );

ALTER TABLE "GradeLevel"
  ADD CONSTRAINT "grade_rate_positive"
    CHECK ("rate" > 0);
```

### 4.5 Session constraint

```sql
ALTER TABLE "Session"
  ADD CONSTRAINT "session_times_ordered"
    CHECK ("endsAt" > "startsAt");
```

### 4.6 Expense and rate constraints

```sql
ALTER TABLE "Expense"
  ADD CONSTRAINT "expense_amounts_nonnegative"
    CHECK ("amount" >= 0 AND "amountUsd" >= 0),
  ADD CONSTRAINT "expense_rate_positive"
    CHECK ("lbpPerUsd" > 0),
  ADD CONSTRAINT "expense_currency_consistent"
    CHECK (
      ("currency" = 'USD' AND "amount" = "amountUsd") OR
      ("currency" = 'LBP' AND "amountUsd" = round("amount" / "lbpPerUsd", 2))
    );
-- The teacher link is optional for every category. A TEACHER_PAY expense does
-- not need one, and any other category may still name the teacher it relates to.

ALTER TABLE "ExchangeRate"
  ADD CONSTRAINT "exchange_rate_positive"
    CHECK ("lbpPerUsd" > 0);
```

### 4.7 Identity constraints

`btrim` strips spaces by default, so every nonblank check also strips tabs,
newlines, and carriage returns. A value made only of whitespace is rejected.

```sql
ALTER TABLE "Student"
  ADD CONSTRAINT "student_full_name_nonblank" CHECK (btrim("fullName", E' \t\n\r') <> '');
ALTER TABLE "Teacher"
  ADD CONSTRAINT "teacher_full_name_nonblank" CHECK (btrim("fullName", E' \t\n\r') <> '');
ALTER TABLE "Subject"
  ADD CONSTRAINT "subject_name_nonblank" CHECK (btrim("name", E' \t\n\r') <> '');
ALTER TABLE "GradeLevel"
  ADD CONSTRAINT "grade_name_nonblank" CHECK (btrim("name", E' \t\n\r') <> '');
ALTER TABLE "Setting"
  ADD CONSTRAINT "setting_key_nonblank" CHECK (btrim("key", E' \t\n\r') <> '');
ALTER TABLE "Expense"
  ADD CONSTRAINT "expense_description_nonblank" CHECK (btrim("description", E' \t\n\r') <> '');
ALTER TABLE "AdminUser"
  ADD CONSTRAINT "admin_email_nonblank" CHECK (btrim("email"::text, E' \t\n\r') <> ''),
  ADD CONSTRAINT "admin_name_nonblank" CHECK (btrim("name", E' \t\n\r') <> ''),
  ADD CONSTRAINT "admin_2fa_requires_secret"
    CHECK (NOT "twoFactorEnabled" OR "totpSecretEncrypted" IS NOT NULL);
```

### 4.8 Receipt numbers

```sql
-- Global, monotonic, never reused. Assigned inside the payment transaction:
--   SELECT nextval('receipt_number_seq');
CREATE SEQUENCE "receipt_number_seq" AS INTEGER START WITH 1 INCREMENT BY 1;
```

### 4.9 Enforced in the service layer

Some rules cross tables or depend on the caller's intent, so they cannot be CHECK constraints. They are centralized in `packages/shared` and the NestJS services, and covered by tests:

- A refund may not exceed the enrollment's non-voided payments minus prior refunds, checked inside the same transaction.
- A charge proposal for month M includes enrollments where `startDate <= last day of M` and `status <> 'PAUSED'`, and:
  - `ACTIVE`: always included;
  - `ENDED`: included only when `endDate >= first day of M` (the final month is billed; the next month is not);
  - and there is no live charge for M.
- The session allowance for a music enrollment is copied from the subject at creation, then owned by the enrollment.

---

## 5. Money rules

| Rule | Definition |
| --- | --- |
| Base currency | USD. All prices and `amountUsd` are USD. |
| Payment/refund | Stores `amount` in `currency`, the rate `lbpPerUsd`, and `amountUsd = round(amount / lbpPerUsd, 2)` for LBP; for USD, `amountUsd = amount` and the effective rate is still stored for reporting. |
| Rounding | HALF_UP to 2 decimals, via `decimal.js` in `packages/shared`. Never JavaScript floats. |
| Balance | `sum(CHARGE.amountUsd) - sum(PAYMENT.amountUsd) + sum(REFUND.amountUsd)` over non-voided rows. Negative = credit. |
| Revenue | `sum(PAYMENT.amountUsd) - sum(REFUND.amountUsd)` by `date`, non-voided. |
| Profit | Revenue - non-voided expenses by `date`. |
| Refund cap | Non-voided refunds for an enrollment cannot exceed non-voided payments minus prior refunds. Enforced in a transaction. |
| Charge amount | `monthlyPrice` minus the enrollment discount (percent, or fixed clamped at 0). Editable per charge in the review list; saved on the `CHARGE` row. May be exactly `0` when the discount covers the whole price. |
| Void | Sets `voidedAt`; balance and revenue exclude the row immediately. Receipt numbers are never reused. |
| Receipts | Global monotonic sequence; gaps after a rolled-back transaction are acceptable. |
| Dashboard conversion | USD totals are converted for the LBP view at the rate effective on the period end. If no rate exists on that date, the latest prior rate is used and the UI labels it. |
| Outstanding | Sum of positive per-enrollment balances as of the period end (charges with `periodMonth` up to the period end, payments/refunds with `date` up to the period end). Credits are reported separately, not netted against other students. |

---

## 6. Settings registry

`Setting.value` is JSON; every key is validated by a Zod schema in `packages/shared`.

| Key | Type | Example | Used by |
| --- | --- | --- | --- |
| `center.name` | string | `"Center Name"` | UI, receipts, Excel |
| `center.logoUrl` | string \| null | `null` | UI, receipts |
| `center.primaryColor` | string | `"#0f766e"` | Theme tokens |
| `calendar.openDays` | number[] (0=Sun) | `[1,2,3,4,5,6]` | Calendar |
| `calendar.openTime` | `"HH:mm"` | `"09:00"` | Calendar |
| `calendar.closeTime` | `"HH:mm"` | `"21:00"` | Calendar |
| `defaults.language` | `"ar"` \| `"en"` | `"ar"` | First load |
| `defaults.lessonMinutes` | number | `60` | Session length when the subject has no value |
| `backup.lastExportAt` | ISO datetime \| null | `null` | 7-day export reminder |

---

## 7. Date and time rules

- Store `Session.startsAt/endsAt` and all `createdAt/updatedAt` in UTC (`timestamptz`).
- `date`, `periodMonth`, `startDate`, `endDate` and `effectiveDate` are calendar dates (`@db.Date`); Prisma returns them at UTC midnight, so never call `new Date()` on them directly.
- One shared date utility in `packages/shared` owns: Beirut "today", month start/end, month key, and UTC conversion. No ad-hoc date math.
- `periodMonth` is always the **first day of the covered month**. A charge for November 2026 stores `2026-11-01`.
- Session counting window: `[startOfMonth(Beirut), startOfNextMonth(Beirut))` converted to UTC. Unit tests must cover both 2026 DST transitions and the month boundary at midnight Beirut.
- "Overdue": an enrollment with a positive balance and at least one non-voided charge whose `periodMonth` is strictly before the current Beirut month.

---

## 8. Session rules

| Action | Effect on the count |
| --- | --- |
| Assign a student to a slot | +1 Session row |
| Group lesson (N students, same teacher/time) | N rows, one per enrollment; same slot tuple |
| Move a slot (change time/teacher) | Row updated; count unchanged |
| Delete one row | -1; the session is returned |
| Delete "this and following" | Removes rows in the repeat group from that time on |
| Attendance | Not tracked in v1; assigning uses the session whether or not the student attends |
| Cross-month move | Counts in the month of `startsAt` |
| Exceed allowance | Warning returned by the API; admin can override |

`Session.teacherId` is who delivers the lesson; it may differ from `Enrollment.teacherId` (a substitute). Revenue attribution uses the enrollment teacher, never the session teacher.

---

## 9. Authentication and configuration

- One admin account, created by the seed script; no public sign-up.
- Password hash: argon2id. TOTP secret: AES-256-GCM with a key from the environment. Recovery codes: 10 high-entropy codes, SHA-256 hashed, single use.
- Session: signed JWT (HS256) in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie, 30-minute expiry, sliding renewal on activity. `AdminUser.tokenVersion` is embedded and bumped to revoke all sessions.
- Lockout: after repeated failures set `failedLoginAttempts` and `lockedUntil`; reset on success or password reset.
- No personal data in logs.

---

## 10. Migration notes (v5 to v6)

There is no production data yet, so v6 is created as the **initial** migration rather than an incremental one. For reference, the differences from the v5 document are:

1. `LedgerType` gains `REFUND`.
2. `Subject` gains `groupMinutes` and `oneOnOneMinutes`.
3. `Session` gains `repeatGroupId`.
4. New `Setting` table; table count goes from 10 to 11.
5. `ExchangeRate.effectiveDate` becomes unique.
6. `LedgerEntry` loses `@@unique([enrollmentId, type, periodMonth])` and gains the partial unique index instead.
7. `AdminUser` gains `failedLoginAttempts`, `lockedUntil`, `tokenVersion`, `lastLoginAt`.
8. `updatedAt` is added to all mutable models.
9. Currency and amount fields are documented as payment **and refund** fields.
10. Cash and period `CHECK` constraints, and the receipt sequence, are added in SQL.
11. The hardening migration (`20261106000000_harden_constraints`) adds `citext` email, `timestamptz` instants, the composite subject FK, one-active-enrollment and session-slot uniqueness, stricter financial coherence checks, and RESTRICT on teacher deletion.

Two deployment notes for the hardening migration:

- Existing instants are converted with `USING <column> AT TIME ZONE 'UTC'`, so the stored instant is preserved regardless of the connection's time zone.
- Converting `AdminUser.email` to `CITEXT` rebuilds a unique index. Before deploying to a database that already has admins, find emails that differ only by case with `SELECT lower(email), count(*) FROM "AdminUser" GROUP BY 1 HAVING count(*) > 1;` and reconcile them. If the deploy fails, clear the failed record with `pnpm --filter @mec/api exec prisma migrate resolve --rolled-back 20261106000000_harden_constraints`, then retry.

---

## 11. Seed data

The seed script must be idempotent and must not invent business facts the client has not given us.

| Data | Source |
| --- | --- |
| Admin user | `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the environment; fail if missing. 2FA is set up on first login. |
| Grade levels | A basic Lebanese ladder (KG1-KG3, Grade 1-12) with rate `1.000`; the client edits rates later. |
| Subjects | A small sample set (Piano, Guitar, Violin, Math, Arabic, English, Physics, Chemistry, Agenda) marked inactive until priced. |
| Settings | `center.name = "Center Name"`, open days Mon-Sat, 09:00-21:00, `defaults.lessonMinutes = 60`, `defaults.language = "ar"`. |
| Exchange rate | One row, only if `SEED_LBP_PER_USD` is set; otherwise the app asks the admin to enter it. |
