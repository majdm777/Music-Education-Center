# Music & Education Center Management System

A private, single-admin web application for running a music and education center from one place: students, teachers, subjects and prices, enrollments, a lesson calendar, monthly charges, payments and refunds, balances, expenses, an exchange rate, a profit dashboard, PDF receipts, and Excel backups. Arabic (RTL) and English, laptop first with a usable phone experience.

The center is launching with no historical records, so this system is the single source of truth from day one.

## Status

Environment scaffold is in place (4-8 Nov 2026): pnpm workspace, Next.js web app, NestJS API, PostgreSQL 17, Prisma v6 with the SQL constraints Prisma cannot express, idempotent seed, health check, and CI.

- **Kickoff:** 9 Nov 2026
- **Feature complete:** 20 Nov 2026 (at risk, see the plan)
- **Commitment / acceptance:** 25 Nov 2026

## Stack

TypeScript · Next.js (App Router) · NestJS · Prisma 6 · PostgreSQL (Docker locally, Neon for staging and production) · pnpm workspaces · next-intl, Tailwind CSS, shadcn/ui (design phase) · Vitest · Playwright (planned)

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
pnpm db:deploy      # applies the committed migration (includes the SQL appendix)
pnpm db:verify      # asserts the partial index, CHECKs and sequence exist
pnpm db:seed        # idempotent: admin, grades, subjects, settings
pnpm dev            # web on :3000, API on :3001
```

Then:

- Web: <http://localhost:3000>
- API health: <http://localhost:3001/api/health>
- The web page fetches `/api/health` through the Next.js rewrite, so a green card proves the browser-to-web-to-API path.

The seed creates the admin only if it is missing. Re-running it never resets the password or overwrites edited settings.

## Scripts

| Script                              | What it does                                               |
| ----------------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                          | Builds `@mec/shared`, then runs web and API in watch mode  |
| `pnpm build`                        | Builds shared, generates Prisma Client, builds API and web |
| `pnpm lint`                         | ESLint over the workspace                                  |
| `pnpm typecheck`                    | Generates Prisma Client, then type-checks every package    |
| `pnpm test`                         | Vitest                                                     |
| `pnpm format` / `pnpm format:check` | Prettier                                                   |
| `pnpm db:up` / `pnpm db:down`       | Local PostgreSQL lifecycle                                 |
| `pnpm db:migrate`                   | Create and apply a migration while changing the schema     |
| `pnpm db:deploy`                    | Apply committed migrations (first run, staging, prod, CI)  |
| `pnpm db:seed`                      | Seed local data                                            |
| `pnpm db:reset`                     | Drop and recreate the local database, then seed            |
| `pnpm db:verify`                    | Assert the SQL appendix is present                         |
| `pnpm db:studio`                    | Prisma Studio                                              |

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
- The initial migration is hand-finished: Prisma generates the tables, then the SQL appendix adds the partial unique index for live monthly charges, the `CHECK` constraints, and the receipt sequence.
- `pnpm db:verify` fails if any of those objects disappear.
- Balance, revenue, profit and remaining sessions are computed from rows, never stored.
- Money is `Decimal` end to end; rounding is HALF_UP to two decimals.
- Timestamps are UTC; month windows and "today" are `Asia/Beirut`.

## Conventions

- LF line endings, enforced by `.gitattributes` and `.editorconfig`.
- Prettier and ESLint are required checks.
- `.env` is never committed; `.env.example` documents every variable.
- Pull requests need green checks and one teammate's approval.

## Documentation

| Document                                                      | Contents                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| [PRD](Docs/PRD_Center_Management_System.md)                   | Product requirements, business rules, acceptance criteria, KPIs    |
| [Project Plan](Docs/Project_Plan_Center_Management_System.md) | Schedule, effort, ownership, milestones, risks, Definition of Done |
| [Project Spec](Docs/project_spec.md)                          | Architecture, security, API outline, environments, decisions log   |
| [Schema](Docs/schema.md)                                      | Database v6, invariants, constraints, SQL appendix                 |

`project_spec.md` is the technical source of truth. `schema.md` is the database source of truth. The PRD is the product source of truth.
