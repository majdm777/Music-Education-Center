import {
  ClassFormat,
  Currency,
  DiscountType,
  EnrollmentStatus,
  ExpenseCategory,
  LedgerType,
  PaymentMethod,
  Prisma,
  PrismaClient,
  SubjectType,
} from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const testUrl = process.env.TEST_DATABASE_URL;

if (!testUrl) {
  throw new Error('TEST_DATABASE_URL is required. Run pnpm test:integration from the repo root.');
}

// The beforeEach hook truncates every table. Refuse to build a client unless the
// database is clearly a test database, so a stray TEST_DATABASE_URL cannot erase
// development data.
let testDatabase: string;
try {
  testDatabase = new URL(testUrl).pathname.replace(/^\//, '');
} catch {
  throw new Error('TEST_DATABASE_URL must be a valid URL.');
}
if (!testDatabase.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must point at a database whose name ends with _test.');
}

const prisma = new PrismaClient({
  datasources: { db: { url: testUrl } },
});

const TEST_HASH = 'test-hash';

let sequence = 0;
let receiptSequence = 1000;

function unique(prefix: string): string {
  sequence += 1;
  return `${prefix} ${sequence}`;
}

function isoDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function isoInstant(value: string): Date {
  return new Date(value);
}

function nextReceipt(): number {
  receiptSequence += 1;
  return receiptSequence;
}

async function rejectsWithConstraint(promise: Promise<unknown>, name: string): Promise<void> {
  await expect(promise).rejects.toThrow(new RegExp(name));
}

async function rejectsAsUnique(promise: Promise<unknown>): Promise<void> {
  await expect(promise).rejects.toMatchObject({ code: 'P2002' });
}

async function createStudent(
  overrides: Partial<Prisma.StudentUncheckedCreateInput> = {},
): Promise<{ id: string }> {
  return prisma.student.create({
    data: { fullName: unique('Student'), ...overrides },
  });
}

async function createTeacher(
  overrides: Partial<Prisma.TeacherUncheckedCreateInput> = {},
): Promise<{ id: string }> {
  return prisma.teacher.create({
    data: { fullName: unique('Teacher'), ...overrides },
  });
}

async function createGrade(
  overrides: Partial<Prisma.GradeLevelUncheckedCreateInput> = {},
): Promise<{ id: string }> {
  return prisma.gradeLevel.create({
    data: { name: unique('Grade'), rate: '1.000', ...overrides },
  });
}

async function createSubject(
  overrides: Partial<Prisma.SubjectUncheckedCreateInput> = {},
): Promise<{ id: string }> {
  const type = overrides.type ?? SubjectType.MUSIC;
  return prisma.subject.create({
    data: {
      name: unique('Subject'),
      type,
      groupPrice: '100.00',
      oneOnOnePrice: '150.00',
      monthlySessions: type === SubjectType.MUSIC ? 4 : null,
      ...overrides,
    },
  });
}

type EnrollmentInput = Partial<Prisma.EnrollmentUncheckedCreateInput> & {
  studentId?: string;
  subjectId?: string;
  teacherId?: string;
  type?: SubjectType;
};

async function createEnrollment(overrides: EnrollmentInput = {}) {
  const studentId = overrides.studentId ?? (await createStudent()).id;
  const teacherId = overrides.teacherId ?? (await createTeacher()).id;
  const type = overrides.type ?? SubjectType.MUSIC;
  const subjectId =
    overrides.subjectId ??
    (await createSubject({ type, monthlySessions: type === 'MUSIC' ? 4 : null })).id;
  const gradeLevelId =
    overrides.gradeLevelId !== undefined
      ? overrides.gradeLevelId
      : type === SubjectType.EDUCATION
        ? (await createGrade()).id
        : null;

  return prisma.enrollment.create({
    data: {
      format: ClassFormat.GROUP,
      status: EnrollmentStatus.ACTIVE,
      startDate: isoDate('2026-11-01'),
      sessionsPerMonth: type === SubjectType.MUSIC ? 4 : null,
      monthlyPrice: '100.00',
      ...overrides,
      type,
      studentId,
      subjectId,
      teacherId,
      gradeLevelId,
    },
  });
}

async function createSession(
  enrollmentId: string,
  teacherId: string,
  overrides: Partial<Prisma.SessionUncheckedCreateInput> = {},
) {
  const startsAt = isoInstant('2026-11-01T10:00:00.000Z');
  return prisma.session.create({
    data: {
      enrollmentId,
      teacherId,
      startsAt,
      endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000),
      ...overrides,
    },
  });
}

