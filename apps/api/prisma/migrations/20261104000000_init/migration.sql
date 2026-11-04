-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('MUSIC', 'EDUCATION');

-- CreateEnum
CREATE TYPE "ClassFormat" AS ENUM ('ONE_ON_ONE', 'GROUP');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('CHARGE', 'PAYMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'LBP');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'WHISH', 'OMT', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('TEACHER_PAY', 'RENT', 'UTILITIES', 'EQUIPMENT', 'MARKETING', 'OTHER');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('AR', 'EN');

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" DATE,
    "phone" TEXT,
    "parentName" TEXT,
    "parentPhone" TEXT,
    "school" TEXT,
    "notes" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "payNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SubjectType" NOT NULL,
    "groupPrice" DECIMAL(12,2) NOT NULL,
    "oneOnOnePrice" DECIMAL(12,2) NOT NULL,
    "monthlySessions" INTEGER,
    "groupMinutes" INTEGER,
    "oneOnOneMinutes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(6,3) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradeLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "type" "SubjectType" NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "gradeLevelId" TEXT,
    "teacherId" TEXT NOT NULL,
    "format" "ClassFormat" NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "sessionsPerMonth" INTEGER,
    "monthlyPrice" DECIMAL(12,2) NOT NULL,
    "discountType" "DiscountType",
    "discountValue" DECIMAL(12,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "repeatGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "type" "LedgerType" NOT NULL,
    "date" DATE NOT NULL,
    "periodMonth" DATE,
    "note" TEXT,
    "amountUsd" DECIMAL(14,2) NOT NULL,
    "amount" DECIMAL(18,2),
    "currency" "Currency",
    "lbpPerUsd" DECIMAL(18,2),
    "method" "PaymentMethod",
    "receiptNumber" INTEGER,
    "voidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "teacherId" TEXT,
    "notes" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "lbpPerUsd" DECIMAL(18,2) NOT NULL,
    "amountUsd" DECIMAL(14,2) NOT NULL,
    "voidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "lbpPerUsd" DECIMAL(18,2) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'EN',
    "totpSecretEncrypted" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "recoveryCodeHashes" TEXT[],
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Student_fullName_idx" ON "Student"("fullName");

-- CreateIndex
CREATE INDEX "Student_parentPhone_idx" ON "Student"("parentPhone");

-- CreateIndex
CREATE INDEX "Student_isArchived_fullName_idx" ON "Student"("isArchived", "fullName");

-- CreateIndex
CREATE INDEX "Teacher_isActive_fullName_idx" ON "Teacher"("isActive", "fullName");

-- CreateIndex
CREATE INDEX "Subject_type_isActive_idx" ON "Subject"("type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_type_key" ON "Subject"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "GradeLevel_name_key" ON "GradeLevel"("name");

-- CreateIndex
CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");

-- CreateIndex
CREATE INDEX "Enrollment_teacherId_idx" ON "Enrollment"("teacherId");

-- CreateIndex
CREATE INDEX "Enrollment_subjectId_status_idx" ON "Enrollment"("subjectId", "status");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE INDEX "Session_enrollmentId_startsAt_idx" ON "Session"("enrollmentId", "startsAt");

-- CreateIndex
CREATE INDEX "Session_teacherId_startsAt_idx" ON "Session"("teacherId", "startsAt");

-- CreateIndex
CREATE INDEX "Session_startsAt_idx" ON "Session"("startsAt");

-- CreateIndex
CREATE INDEX "Session_repeatGroupId_startsAt_idx" ON "Session"("repeatGroupId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_receiptNumber_key" ON "LedgerEntry"("receiptNumber");

-- CreateIndex
CREATE INDEX "LedgerEntry_enrollmentId_idx" ON "LedgerEntry"("enrollmentId");

-- CreateIndex
CREATE INDEX "LedgerEntry_date_idx" ON "LedgerEntry"("date");

-- CreateIndex
CREATE INDEX "LedgerEntry_type_periodMonth_idx" ON "LedgerEntry"("type", "periodMonth");

-- CreateIndex
CREATE INDEX "LedgerEntry_voidedAt_idx" ON "LedgerEntry"("voidedAt");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex
CREATE INDEX "Expense_category_date_idx" ON "Expense"("category", "date");

-- CreateIndex
CREATE INDEX "Expense_voidedAt_idx" ON "Expense"("voidedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_effectiveDate_key" ON "ExchangeRate"("effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "GradeLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Replaces the old @@unique([enrollmentId, type, periodMonth]).
-- Voided rows are ignored, so a corrected charge can be created.
CREATE UNIQUE INDEX "ledger_one_charge_per_month"
  ON "LedgerEntry" ("enrollmentId", "periodMonth")
  WHERE "type" = 'CHARGE' AND "voidedAt" IS NULL;

ALTER TABLE "LedgerEntry"
  ADD CONSTRAINT "ledger_amount_usd_nonnegative"
    CHECK ("amountUsd" >= 0),
  ADD CONSTRAINT "ledger_charge_requires_period"
    CHECK ("type" <> 'CHARGE' OR "periodMonth" IS NOT NULL),
  ADD CONSTRAINT "ledger_period_only_for_charge"
    CHECK ("type" = 'CHARGE' OR "periodMonth" IS NULL),
  ADD CONSTRAINT "ledger_payment_requires_receipt"
    CHECK ("type" <> 'PAYMENT' OR "receiptNumber" IS NOT NULL),
  ADD CONSTRAINT "ledger_cash_fields"
    CHECK (
      "type" NOT IN ('PAYMENT', 'REFUND') OR (
        "amount" IS NOT NULL AND
        "currency" IS NOT NULL AND
        "lbpPerUsd" IS NOT NULL AND
        "method" IS NOT NULL
      )
    ),
  ADD CONSTRAINT "ledger_rate_positive"
    CHECK ("lbpPerUsd" IS NULL OR "lbpPerUsd" > 0);

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
  ADD CONSTRAINT "enrollment_dates_ordered"
    CHECK ("endDate" IS NULL OR "endDate" >= "startDate"),
  ADD CONSTRAINT "enrollment_ended_has_end_date"
    CHECK ("status" <> 'ENDED' OR "endDate" IS NOT NULL),
  ADD CONSTRAINT "enrollment_sessions_positive"
    CHECK ("sessionsPerMonth" IS NULL OR "sessionsPerMonth" > 0);

ALTER TABLE "Subject"
  ADD CONSTRAINT "subject_prices_nonnegative"
    CHECK ("groupPrice" >= 0 AND "oneOnOnePrice" >= 0),
  ADD CONSTRAINT "subject_sessions_positive"
    CHECK ("monthlySessions" IS NULL OR "monthlySessions" > 0),
  ADD CONSTRAINT "subject_minutes_positive"
    CHECK (
      ("groupMinutes" IS NULL OR "groupMinutes" > 0) AND
      ("oneOnOneMinutes" IS NULL OR "oneOnOneMinutes" > 0)
    );

ALTER TABLE "GradeLevel"
  ADD CONSTRAINT "grade_rate_positive"
    CHECK ("rate" > 0);

ALTER TABLE "Session"
  ADD CONSTRAINT "session_times_ordered"
    CHECK ("endsAt" > "startsAt");

ALTER TABLE "Expense"
  ADD CONSTRAINT "expense_amounts_nonnegative"
    CHECK ("amount" >= 0 AND "amountUsd" >= 0),
  ADD CONSTRAINT "expense_rate_positive"
    CHECK ("lbpPerUsd" > 0);

ALTER TABLE "ExchangeRate"
  ADD CONSTRAINT "exchange_rate_positive"
    CHECK ("lbpPerUsd" > 0);

-- Global, monotonic, never reused. Assigned inside the payment transaction:
--   SELECT nextval('receipt_number_seq');
CREATE SEQUENCE "receipt_number_seq" AS INTEGER START WITH 1 INCREMENT BY 1;

