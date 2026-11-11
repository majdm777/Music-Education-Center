# Music & Education Center Management System

A private, single-admin web application for running a music and education center from one place: students, teachers, subjects and prices, enrollments, a lesson calendar, monthly charges, payments and refunds, balances, expenses, an exchange rate, a profit dashboard, PDF receipts, and Excel backups. Arabic (RTL) and English, laptop first with a usable phone experience.

The center is launching with no historical records, so this system is the single source of truth from day one.

## Status

Environment scaffold is in place (4-8 Nov 2026): pnpm workspace, Next.js web app, NestJS API, PostgreSQL 17, a hardened Prisma v6 schema with the SQL constraints Prisma cannot express, idempotent seed, health check, integration tests for every database invariant, and CI with drift and dependency checks.

- **Kickoff:** 9 Nov 2026
- **Feature complete:** 20 Nov 2026 (at risk, see the plan)
- **Commitment / acceptance:** 25 Nov 2026

## Stack

TypeScript · Next.js (App Router) · NestJS · Prisma 6 · PostgreSQL 17 (Docker locally; Neon planned for staging and production) · pnpm workspaces · next-intl, Tailwind CSS v4, CVA-based UI primitives, IBM Plex Sans Arabic, lucide-react · Vitest · Playwright (planned)

## Prerequisites

- Node.js 22 (`.nvmrc`)
- pnpm 9.15.9 through Corepack: `corepack enable && corepack prepare pnpm@9.15.9 --activate`
- Docker with Compose

## First run

```bash
cp .env.example .env
# Edit .env:
#   JWT_SECRET             openssl rand -base64 48
#   TOTP_ENCRYPTION_KEY    openssl rand -base64 32
#   ADMIN_EMAIL, ADMIN_PASSWORD

pnpm install
pnpm db:up          # starts PostgreSQL and waits for it to be healthy
pnpm db:deploy      # applies the committed migrations
pnpm db:verify      # asserts the indexes, CHECKs, foreign keys and sequence exist
pnpm db:drift       # asserts the database matches prisma/schema.prisma
pnpm db:seed        # idempotent: admin, grades, subjects, settings
pnpm dev            # web on :3000, API on :3001
```

Then:

- Web: <http://localhost:3000>
- UI kit style guide: <http://localhost:3000/style-guide> (development only; other environments return 404 unless `STYLE_GUIDE_ENABLED=true`)
- API health: <http://localhost:3001/api/health>
- The web page fetches `/api/health` through the Next.js rewrite, so a green card proves the browser-to-web-to-API path.

The seed creates the admin only if it is missing. Re-running it never resets the password or overwrites edited settings.

## Scripts

| Script                              | What it does                                                           |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                          | Builds `@mec/shared`, then runs web and API in watch mode              |
| `pnpm build`                        | Builds shared, generates Prisma Client, builds API and web             |
| `pnpm lint`                         | ESLint over the workspace                                              |
| `pnpm typecheck`                    | Generates Prisma Client, then type-checks every package                |
| `pnpm test`                         | Unit tests (shared and web UI kit; API tests run here once they exist) |
| `pnpm test:coverage`                | Unit tests with lcov output for SonarQube Cloud                        |
| `pnpm test:integration`             | Resets `mec_test` and runs the API database tests                      |
| `pnpm format` / `pnpm format:check` | Prettier                                                               |
| `pnpm db:up` / `pnpm db:down`       | Local PostgreSQL lifecycle                                             |
| `pnpm db:migrate`                   | Create and apply a migration while changing the schema                 |
| `pnpm db:deploy`                    | Apply committed migrations (first run, staging, prod, CI)              |
| `pnpm db:seed`                      | Seed local data                                                        |
| `pnpm db:reset`                     | Drop and recreate the local database, then seed                        |
| `pnpm db:verify`                    | Assert the indexes, CHECKs, foreign keys and sequence                  |
| `pnpm db:drift`                     | Compare the live database with `prisma/schema.prisma`                  |
| `pnpm db:studio`                    | Prisma Studio                                                          |

## Layout