async function createLedgerEntry(
  enrollmentId: string,
  overrides: Partial<Prisma.LedgerEntryUncheckedCreateInput> = {},
) {
  const type = overrides.type ?? LedgerType.CHARGE;
  const cashDefaults =
    type === LedgerType.CHARGE
      ? { periodMonth: isoDate('2026-11-01') }
      : {
          amount: '100.00',
          currency: Currency.USD,
          lbpPerUsd: '89000.00',
          method: PaymentMethod.CASH,
          ...(type === LedgerType.PAYMENT ? { receiptNumber: nextReceipt() } : {}),
        };

  return prisma.ledgerEntry.create({
    data: {
      enrollmentId,
      type,
      date: isoDate('2026-11-01'),
      amountUsd: '100.00',
      ...cashDefaults,
      ...overrides,
    },
  });
}

async function createExpense(overrides: Partial<Prisma.ExpenseUncheckedCreateInput> = {}) {
  return prisma.expense.create({
    data: {
      category: ExpenseCategory.RENT,
      description: unique('Expense'),
      date: isoDate('2026-11-01'),
      amount: '100.00',
      currency: Currency.USD,
      lbpPerUsd: '89000.00',
      amountUsd: '100.00',
      ...overrides,
    },
  });
}

async function createAdmin(
  overrides: Partial<Prisma.AdminUserUncheckedCreateInput> = {},
): Promise<{ id: string; email: string; recoveryCodeHashes: string[] }> {
  return prisma.adminUser.create({
    data: {
      email: `${unique('admin').replace(/\s+/g, '.')}@example.com`,
      name: unique('Admin'),
      passwordHash: TEST_HASH,
      ...overrides,
    },
  });
}

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.$executeRaw`
    TRUNCATE TABLE
      "AdminUser", "ExchangeRate", "Expense", "LedgerEntry", "Session",
      "Enrollment", "GradeLevel", "Subject", "Teacher", "Student", "Setting"
    RESTART IDENTITY CASCADE
  `;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('subject and grade invariants', () => {
  it('rejects a one-on-one price below the group price', async () => {
    await rejectsWithConstraint(
      createSubject({ groupPrice: '100.00', oneOnOnePrice: '99.99' }),
      'subject_one_on_one_at_least_group',
    );
  });

  it('rejects negative subject prices', async () => {
    await rejectsWithConstraint(
      createSubject({ groupPrice: '-1.00', oneOnOnePrice: '150.00' }),
      'subject_prices_nonnegative',
    );
  });

  it('rejects a zero monthly session allowance', async () => {
    await rejectsWithConstraint(createSubject({ monthlySessions: 0 }), 'subject_sessions_positive');
  });

  it('rejects a monthly session allowance on an education subject', async () => {
    await rejectsWithConstraint(
      createSubject({ type: SubjectType.EDUCATION, monthlySessions: 4 }),
      'subject_music_sessions_only',
    );
  });

  it('rejects zero lesson minutes', async () => {
    await rejectsWithConstraint(createSubject({ groupMinutes: 0 }), 'subject_minutes_positive');
  });

  it('rejects a blank subject name', async () => {
    await rejectsWithConstraint(createSubject({ name: '   ' }), 'subject_name_nonblank');
  });

  it('rejects a non-positive grade rate', async () => {
    await rejectsWithConstraint(createGrade({ rate: '0.000' }), 'grade_rate_positive');
  });

  it('rejects a blank grade name', async () => {
    await rejectsWithConstraint(createGrade({ name: '   ' }), 'grade_name_nonblank');
  });
});

