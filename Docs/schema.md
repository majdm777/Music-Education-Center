# Database Schema (Prisma v5)

Music & Education Center Management System. PostgreSQL, Prisma 6. 10 tables.

```prisma
// ============================================================
// Music & Education Center - Database Schema  (simple)
// PostgreSQL + Prisma 6
//
// 10 tables:
//   Student, Teacher, Subject, GradeLevel, Enrollment, Session, LedgerEntry,
//   Expense, ExchangeRate, AdminUser
//
// Pricing (all prices are monthly, in USD):
//   Music:      monthly price = Subject price for the chosen format
//   Education:  monthly price = Subject price for the chosen format x GradeLevel rate
//               e.g. Math group 20 x Grade 3 rate 1.2 = 24
//   The result is saved on the Enrollment, so later price changes
//   never affect existing students.
//
// Music sessions:
//   Each music enrollment has a number of sessions per month. Assigning a
//   student to a calendar slot creates a Session row. Remaining sessions
//   = sessionsPerMonth - Session rows in that calendar month. Counted, never
//   stored. Deleting a Session gives it back. No carry-over between months.
//   Education enrollments have no limit.
//
// Balance is NOT stored. Balance = sum of CHARGE entries - sum of PAYMENT
// entries in the LedgerEntry table (ignoring voided rows).
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
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  enrollments Enrollment[]

  @@index([fullName])
  @@index([parentPhone])
}

model Teacher {
  id        String   @id @default(cuid())
  fullName  String
  phone     String?
  payNotes  String?  // agreed pay terms, free text
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  enrollments Enrollment[]
  sessions    Session[]
  expenses    Expense[]
}

// ---------------- Price book ----------------

// Every instrument and every school subject / agenda service.
// "Piano" (MUSIC), "Math" (EDUCATION), "Agenda" (EDUCATION)
model Subject {
  id             String      @id @default(cuid())
  name           String
  type           SubjectType
  groupPrice     Decimal     @db.Decimal(12, 2) // USD per month
  oneOnOnePrice  Decimal     @db.Decimal(12, 2) // USD per month
  monthlySessions Int?       // MUSIC: default sessions per month (empty for education)
  isActive       Boolean     @default(true)

  enrollments Enrollment[]

  @@unique([name, type])
}

// School grades and their price rate: "Grade 3" = 1.2
model GradeLevel {
  id        String  @id @default(cuid())
  name      String  @unique
  rate      Decimal @db.Decimal(6, 3)
  sortOrder Int     @default(0)
  isActive  Boolean @default(true)

  enrollments Enrollment[]
}

// ---------------- Enrollment ----------------

// One student, one subject. Every enrollment is a one-month plan that renews.
// type MUSIC: gradeLevelId stays empty.
// type EDUCATION: gradeLevelId is required (enforced by the app).
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

  sessionsPerMonth Int?       // MUSIC only: copied from the subject, editable per student
  monthlyPrice  Decimal       @db.Decimal(12, 2) // USD, saved at enrollment, before discount
  discountType  DiscountType?
  discountValue Decimal?      @db.Decimal(12, 2)

  notes     String?
  createdAt DateTime @default(now())

  student    Student     @relation(fields: [studentId], references: [id])
  subject    Subject     @relation(fields: [subjectId], references: [id])
  gradeLevel GradeLevel? @relation(fields: [gradeLevelId], references: [id])
  teacher    Teacher     @relation(fields: [teacherId], references: [id])

  sessions Session[]
  ledger   LedgerEntry[]

  @@index([studentId])
  @@index([teacherId])
  @@index([subjectId, status])
}

// ---------------- Calendar ----------------

// One student in one calendar slot. A group class is several rows with the
// same time, one per student. Delete the row to give the session back.
model Session {
  id           String   @id @default(cuid())
  enrollmentId String
  teacherId    String
  startsAt     DateTime
  endsAt       DateTime
  note         String?
  createdAt    DateTime @default(now())

  enrollment Enrollment @relation(fields: [enrollmentId], references: [id])
  teacher    Teacher    @relation(fields: [teacherId], references: [id])

  @@index([enrollmentId, startsAt])
  @@index([teacherId, startsAt])
  @@index([startsAt])
}

// ---------------- Money ----------------

// Every charge and payment of an enrollment.
// To fix a mistake, set voidedAt. Never delete.
model LedgerEntry {
  id            String         @id @default(cuid())
  enrollmentId  String
  type          LedgerType
  date          DateTime       @db.Date
  periodMonth   DateTime?      @db.Date // CHARGE: first day of the month it covers
  note          String?

  // Value in USD (what the balance uses)
  amountUsd     Decimal        @db.Decimal(14, 2)

  // PAYMENT only: what was actually received
  amount        Decimal?       @db.Decimal(18, 2)
  currency      Currency?
  lbpPerUsd     Decimal?       @db.Decimal(18, 2) // rate used when recorded
  method        PaymentMethod?
  receiptNumber Int?           @unique // given by the app for payments

  voidedAt      DateTime?
  createdAt     DateTime       @default(now())

  enrollment Enrollment @relation(fields: [enrollmentId], references: [id])

  @@unique([enrollmentId, type, periodMonth]) // one charge per month
  @@index([enrollmentId])
  @@index([date])
}

model Expense {
  id          String          @id @default(cuid())
  category    ExpenseCategory
  description String
  date        DateTime        @db.Date
  teacherId   String?         // for TEACHER_PAY
  notes       String?

  amount      Decimal         @db.Decimal(18, 2)
  currency    Currency
  lbpPerUsd   Decimal         @db.Decimal(18, 2)
  amountUsd   Decimal         @db.Decimal(14, 2)

  voidedAt    DateTime?
  createdAt   DateTime        @default(now())

  teacher Teacher? @relation(fields: [teacherId], references: [id])

  @@index([date])
}

// The USD to LBP rate you update by hand
model ExchangeRate {
  id            String   @id @default(cuid())
  lbpPerUsd     Decimal  @db.Decimal(18, 2)
  effectiveDate DateTime @db.Date
  createdAt     DateTime @default(now())

  @@index([effectiveDate])
}

// ---------------- Login ----------------

model AdminUser {
  id                  String   @id @default(cuid())
  email               String   @unique
  name                String
  passwordHash        String
  language            Language @default(EN)
  totpSecretEncrypted String?
  twoFactorEnabled    Boolean  @default(false)
  recoveryCodeHashes  String[]
  createdAt           DateTime @default(now())
}
```