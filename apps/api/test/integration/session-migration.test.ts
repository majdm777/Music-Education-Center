import { readFileSync } from 'node:fs';
import { PrismaClient, Prisma } from '@prisma/client';
import { expect, it } from 'vitest';

it('preserves existing Session instants when migrating under a non-UTC time zone', async () => {
  const url = process.env.TEST_DATABASE_URL;
  if (!url || !new URL(url).pathname.endsWith('_test')) {
    throw new Error('A database ending in _test is required');
  }
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  const migration = (name: string) =>
    readFileSync(`prisma/migrations/${name}/migration.sql`, 'utf8')
      .replace(/--[^\n]*/g, '')
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean);
  const rollback = new Error('Rollback migration fixture');
  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.$executeRawUnsafe('CREATE SCHEMA session_migration_test');
        await tx.$executeRawUnsafe('SET LOCAL search_path TO session_migration_test, public');
        for (const sql of migration('20261104000000_init')) {
          await tx.$executeRawUnsafe(sql);
        }
        await tx.$executeRawUnsafe(`
        INSERT INTO "Student" (id, "fullName", "updatedAt") VALUES ('s', 'Student', now())
      `);
        await tx.$executeRawUnsafe(`
        INSERT INTO "Teacher" (id, "fullName", "updatedAt") VALUES ('t', 'Teacher', now())
      `);
        await tx.$executeRawUnsafe(`
        INSERT INTO "Subject" (id, name, type, "groupPrice", "oneOnOnePrice", "monthlySessions", "updatedAt")
        VALUES ('u', 'Music', 'MUSIC', 100, 100, 4, now())
      `);
        await tx.$executeRawUnsafe(`
        INSERT INTO "Enrollment" (id, type, "studentId", "teacherId", "subjectId", format,
          "startDate", "sessionsPerMonth", "monthlyPrice", "updatedAt")
        VALUES ('e', 'MUSIC', 's', 't', 'u', 'GROUP', '2026-01-01', 4, 100, now())
      `);
        // Explicit UTC wall-clock values reproduce Prisma's initial TIMESTAMP writes.
        const instants = [
          [
            '2026-03-29T00:30:00.123Z',
            '2026-03-29T01:30:00.456Z',
            '2026-03-28T23:10:00.789Z',
            '2026-03-29T02:15:00.012Z',
          ],
          [
            '2026-10-24T22:30:00.123Z',
            '2026-10-24T23:30:00.456Z',
            '2026-10-23T20:10:00.789Z',
            '2026-10-25T00:15:00.012Z',
          ],
        ];
        for (const [index, values] of instants.entries()) {
          await tx.$executeRaw(Prisma.sql`
          INSERT INTO "Session" (id, "enrollmentId", "teacherId", "startsAt", "endsAt", "createdAt", "updatedAt")
          VALUES (${String(index)}, 'e', 't', ${values[0]}::timestamp, ${values[1]}::timestamp,
            ${values[2]}::timestamp, ${values[3]}::timestamp)
        `);
        }
        const before = await tx.$queryRaw<Array<{ id: string; instants: Date[] }>>`
        SELECT id, ARRAY["startsAt" AT TIME ZONE 'UTC', "endsAt" AT TIME ZONE 'UTC',
          "createdAt" AT TIME ZONE 'UTC', "updatedAt" AT TIME ZONE 'UTC'] AS instants
        FROM "Session" ORDER BY id
      `;
        expect(before.map((row) => row.instants.map((value) => value.toISOString()))).toEqual(
          instants,
        );
        await tx.$executeRawUnsafe("SET LOCAL TIME ZONE 'Asia/Beirut'");
        for (const sql of migration('20261106000000_harden_constraints')) {
          await tx.$executeRawUnsafe(sql);
        }
        const after = await tx.$queryRaw<Array<{ id: string; instants: Date[] }>>`
        SELECT id, ARRAY["startsAt", "endsAt", "createdAt", "updatedAt"] AS instants
        FROM "Session" ORDER BY id
      `;
        expect(after).toEqual(before);
        throw rollback;
      },
      { timeout: 30_000 },
    );
  } catch (error) {
    if (error !== rollback) throw error;
  } finally {
    await prisma.$disconnect();
  }
});