describe('enrollment invariants', () => {
  it('rejects an enrollment whose type does not match the subject type', async () => {
    const music = await createSubject();
    const grade = await createGrade();
    await rejectsWithConstraint(
      createEnrollment({
        subjectId: music.id,
        type: SubjectType.EDUCATION,
        gradeLevelId: grade.id,
      }),
      'Enrollment_subjectId_type_fkey',
    );
  });

  it('rejects a negative monthly price', async () => {
    await rejectsWithConstraint(
      createEnrollment({ monthlyPrice: '-1.00' }),
      'enrollment_price_nonnegative',
    );
  });

  it('requires discount type and value to appear together', async () => {
    await rejectsWithConstraint(
      createEnrollment({ discountType: DiscountType.FIXED, discountValue: null }),
      'enrollment_discount_pair',
    );
  });

  it('rejects a negative discount', async () => {
    await rejectsWithConstraint(
      createEnrollment({ discountType: DiscountType.FIXED, discountValue: '-1.00' }),
      'enrollment_discount_nonnegative',
    );
  });

  it('rejects a percentage discount above 100', async () => {
    await rejectsWithConstraint(
      createEnrollment({ discountType: DiscountType.PERCENT, discountValue: '100.01' }),
      'enrollment_discount_percent_range',
    );
  });

  it('requires a grade for education enrollments', async () => {
    const subject = await createSubject({
      type: SubjectType.EDUCATION,
      monthlySessions: null,
    });
    await rejectsWithConstraint(
      createEnrollment({
        subjectId: subject.id,
        type: SubjectType.EDUCATION,
        gradeLevelId: null,
      }),
      'enrollment_education_requires_grade',
    );
  });

  it('rejects a grade on a music enrollment', async () => {
    const grade = await createGrade();
    await rejectsWithConstraint(
      createEnrollment({ gradeLevelId: grade.id }),
      'enrollment_music_has_no_grade',
    );
  });

  it('rejects a session allowance on an education enrollment', async () => {
    const subject = await createSubject({
      type: SubjectType.EDUCATION,
      monthlySessions: null,
    });
    const grade = await createGrade();
    await rejectsWithConstraint(
      createEnrollment({
        subjectId: subject.id,
        type: SubjectType.EDUCATION,
        gradeLevelId: grade.id,
        sessionsPerMonth: 4,
      }),
      'enrollment_music_sessions_only',
    );
  });

  it('rejects an end date before the start date', async () => {
    await rejectsWithConstraint(
      createEnrollment({
        startDate: isoDate('2026-11-15'),
        endDate: isoDate('2026-11-14'),
      }),
      'enrollment_dates_ordered',
    );
  });

  it('requires an end date when the enrollment has ended', async () => {
    await rejectsWithConstraint(
      createEnrollment({ status: EnrollmentStatus.ENDED, endDate: null }),
      'enrollment_ended_has_end_date',
    );
  });

  it('rejects a zero session allowance', async () => {
    await rejectsWithConstraint(
      createEnrollment({ sessionsPerMonth: 0 }),
      'enrollment_sessions_positive',
    );
  });

  it('requires a session allowance on a music enrollment', async () => {
    await rejectsWithConstraint(
      createEnrollment({ sessionsPerMonth: null }),
      'enrollment_music_requires_sessions',
    );
  });

  it('allows only one active enrollment per student, subject, and format', async () => {
    const student = await createStudent();
    const subject = await createSubject();
    const teacher = await createTeacher();

    await createEnrollment({
      studentId: student.id,
      subjectId: subject.id,
      teacherId: teacher.id,
    });

    await rejectsAsUnique(
      createEnrollment({
        studentId: student.id,
        subjectId: subject.id,
        teacherId: teacher.id,
      }),
    );
  });

  it('allows a paused enrollment beside an active one', async () => {
    const student = await createStudent();
    const subject = await createSubject();
    const teacher = await createTeacher();

    const active = await createEnrollment({
      studentId: student.id,
      subjectId: subject.id,
      teacherId: teacher.id,
    });
    const paused = await createEnrollment({
      studentId: student.id,
      subjectId: subject.id,
      teacherId: teacher.id,
      status: EnrollmentStatus.PAUSED,
    });

    expect(active.status).toBe(EnrollmentStatus.ACTIVE);
    expect(paused.status).toBe(EnrollmentStatus.PAUSED);
    expect(paused.id).not.toBe(active.id);
  });
});

