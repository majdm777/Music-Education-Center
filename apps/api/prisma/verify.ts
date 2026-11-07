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
  'enrollment_music_sessions_only',
  'enrollment_price_nonnegative',
  'enrollment_sessions_positive',
  'exchange_rate_positive',
  'expense_amounts_nonnegative',
  'expense_currency_consistent',
  'expense_description_nonblank',
  'expense_rate_positive',
  'expense_teacher_matches_category',
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
const CHECK_DEFINITION_FRAGMENTS: Record<string, string[]> = {
  ledger_amount_usd_positive: ['amountusd > (0)::numeric'],
  ledger_receipt_only_for_payment: ["type = 'payment'", 'receiptnumber is null'],
  ledger_currency_consistent: [
    'round((amount / lbpperusd), 2)',
    "currency = 'usd'",
    "currency = 'lbp'",
  ],
  ledger_period_first_day: ['extract(day from periodmonth)'],
  enrollment_music_sessions_only: ["type = 'music'", 'sessionspermonth is null'],
  subject_one_on_one_at_least_group: ['oneononeprice >= groupprice'],
  expense_teacher_matches_category: ["category = 'teacher_pay'", 'teacherid is not null'],
  admin_2fa_requires_secret: ['not twofactorenabled', 'totpsecretencrypted is not null'],
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
    if (fragments) {
      problems.push(...assertFragments(`constraint ${name}`, definition, fragments));
    }
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
      `${DATE_COLUMNS.length} date columns, 1 sequence`,
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
