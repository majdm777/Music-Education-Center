import { Language, Prisma, PrismaClient, SubjectType } from '@prisma/client';
import { Algorithm, hash } from '@node-rs/argon2';

const prisma = new PrismaClient();

const GRADES: Array<{ name: string; sortOrder: number }> = [
  { name: 'KG1', sortOrder: 1 },
  { name: 'KG2', sortOrder: 2 },
  { name: 'KG3', sortOrder: 3 },
  ...Array.from({ length: 12 }, (_, index) => ({
    name: `Grade ${index + 1}`,
    sortOrder: index + 4,
  })),
];

const SUBJECTS: Array<{ name: string; type: SubjectType; monthlySessions: number | null }> = [
  { name: 'Piano', type: SubjectType.MUSIC, monthlySessions: 4 },
  { name: 'Guitar', type: SubjectType.MUSIC, monthlySessions: 4 },
  { name: 'Violin', type: SubjectType.MUSIC, monthlySessions: 4 },
  { name: 'Math', type: SubjectType.EDUCATION, monthlySessions: null },
  { name: 'Arabic', type: SubjectType.EDUCATION, monthlySessions: null },
  { name: 'English', type: SubjectType.EDUCATION, monthlySessions: null },
  { name: 'Physics', type: SubjectType.EDUCATION, monthlySessions: null },
  { name: 'Chemistry', type: SubjectType.EDUCATION, monthlySessions: null },
  { name: 'Agenda', type: SubjectType.EDUCATION, monthlySessions: null },
];

type SettingSeed = {
  key: string;
  value: Prisma.InputJsonValue | typeof Prisma.JsonNull;
};

const SETTINGS: SettingSeed[] = [
  { key: 'center.name', value: 'Center Name' },
  { key: 'center.logoUrl', value: Prisma.JsonNull },
  { key: 'center.primaryColor', value: '#0f766e' },
  { key: 'calendar.openDays', value: [1, 2, 3, 4, 5, 6] },
  { key: 'calendar.openTime', value: '09:00' },
  { key: 'calendar.closeTime', value: '21:00' },
  { key: 'defaults.language', value: 'ar' },
  { key: 'defaults.lessonMinutes', value: 60 },
  { key: 'backup.lastExportAt', value: Prisma.JsonNull },
];

async function seedGrades(): Promise<void> {
  for (const grade of GRADES) {
    await prisma.gradeLevel.upsert({
      where: { name: grade.name },
      update: {},
      create: {
        name: grade.name,
        rate: new Prisma.Decimal('1.000'),
        sortOrder: grade.sortOrder,
      },
    });
  }
  console.log(`Grades: ${GRADES.length} present`);
}

async function seedSubjects(): Promise<void> {
  for (const subject of SUBJECTS) {
    await prisma.subject.upsert({
      where: { name_type: { name: subject.name, type: subject.type } },
      update: {},
      create: {
        name: subject.name,
        type: subject.type,
        groupPrice: new Prisma.Decimal(0),
        oneOnOnePrice: new Prisma.Decimal(0),
        monthlySessions: subject.monthlySessions,
        isActive: false,
      },
    });
  }
  console.log(`Subjects: ${SUBJECTS.length} present (inactive until priced)`);
}

async function seedSettings(): Promise<void> {
  for (const setting of SETTINGS) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: { key: setting.key, value: setting.value },
    });
  }
  console.log(`Settings: ${SETTINGS.length} present`);
}

async function seedExchangeRate(): Promise<void> {
  const raw = process.env.SEED_LBP_PER_USD?.trim();

  if (!raw) {
    console.log('Exchange rate: skipped (SEED_LBP_PER_USD is not set)');
    return;
  }

  const rate = new Prisma.Decimal(raw);
  if (rate.lte(0)) {
    throw new Error('SEED_LBP_PER_USD must be positive');
  }

  const now = new Date();
  const effectiveDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  await prisma.exchangeRate.upsert({
    where: { effectiveDate },
    update: {},
    create: { lbpPerUsd: rate, effectiveDate },
  });
  console.log('Exchange rate: one row present for today');
}

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the admin user');
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user: already exists (password left unchanged)');
    return;
  }

  const passwordHash = await hash(password, { algorithm: Algorithm.Argon2id });
  await prisma.adminUser.create({
    data: {
      email,
      name: 'Center Admin',
      passwordHash,
      language: Language.AR,
    },
  });
  console.log('Admin user: created; 2FA is set up on first login');
}

async function main(): Promise<void> {
  await seedGrades();
  await seedSubjects();
  await seedSettings();
  await seedExchangeRate();
  await seedAdmin();
  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