describe('session invariants', () => {
  it('rejects two sessions for the same enrollment at the same instant', async () => {
    const enrollment = await createEnrollment();
    const startsAt = isoInstant('2026-11-02T10:00:00.000Z');

    await createSession(enrollment.id, enrollment.teacherId, {
      startsAt,
      endsAt: isoInstant('2026-11-02T11:00:00.000Z'),
    });

    await rejectsAsUnique(
      createSession(enrollment.id, enrollment.teacherId, {
        startsAt,
        endsAt: isoInstant('2026-11-02T11:00:00.000Z'),
      }),
    );
  });

  it('allows different students in the same group slot', async () => {
    const subject = await createSubject();
    const teacher = await createTeacher();
    const first = await createEnrollment({ subjectId: subject.id, teacherId: teacher.id });
    const second = await createEnrollment({ subjectId: subject.id, teacherId: teacher.id });
    const startsAt = isoInstant('2026-11-02T10:00:00.000Z');
    const endsAt = isoInstant('2026-11-02T11:00:00.000Z');

    const firstSession = await createSession(first.id, teacher.id, { startsAt, endsAt });
    const secondSession = await createSession(second.id, teacher.id, { startsAt, endsAt });

    expect(firstSession.startsAt).toEqual(secondSession.startsAt);
    expect(firstSession.id).not.toBe(secondSession.id);
  });

  it('rejects a session that ends before it starts', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createSession(enrollment.id, enrollment.teacherId, {
        startsAt: isoInstant('2026-11-02T11:00:00.000Z'),
        endsAt: isoInstant('2026-11-02T11:00:00.000Z'),
      }),
      'session_times_ordered',
    );
  });

  it('prevents deleting a teacher who still has sessions', async () => {
    const enrollment = await createEnrollment();
    const sessionTeacher = await createTeacher();
    await createSession(enrollment.id, sessionTeacher.id);

    await expect(prisma.teacher.delete({ where: { id: sessionTeacher.id } })).rejects.toThrow();
  });
});

describe('ledger invariants', () => {
  it('rejects a negative USD amount', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, { amountUsd: '-1.00' }),
      'ledger_amount_usd_nonnegative',
    );
  });

  it('rejects a non-positive cash amount', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, { type: LedgerType.PAYMENT, amount: '0.00' }),
      'ledger_amount_positive',
    );
  });

  it('requires a period on a charge', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, { periodMonth: null }),
      'ledger_charge_requires_period',
    );
  });

  it('rejects a period on a payment', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, {
        type: LedgerType.PAYMENT,
        periodMonth: isoDate('2026-11-01'),
      }),
      'ledger_period_only_for_charge',
    );
  });

  it('requires a charge period to be the first day of the month', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, { periodMonth: isoDate('2026-11-02') }),
      'ledger_period_first_day',
    );
  });

  it('requires a receipt on a payment', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, { type: LedgerType.PAYMENT, receiptNumber: null }),
      'ledger_payment_requires_receipt',
    );
  });

  it('rejects a receipt on a refund', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, { type: LedgerType.REFUND, receiptNumber: nextReceipt() }),
      'ledger_receipt_only_for_payment',
    );
  });

  it('rejects a non-positive receipt number', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, { type: LedgerType.PAYMENT, receiptNumber: 0 }),
      'ledger_receipt_positive',
    );
  });

  it('requires cash fields on a payment', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, { type: LedgerType.PAYMENT, method: null }),
      'ledger_cash_fields_required',
    );
  });

  it('rejects cash fields on a charge', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, { method: PaymentMethod.CASH }),
      'ledger_cash_fields_only',
    );
  });

  it('rejects a USD payment whose amount does not equal its USD value', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, {
        type: LedgerType.PAYMENT,
        currency: Currency.USD,
        amount: '100.01',
        amountUsd: '100.00',
      }),
      'ledger_currency_consistent',
    );
  });

  it('rejects an LBP payment whose USD value does not match the rate', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, {
        type: LedgerType.PAYMENT,
        currency: Currency.LBP,
        amount: '89000.00',
        lbpPerUsd: '89000.00',
        amountUsd: '2.00',
      }),
      'ledger_currency_consistent',
    );
  });

  it('accepts a consistent LBP payment', async () => {
    const enrollment = await createEnrollment();
    const payment = await createLedgerEntry(enrollment.id, {
      type: LedgerType.PAYMENT,
      currency: Currency.LBP,
      amount: '89000.00',
      lbpPerUsd: '89000.00',
      amountUsd: '1.00',
    });

    expect(payment.type).toBe(LedgerType.PAYMENT);
    expect(payment.currency).toBe(Currency.LBP);
  });

  it('rejects a non-positive exchange rate on a payment', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, { type: LedgerType.PAYMENT, lbpPerUsd: '0.00' }),
      'ledger_rate_positive',
    );
  });

  it('allows only one live charge per enrollment and month', async () => {
    const enrollment = await createEnrollment();
    await createLedgerEntry(enrollment.id);
    await rejectsAsUnique(createLedgerEntry(enrollment.id));
  });

  it('allows one live charge per month in different months', async () => {
    const enrollment = await createEnrollment();
    const november = await createLedgerEntry(enrollment.id);
    const december = await createLedgerEntry(enrollment.id, {
      date: isoDate('2026-12-01'),
      periodMonth: isoDate('2026-12-01'),
    });

    expect(november.periodMonth).toEqual(isoDate('2026-11-01'));
    expect(december.periodMonth).toEqual(isoDate('2026-12-01'));
    expect(november.id).not.toBe(december.id);
  });

  it('accepts a zero charge when a discount covers the whole price', async () => {
    const enrollment = await createEnrollment();
    const charge = await createLedgerEntry(enrollment.id, { amountUsd: '0.00' });

    expect(charge.amountUsd.isZero()).toBe(true);
  });

  it('rejects a payment whose USD value rounds to zero', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, {
        type: LedgerType.PAYMENT,
        currency: Currency.LBP,
        amount: '1.00',
        lbpPerUsd: '89000.00',
        amountUsd: '0.00',
      }),
      'ledger_amount_usd_positive',
    );
  });

  it('rejects a refund whose USD value rounds to zero', async () => {
    const enrollment = await createEnrollment();
    await rejectsWithConstraint(
      createLedgerEntry(enrollment.id, {
        type: LedgerType.REFUND,
        currency: Currency.LBP,
        amount: '1.00',
        lbpPerUsd: '89000.00',
        amountUsd: '0.00',
      }),
      'ledger_amount_usd_positive',
    );
  });

  it('allows a replacement charge after the first one is voided', async () => {
    const enrollment = await createEnrollment();
    const first = await createLedgerEntry(enrollment.id);

    await prisma.ledgerEntry.update({
      where: { id: first.id },
      data: { voidedAt: isoInstant('2026-11-02T09:00:00.000Z') },
    });
    const replacement = await createLedgerEntry(enrollment.id);

    expect(replacement.voidedAt).toBeNull();
    expect(replacement.id).not.toBe(first.id);
  });
});

