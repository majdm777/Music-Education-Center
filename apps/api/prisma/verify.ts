import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type IndexRequirement = {
  name: string;
  fragments: string[];
};

const REQUIRED_INDEXES: IndexRequirement[] = [
  {
    name: 'ledger_one_charge_per_month',
    fragments: [
      'unique index',
      '(enrollmentid, periodmonth)',
      "type = 'charge'",
      'voidedat is null',
    ],
  },
  {
    name: 'enrollment_one_active_per_subject_format',
    fragments: ['unique index', '(studentid, subjectid, format)', "status = 'active'"],
  },
  {
    name: 'Session_enrollmentId_startsAt_key',
    fragments: ['unique index', '(enrollmentid, startsat)'],
  },
  {
    name: 'Subject_id_type_key',
    fragments: ['unique index', '(id, type)'],
  },
];

const FORBIDDEN_INDEXES = ['Session_enrollmentId_startsAt_idx'];

const REQUIRED_CHECK_CONSTRAINTS = [
  'admin_2fa_requires_secret',
  'admin_email_nonblank',
  'admin_name_nonblank',
  'enrollment_dates_ordered',
  'enrollment_discount_nonnegative',
  'enrollment_discount_pair',
  'enrollment_discount_percent_range',
  'enrollment_education_requires_grade',
  'enrollment_ended_has_end_date',
  'enrollment_music_has_no_grade',
  'enrollment_music_requires_sessions',
  'enrollment_music_sessions_only',
  'enrollment_price_nonnegative',
  'enrollment_sessions_positive',
  'exchange_rate_positive',
  'expense_amounts_nonnegative',
  'expense_currency_consistent',
  'expense_description_nonblank',
  'expense_rate_positive',
  'grade_name_nonblank',
  'grade_rate_positive',
  'ledger_amount_positive',
  'ledger_amount_usd_positive',
  'ledger_cash_fields_only',
  'ledger_cash_fields_required',
  'ledger_charge_requires_period',
  'ledger_currency_consistent',
  'ledger_payment_requires_receipt',
  'ledger_period_first_day',
  'ledger_period_only_for_charge',
  'ledger_rate_positive',
  'ledger_receipt_only_for_payment',
  'ledger_receipt_positive',
  'session_times_ordered',
  'setting_key_nonblank',
  'student_full_name_nonblank',
  'subject_minutes_positive',
  'subject_music_sessions_only',
  'subject_name_nonblank',
  'subject_one_on_one_at_least_group',
  'subject_prices_nonnegative',
  'subject_sessions_positive',
  'teacher_full_name_nonblank',
];

