# Music & Education Center Management System

A private, single-admin web application for running a music and education center from one place: students, teachers, subjects and prices, enrollments, a lesson calendar, monthly charges, payments and refunds, balances, expenses, an exchange rate, a profit dashboard, PDF receipts, and Excel backups. Arabic (RTL) and English, laptop first with a usable phone experience.

The center is launching with no historical records, so this system is the single source of truth from day one.

## Status

- **Phase:** environment setup (4-8 Nov 2026)
- **Kickoff:** 9 Nov 2026
- **Feature complete:** 20 Nov 2026 (at risk, see the plan)
- **Commitment / acceptance:** 25 Nov 2026

## Documentation

| Document | Contents |
| --- | --- |
| [PRD](Docs/PRD_Center_Management_System.md) | Product requirements, business rules, acceptance criteria, KPIs |
| [Project Plan](Docs/Project_Plan_Center_Management_System.md) | Schedule, effort, ownership, milestones, risks, Definition of Done |
| [Project Spec](Docs/project_spec.md) | Architecture, security, API outline, environments, decisions log |
| [Schema](Docs/schema.md) | Database v6, invariants, constraints, SQL appendix |

`project_spec.md` is the technical source of truth. `schema.md` is the database source of truth. The PRD is the product source of truth.

## Stack

TypeScript · Next.js (App Router) · NestJS · Prisma 6 · PostgreSQL (Neon) · pnpm workspaces · Tailwind CSS · shadcn/ui · next-intl · TanStack Query/Table · FullCalendar · Recharts · ExcelJS · Jest · Vitest · Playwright

## Planned layout

```
apps/
  web/        Next.js application
  api/        NestJS REST API (owns Prisma)
packages/
  shared/     Zod DTOs and pure domain logic (pricing, balance, sessions, money, dates)
Docs/         Product, plan, architecture and schema documents
```

## Team

| Role | Name |
| --- | --- |
| Client / owner / sole user | Abdullah Maatouk |
| Product Manager | Mirna Derbieh |
| Team Lead | Majd Maatouk |
| Design and engineering | Majd Maatouk, Mirna Derbieh |
| DevOps | Ali Othman |

## Development

The workspace is being prepared in this phase. The target workflow, once the scaffold lands, is:

```bash
pnpm install
docker compose up -d          # local PostgreSQL
pnpm db:migrate
pnpm db:seed
pnpm dev                      # web + api
```

A fresh clone must reach a green health check with those commands. Setup, deployment, backup and restore instructions will be completed in the handover runbook.