describe('expense invariants', () => {
  it('rejects negative expense amounts', async () => {
    await rejectsWithConstraint(
      createExpense({ amount: '-1.00', amountUsd: '-1.00' }),
      'expense_amounts_nonnegative',
    );
  });

  it('rejects a non-positive expense exchange rate', async () => {
    await rejectsWithConstraint(createExpense({ lbpPerUsd: '0.00' }), 'expense_rate_positive');
  });

  it('rejects a USD expense whose amount does not equal its USD value', async () => {
    await rejectsWithConstraint(
      createExpense({ currency: Currency.USD, amount: '99.00', amountUsd: '100.00' }),
      'expense_currency_consistent',
    );
  });

  it('rejects an LBP expense whose USD value does not match the rate', async () => {
    await rejectsWithConstraint(
      createExpense({
        currency: Currency.LBP,
        amount: '89000.00',
        lbpPerUsd: '89000.00',
        amountUsd: '2.00',
      }),
      'expense_currency_consistent',
    );
  });

  it('allows a teacher link on any category and leaves it optional', async () => {
    const teacher = await createTeacher();
    const rent = await createExpense({ category: ExpenseCategory.RENT, teacherId: teacher.id });
    const teacherPay = await createExpense({
      category: ExpenseCategory.TEACHER_PAY,
      teacherId: null,
    });

    expect(rent.teacherId).toBe(teacher.id);
    expect(teacherPay.teacherId).toBeNull();
  });

  it('rejects a blank expense description', async () => {
    await rejectsWithConstraint(
      createExpense({ description: '   ' }),
      'expense_description_nonblank',
    );
  });

  it('prevents deleting a teacher referenced by an expense', async () => {
    const teacher = await createTeacher();
    await createExpense({ category: ExpenseCategory.TEACHER_PAY, teacherId: teacher.id });

    await expect(prisma.teacher.delete({ where: { id: teacher.id } })).rejects.toThrow();
  });
});