// The name proves the constraint exists; these fragments prove it still says
// what the docs promise. Normalisation removes quoting and whitespace noise.
// Every required CHECK must have an entry, so a constraint can never be
// verified by name alone.
const CHECK_DEFINITION_FRAGMENTS: Record<string, string[]> = {
  admin_2fa_requires_secret: ['not twofactorenabled', 'totpsecretencrypted is not null'],
  admin_email_nonblank: ["btrim((email)::text, ' '::text) <> ''::text"],
  admin_name_nonblank: ["btrim(name, ' '::text) <> ''::text"],
  enrollment_dates_ordered: ['enddate is null', 'enddate >= startdate'],
  enrollment_discount_nonnegative: ['discountvalue is null', 'discountvalue >= (0)::numeric'],
  enrollment_discount_pair: ['(discounttype is null) = (discountvalue is null)'],
  enrollment_discount_percent_range: [
    "discounttype <> 'percent'",
    'discountvalue >= (0)::numeric',
    'discountvalue <= (100)::numeric',
  ],
  enrollment_education_requires_grade: ["type <> 'education'", 'gradelevelid is not null'],
  enrollment_ended_has_end_date: ["status <> 'ended'", 'enddate is not null'],
  enrollment_music_has_no_grade: ["type <> 'music'", 'gradelevelid is null'],
  enrollment_music_requires_sessions: ["type <> 'music'", 'sessionspermonth is not null'],
  enrollment_music_sessions_only: ["type = 'music'", 'sessionspermonth is null'],
  enrollment_price_nonnegative: ['monthlyprice >= (0)::numeric'],
  enrollment_sessions_positive: ['sessionspermonth is null', 'sessionspermonth > 0'],
  exchange_rate_positive: ['lbpperusd > (0)::numeric'],
  expense_amounts_nonnegative: ['amount >= (0)::numeric', 'amountusd >= (0)::numeric'],
  expense_currency_consistent: [
    'round((amount / lbpperusd), 2)',
    "currency = 'usd'",
    "currency = 'lbp'",
  ],
  expense_description_nonblank: ["btrim(description, ' '::text) <> ''::text"],
  expense_rate_positive: ['lbpperusd > (0)::numeric'],
  grade_name_nonblank: ["btrim(name, ' '::text) <> ''::text"],
  grade_rate_positive: ['rate > (0)::numeric'],
  ledger_amount_positive: ['amount is null', 'amount > (0)::numeric'],
  ledger_amount_usd_nonnegative: ['amountusd >= (0)::numeric'],
  ledger_amount_usd_positive: ["type = 'charge'", 'amountusd > (0)::numeric'],
  ledger_cash_fields_only: [
    "type = any (array['payment'",
    "'refund'",
    'amount is null',
    'currency is null',
    'lbpperusd is null',
    'method is null',
  ],
  ledger_cash_fields_required: [
    "type <> all (array['payment'",
    "'refund'",
    'amount is not null',
    'currency is not null',
    'lbpperusd is not null',
    'method is not null',
  ],
  ledger_charge_requires_period: ["type <> 'charge'", 'periodmonth is not null'],
  ledger_currency_consistent: [
    'round((amount / lbpperusd), 2)',
    "currency = 'usd'",
    "currency = 'lbp'",
  ],
  ledger_payment_requires_receipt: ["type <> 'payment'", 'receiptnumber is not null'],
  ledger_period_first_day: ['extract(day from periodmonth)'],
  ledger_period_only_for_charge: ["type = 'charge'", 'periodmonth is null'],
  ledger_rate_positive: ['lbpperusd is null', 'lbpperusd > (0)::numeric'],
  ledger_receipt_only_for_payment: ["type = 'payment'", 'receiptnumber is null'],
  ledger_receipt_positive: ['receiptnumber is null', 'receiptnumber > 0'],
  session_times_ordered: ['endsat > startsat'],
  setting_key_nonblank: ["btrim(key, ' '::text) <> ''::text"],
  student_full_name_nonblank: ["btrim(fullname, ' '::text) <> ''::text"],
  subject_minutes_positive: ['groupminutes > 0', 'oneononeminutes > 0'],
  subject_music_sessions_only: ["type = 'music'", 'monthlysessions is null'],
  subject_name_nonblank: ["btrim(name, ' '::text) <> ''::text"],
  subject_one_on_one_at_least_group: ['oneononeprice >= groupprice'],
  subject_prices_nonnegative: ['groupprice >= (0)::numeric', 'oneononeprice >= (0)::numeric'],
  subject_sessions_positive: ['monthlysessions is null', 'monthlysessions > 0'],
  teacher_full_name_nonblank: ["btrim(fullname, ' '::text) <> ''::text"],
};

const REQUIRED_FOREIGN_KEYS: Record<string, string[]> = {
  Enrollment_subjectId_type_fkey: [
    'foreign key (subjectid, type) references subject(id, type)',
    'on delete restrict',
  ],
  Expense_teacherId_fkey: ['foreign key (teacherid) references teacher(id)', 'on delete restrict'],
};

const DATE_COLUMNS = [
  ['Student', 'birthDate'],
  ['Enrollment', 'startDate'],
  ['Enrollment', 'endDate'],
  ['LedgerEntry', 'date'],
  ['LedgerEntry', 'periodMonth'],
  ['Expense', 'date'],
  ['ExchangeRate', 'effectiveDate'],
] as const;

// Instants must keep sub-day precision. Checking only for the wrong type would
// let a column change to `date` and silently drop every time of day.
const TIMESTAMP_COLUMNS = [
  ['AdminUser', 'lockedUntil'],
  ['AdminUser', 'lastLoginAt'],
  ['AdminUser', 'createdAt'],
  ['AdminUser', 'updatedAt'],
  ['Enrollment', 'createdAt'],
  ['Enrollment', 'updatedAt'],
  ['ExchangeRate', 'createdAt'],
  ['ExchangeRate', 'updatedAt'],
  ['Expense', 'voidedAt'],
  ['Expense', 'createdAt'],
  ['Expense', 'updatedAt'],
  ['GradeLevel', 'createdAt'],
  ['GradeLevel', 'updatedAt'],
  ['LedgerEntry', 'voidedAt'],
  ['LedgerEntry', 'createdAt'],
  ['LedgerEntry', 'updatedAt'],
  ['Session', 'startsAt'],
  ['Session', 'endsAt'],
  ['Session', 'createdAt'],
  ['Session', 'updatedAt'],
  ['Setting', 'updatedAt'],
  ['Student', 'createdAt'],
  ['Student', 'updatedAt'],
  ['Subject', 'createdAt'],
  ['Subject', 'updatedAt'],
  ['Teacher', 'createdAt'],
  ['Teacher', 'updatedAt'],
] as const;

