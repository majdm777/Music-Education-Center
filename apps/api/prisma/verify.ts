import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REQUIRED_INDEXES = ['ledger_one_charge_per_month'];

const REQUIRED_CONSTRAINTS = [
  'ledger_amount_usd_nonnegative',
  'ledger_charge_requires_period',
  'ledger_period_only_for_charge',
  'ledger_payment_requires_receipt',
  'ledger_cash_fields',
  'ledger_rate_positive',
  'enrollment_price_nonnegative',
  'enrollment_discount_nonnegative',
  'enrollment_discount_percent_range',
  'enrollment_discount_pair',
  'enrollment_education_requires_grade',
  'enrollment_music_has_no_grade',
  'enrollment_dates_ordered',
  'enrollment_ended_has_end_date',
  'enrollment_sessions_positive',
  'subject_prices_nonnegative',
  'subject_sessions_positive',
  'subject_minutes_positive',
  'grade_rate_positive',
  'session_times_ordered',
  'expense_amounts_nonnegative',
  'expense_rate_positive',
  'exchange_rate_positive',
];

async function main(): Promise<void> {
  const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
    SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
  `;
  const constraints = await prisma.$queryRaw<Array<{ conname: string }>>`
    SELECT conname FROM pg_constraint
    WHERE contype = 'c' AND connamespace = 'public'::regnamespace
  `;
  const sequences = await prisma.$queryRaw<Array<{ sequencename: string }>>`
    SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'
  `;

  const indexNames = new Set(indexes.map((row) => row.indexname));
  const constraintNames = new Set(constraints.map((row) => row.conname));
  const sequenceNames = new Set(sequences.map((row) => row.sequencename));

  const missing = [
    ...REQUIRED_INDEXES.filter((name) => !indexNames.has(name)).map((name) => `index ${name}`),
    ...REQUIRED_CONSTRAINTS.filter((name) => !constraintNames.has(name)).map(
      (name) => `constraint ${name}`,
    ),
    ...(sequenceNames.has('receipt_number_seq') ? [] : ['sequence receipt_number_seq']),
  ];

  if (missing.length > 0) {
    throw new Error(`Database is missing: ${missing.join(', ')}`);
  }

  console.log(
    `Database verified: ${REQUIRED_INDEXES.length} index, ${REQUIRED_CONSTRAINTS.length} constraints, 1 sequence`,
  );
}

main()
  .catch((error) => {
    console.error('Database verification failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