describe('identity and configuration invariants', () => {
  it('rejects a blank student name', async () => {
    await rejectsWithConstraint(createStudent({ fullName: '   ' }), 'student_full_name_nonblank');
  });

  it('rejects a blank teacher name', async () => {
    await rejectsWithConstraint(createTeacher({ fullName: '   ' }), 'teacher_full_name_nonblank');
  });

  it('rejects a blank setting key', async () => {
    await rejectsWithConstraint(
      prisma.setting.create({ data: { key: '   ', value: {} } }),
      'setting_key_nonblank',
    );
  });

  it('rejects a blank admin email', async () => {
    await rejectsWithConstraint(createAdmin({ email: '   ' }), 'admin_email_nonblank');
  });

  it('rejects a blank admin name', async () => {
    await rejectsWithConstraint(createAdmin({ name: '   ' }), 'admin_name_nonblank');
  });

  it('requires a TOTP secret when two-factor authentication is enabled', async () => {
    await rejectsWithConstraint(
      createAdmin({ twoFactorEnabled: true, totpSecretEncrypted: null }),
      'admin_2fa_requires_secret',
    );
  });

  it('treats admin emails as case-insensitive', async () => {
    await createAdmin({ email: 'Case.Sensitive@example.com' });
    await rejectsAsUnique(createAdmin({ email: 'case.sensitive@example.com' }));
  });

  it('defaults recovery codes to an empty array', async () => {
    const admin = await createAdmin();
    expect(admin.recoveryCodeHashes).toEqual([]);
  });

  it('rejects a non-positive exchange rate', async () => {
    await rejectsWithConstraint(
      prisma.exchangeRate.create({
        data: { lbpPerUsd: '0.00', effectiveDate: isoDate('2026-11-01') },
      }),
      'exchange_rate_positive',
    );
  });

  it('allows only one exchange rate per effective date', async () => {
    await prisma.exchangeRate.create({
      data: { lbpPerUsd: '89000.00', effectiveDate: isoDate('2026-11-01') },
    });
    await rejectsAsUnique(
      prisma.exchangeRate.create({
        data: { lbpPerUsd: '90000.00', effectiveDate: isoDate('2026-11-01') },
      }),
    );
  });
});

describe('whitespace-only values are rejected', () => {
  // btrim strips spaces by default, so these values prove the checks also strip
  // tabs, newlines, and carriage returns.
  const whitespace = '\t\n\r';

  it('rejects a whitespace-only student name', async () => {
    await rejectsWithConstraint(
      createStudent({ fullName: whitespace }),
      'student_full_name_nonblank',
    );
  });

  it('rejects a whitespace-only teacher name', async () => {
    await rejectsWithConstraint(
      createTeacher({ fullName: whitespace }),
      'teacher_full_name_nonblank',
    );
  });

  it('rejects a whitespace-only subject name', async () => {
    await rejectsWithConstraint(createSubject({ name: whitespace }), 'subject_name_nonblank');
  });

  it('rejects a whitespace-only grade name', async () => {
    await rejectsWithConstraint(createGrade({ name: whitespace }), 'grade_name_nonblank');
  });

  it('rejects a whitespace-only setting key', async () => {
    await rejectsWithConstraint(
      prisma.setting.create({ data: { key: whitespace, value: {} } }),
      'setting_key_nonblank',
    );
  });

  it('rejects a whitespace-only expense description', async () => {
    await rejectsWithConstraint(
      createExpense({ description: whitespace }),
      'expense_description_nonblank',
    );
  });

  it('rejects a whitespace-only admin email', async () => {
    await rejectsWithConstraint(createAdmin({ email: whitespace }), 'admin_email_nonblank');
  });

  it('rejects a whitespace-only admin name', async () => {
    await rejectsWithConstraint(createAdmin({ name: whitespace }), 'admin_name_nonblank');
  });
});

// Match String.trim(): ECMAScript WhiteSpace and LineTerminator characters.
const blankCharacters = [
  ' ',
  '\t',
  '\n',
  '\r',
  '\x0c',
  '\x0b',
  '\u00a0',
  '\u1680',
  '\u2000',
  '\u2001',
  '\u2002',
  '\u2003',
  '\u2004',
  '\u2005',
  '\u2006',
  '\u2007',
  '\u2008',
  '\u2009',
  '\u200a',
  '\u2028',
  '\u2029',
  '\u202f',
  '\u205f',
  '\u3000',
  '\ufeff',
];
describe('nonblank text whitespace', () => {
  it.each(blankCharacters)('rejects whitespace U+%s in every nonblank field', async (blank) => {
    await rejectsWithConstraint(createStudent({ fullName: blank }), 'student_full_name_nonblank');
    await rejectsWithConstraint(createTeacher({ fullName: blank }), 'teacher_full_name_nonblank');
    await rejectsWithConstraint(createSubject({ name: blank }), 'subject_name_nonblank');
    await rejectsWithConstraint(createGrade({ name: blank }), 'grade_name_nonblank');
    await rejectsWithConstraint(
      createExpense({ description: blank }),
      'expense_description_nonblank',
    );
    await rejectsWithConstraint(createAdmin({ name: blank }), 'admin_name_nonblank');
    await rejectsWithConstraint(createAdmin({ email: blank }), 'admin_email_nonblank');
    await rejectsWithConstraint(
      prisma.setting.create({ data: { key: blank, value: {} } }),
      'setting_key_nonblank',
    );
  });
});