function normalize(value: string): string {
  return value.toLowerCase().replace(/"/g, '').replace(/\s+/g, ' ').trim();
}

function assertFragments(label: string, definition: string, fragments: string[]): string[] {
  const normalized = normalize(definition);
  return fragments
    .filter((fragment) => !normalized.includes(normalize(fragment)))
    .map((fragment) => `${label} is missing "${fragment}"`);
}

async function main(): Promise<void> {
  const [indexes, checks, foreignKeys, columns, adminColumns, sequenceRows] = await Promise.all([
    prisma.$queryRaw<Array<{ indexname: string; indexdef: string }>>`
      SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public'
    `,
    prisma.$queryRaw<Array<{ conname: string; definition: string }>>`
      SELECT conname, pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE contype = 'c' AND connamespace = 'public'::regnamespace
    `,
    prisma.$queryRaw<Array<{ conname: string; definition: string }>>`
      SELECT conname, pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE contype = 'f' AND connamespace = 'public'::regnamespace
    `,
    prisma.$queryRaw<Array<{ table_name: string; column_name: string; data_type: string }>>`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `,
    prisma.$queryRaw<
      Array<{ column_name: string; udt_name: string; column_default: string | null }>
    >`
      SELECT column_name, udt_name, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'AdminUser'
        AND column_name IN ('email', 'recoveryCodeHashes')
    `,
    prisma.$queryRaw<Array<{ sequencename: string }>>`
      SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'
    `,
  ]);

  const problems: string[] = [];

  const indexMap = new Map(indexes.map((row) => [row.indexname, row.indexdef]));
  for (const requirement of REQUIRED_INDEXES) {
    const definition = indexMap.get(requirement.name);
    if (!definition) {
      problems.push(`missing index ${requirement.name}`);
      continue;
    }
    problems.push(
      ...assertFragments(`index ${requirement.name}`, definition, requirement.fragments),
    );
  }
  for (const name of FORBIDDEN_INDEXES) {
    if (indexMap.has(name)) {
      problems.push(`stale index ${name} still exists`);
    }
  }

  const checkMap = new Map(checks.map((row) => [row.conname, row.definition]));
  for (const name of REQUIRED_CHECK_CONSTRAINTS) {
    const definition = checkMap.get(name);
    if (!definition) {
      problems.push(`missing constraint ${name}`);
      continue;
    }
    const fragments = CHECK_DEFINITION_FRAGMENTS[name];
    if (!fragments) {
      problems.push(`constraint ${name} has no expected definition to verify`);
      continue;
    }
    problems.push(...assertFragments(`constraint ${name}`, definition, fragments));
  }

  const foreignKeyMap = new Map(foreignKeys.map((row) => [row.conname, row.definition]));
  for (const [name, fragments] of Object.entries(REQUIRED_FOREIGN_KEYS)) {
    const definition = foreignKeyMap.get(name);
    if (!definition) {
      problems.push(`missing foreign key ${name}`);
      continue;
    }
    problems.push(...assertFragments(`foreign key ${name}`, definition, fragments));
  }

  const columnMap = new Map(
    columns.map((row) => [`${row.table_name}.${row.column_name}`, row.data_type]),
  );
  for (const [table, column] of DATE_COLUMNS) {
    const dataType = columnMap.get(`${table}.${column}`);
    if (dataType !== 'date') {
      problems.push(`${table}.${column} must be date, found ${dataType ?? 'missing'}`);
    }
  }
  for (const [table, column] of TIMESTAMP_COLUMNS) {
    const dataType = columnMap.get(`${table}.${column}`);
    if (dataType !== 'timestamp with time zone') {
      problems.push(
        `${table}.${column} must be timestamp with time zone, found ${dataType ?? 'missing'}`,
      );
    }
  }
  const suspiciousTimestamps = columns.filter(
    (row) => row.data_type === 'timestamp without time zone',
  );
  for (const row of suspiciousTimestamps) {
    problems.push(`${row.table_name}.${row.column_name} must use timestamptz`);
  }

  const adminMap = new Map(adminColumns.map((row) => [row.column_name, row]));
  if (adminMap.get('email')?.udt_name !== 'citext') {
    problems.push('AdminUser.email must be citext');
  }
  const recoveryDefault = normalize(adminMap.get('recoveryCodeHashes')?.column_default ?? '');
  if (!recoveryDefault.includes('array[]::text[]')) {
    problems.push('AdminUser.recoveryCodeHashes must default to an empty array');
  }

  const sequenceNames = new Set(sequenceRows.map((row) => row.sequencename));
  if (!sequenceNames.has('receipt_number_seq')) {
    problems.push('missing sequence receipt_number_seq');
  }

  if (problems.length > 0) {
    throw new Error(`Database verification failed:\n- ${problems.join('\n- ')}`);
  }

  console.log(
    `Database verified: ${REQUIRED_INDEXES.length} indexes, ` +
      `${REQUIRED_CHECK_CONSTRAINTS.length} check constraints, ` +
      `${Object.keys(REQUIRED_FOREIGN_KEYS).length} foreign keys, ` +
      `${DATE_COLUMNS.length} date columns, ${TIMESTAMP_COLUMNS.length} timestamp columns, ` +
      `1 sequence`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