```
apps/
  web/        Next.js application
  api/        NestJS REST API (owns Prisma)
    prisma/
      schema.prisma
      migrations/
      seed.ts
      verify.ts
packages/
  shared/     Zod environment schema and pure domain math
Docs/         Product, plan, architecture and schema documents
```

## Database

- Schema v6, 11 tables. `Docs/schema.md` is the source of truth; `apps/api/prisma/schema.prisma` mirrors it.
- Two migrations are committed: the initial tables and base checks, then the hardening migration (`citext`, `timestamptz`, composite subject FK, unique active enrollment and session slots, stricter financial checks).
- `pnpm db:verify` fails if a required index, CHECK, foreign key, date/timestamp type, or the receipt sequence disappears.
- `pnpm db:drift` fails when the live database schema drifts from `prisma/schema.prisma`. It compares the live schema, not migration history or checksums, so editing a migration that was already applied can still pass when the live schema matches. `db:verify` and the integration tests cover the constraints themselves.
- Balance, revenue, profit and remaining sessions are computed from rows, never stored.
- Money is `Decimal` end to end; rounding is HALF_UP to two decimals.
- Timestamps are `timestamptz` in UTC; calendar dates stay `date`; month windows and "today" are `Asia/Beirut`.

## Testing

- `pnpm test` runs the unit tests.
- `pnpm test:coverage` runs the same tests and writes lcov reports for SonarQube Cloud. `packages/shared` and the web UI primitives report coverage; `apps/api` and web route wiring are still analysed for bugs, smells, security, and duplication.
- Web component tests render to static markup, so they need no browser or jsdom. The dev-only `/style-guide` route exercises the same primitives visually in both LTR and RTL.
- `pnpm test:integration` creates or resets a separate `mec_test` database, applies the migrations, and checks every database invariant: CHECKs, partial unique indexes, the composite subject FK, `citext`, RESTRICT deletes, and financial consistency.
- The integration runner refuses any database whose name does not end in `_test`, so it cannot wipe development or production data.
- `TEST_DATABASE_URL` is optional locally; when omitted, it is derived from `DATABASE_URL` by appending `_test`.

## Conventions

- LF line endings, enforced by `.gitattributes` and `.editorconfig`.
- Prettier and ESLint are required checks.
- `.env` is never committed; `.env.example` documents every variable.
- Pull requests need green checks and one teammate's approval. Every review follows the [PR review process](Docs/PR_Review_Process.md) and posts the six required sections.

## Code review

Every pull request is reviewed in three layers:

| Layer           | Tool                                     | Role                                                                 |
| --------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| LLM review      | [CodeRabbit](https://coderabbit.ai)      | Correctness, security, maintainability, missing tests                |
| Static analysis | [SonarQube Cloud](https://sonarcloud.io) | Bugs, code smells, duplication, coverage on new code, quality gate   |
| Human review    | A teammate                               | Product correctness, database guarantees, trade-offs, final approval |

The required checks are `Format, lint, types, tests, build`, `Apply migration, seed, health check`, and `SonarCloud Code Analysis`. Reviews must use the six-section format defined in [`Docs/PR_Review_Process.md`](Docs/PR_Review_Process.md). Configuration lives in [`.coderabbit.yaml`](.coderabbit.yaml), [`sonar-project.properties`](sonar-project.properties), and [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Documentation

| Document                                                      | Contents                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| [PRD](Docs/PRD_Center_Management_System.md)                   | Product requirements, business rules, acceptance criteria, KPIs    |
| [Project Plan](Docs/Project_Plan_Center_Management_System.md) | Schedule, effort, ownership, milestones, risks, Definition of Done |
| [Project Spec](Docs/project_spec.md)                          | Architecture, security, API outline, environments, decisions log   |
| [Schema](Docs/schema.md)                                      | Database v6, invariants, constraints, SQL appendix                 |
| [PR Review Process](Docs/PR_Review_Process.md)                | Review layers, six-section format, severity, merge gates           |
| [Security Policy](SECURITY.md)                                | Private vulnerability reporting and secret handling                |

`project_spec.md` is the technical source of truth. `schema.md` is the database source of truth. The PRD is the product source of truth.
