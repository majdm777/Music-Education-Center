# Project Plan

# Music & Education Center Management System

This document details a high-level and detailed overview of what the team will tackle and prioritize during the project. It is for the team only.

**Client:** Abdullah Maatouk
**Team:** Majd Maatouk (design and engineering), Mirna Derbieh (design and engineering), Ali Othman (DevOps)
**Stack:** React, Prisma, PostgreSQL
**Target:** 9 Nov to 20 Nov 2026 (10 working days). **Buffer:** 23 Nov to 25 Nov 2026.
**Sign-off:** client and team lead (to be named)

> **Capacity check.** Majd and Mirna together have about 140 productive hours in 10 days (7 hours per day each). Expected development effort is about **142 hours** (range 98 to 213), so the team has no slack and the 20 Nov target holds only if estimates land in the low-to-middle range. Treat **25 Nov** as the realistic commitment, and flag any slip by day 5 (13 Nov).
Ali has about 70 hours and DevOps work is estimated at **40 hours** (range 28 to 56), leaving about 30 hours for QA support, test data, and monitoring.
> 

---

## High Level Plan

| Requirement Item | # | Description | Start | End | Effort (h) | Low (h) | High (h) | Depends on | Team Member | Status | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Project setup | 1 | Repo, app skeleton, Prisma schema v5, migrations, seed, design tokens | 2026-11-09 | 2026-11-10 | 10 | 7 | 15 | N/A | Majd, Mirna | Planned | Running app with the base schema |
| DevOps and deployment | 2 | Hosting, database, environments, CI/CD, secrets, backups, monitoring, runbook | 2026-11-09 | 2026-11-20 | 40 | 28 | 56 | N/A | Ali | Planned | Reliable environments and deployments |
| Login and 2FA | 3 | Admin login, hashing, TOTP 2FA, recovery codes, session expiry | 2026-11-10 | 2026-11-11 | 8 | 5 | 12 | 1 | Majd | Planned | Secured admin access |
| Language, RTL, layout shell | 4 | i18n (Arabic/English), RTL mirroring, responsive shell | 2026-11-10 | 2026-11-11 | 14 | 10 | 20 | 1 | Mirna | Planned | Bilingual, responsive shell |
| Master data | 5 | Students, teachers, subjects with prices, grade levels with rates | 2026-11-11 | 2026-11-13 | 14 | 10 | 20 | 1, 3, 4 | Majd, Mirna | Planned | Core records and price book |
| Enrollments | 6 | Music/Education enrollment, price calculation, discount, status | 2026-11-12 | 2026-11-16 | 12 | 8 | 18 | 5 | Majd | Planned | Working enrollment flow |
| Calendar and sessions | 7 | Calendar, assign student to slot, music session count, warnings | 2026-11-13 | 2026-11-17 | 20 | 14 | 30 | 5, 6 | Mirna, Majd | Planned | Calendar with session tracking |
| Ledger, payments, balance | 8 | Monthly charges, payments, currency, void, balance | 2026-11-16 | 2026-11-18 | 18 | 13 | 26 | 6, 9 | Majd, Mirna | Planned | Accurate balances |
| Expenses and exchange rates | 9 | Exchange rate screen, expense entry | 2026-11-13 | 2026-11-18 | 8 | 5 | 12 | 1, 4 | Majd, Mirna | Planned | Expenses and rate management |
| Dashboard and reminders | 10 | Revenue, expenses, profit, outstanding, breakdowns, filters, reminders | 2026-11-18 | 2026-11-19 | 14 | 10 | 22 | 7, 8, 9 | Majd, Mirna | Planned | Dashboard with all metrics |
| Receipts and export | 11 | PDF receipts (AR/EN), Excel export, backup reminder | 2026-11-19 | 2026-11-20 | 12 | 8 | 18 | 8 | Mirna, Majd | Planned | PDF and Excel outputs |
| QA, security, handover | 12 | Testing, bug fixes, RTL and mobile walkthroughs, data-safety test, docs | 2026-11-19 | 2026-11-20 | 12 | 8 | 20 | 1 to 11 | Majd, Mirna, Ali | Planned | Release candidate and handover docs |
| Buffer | 13 | Slip recovery, client feedback fixes, final acceptance | 2026-11-23 | 2026-11-25 | n/a | n/a | n/a | 12 | All | Planned | Accepted release |

---

## Detailed Plan

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Status | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1.1 | Create repo, React app, API structure, linting, environment config | 2026-11-09 | 2026-11-09 | 2 | N/A | Majd | Planned | Running skeleton |
| 1 | 1.2 | Prisma schema v5: migrate, seed admin, default grades and sample subjects | 2026-11-09 | 2026-11-10 | 3 | 1.1, 2.1 | Majd | Planned | Migrated, seeded database |
| 1 | 1.3 | Design tokens (placeholder brand), base components, form patterns | 2026-11-09 | 2026-11-10 | 5 | 1.1 | Mirna | Planned | Base UI kit |
| 2 | 2.1 | Provision hosted PostgreSQL and app hosting | 2026-11-09 | 2026-11-09 | 4 | N/A | Ali | Planned | Live database and hosting |
| 2 | 2.2 | Dev, staging, production environments and secrets | 2026-11-09 | 2026-11-10 | 4 | 2.1 | Ali | Planned | Three environments |
| 2 | 2.3 | CI pipeline: lint, tests, build on every push | 2026-11-10 | 2026-11-11 | 6 | 1.1 | Ali | Planned | Automated checks |
| 2 | 2.4 | CD: automatic deploy to staging, controlled deploy to production | 2026-11-11 | 2026-11-12 | 6 | 2.3 | Ali | Planned | Repeatable deployments |
| 2 | 2.5 | Automated database backups and a tested restore | 2026-11-12 | 2026-11-13 | 6 | 2.1 | Ali | Planned | Verified backups |
| 2 | 2.6 | HTTPS, security headers, rate limiting on login | 2026-11-16 | 2026-11-16 | 4 | 2.4 | Ali | Planned | Hardened deployment |
| 2 | 2.7 | Monitoring, logs, alerts, and free-tier usage watch | 2026-11-17 | 2026-11-17 | 4 | 2.4 | Ali | Planned | Monitoring in place |
| 2 | 2.8 | Production release and deployment runbook | 2026-11-19 | 2026-11-20 | 6 | 12.1 | Ali | Planned | Live system and runbook |
| 3 | 3.1 | Login page, password hashing, sessions, route protection | 2026-11-10 | 2026-11-10 | 4 | 1.2 | Majd | Planned | Working login |
| 3 | 3.2 | TOTP two-factor setup and verification, recovery codes | 2026-11-11 | 2026-11-11 | 4 | 3.1 | Majd | Planned | 2FA enabled |
| 4 | 4.1 | i18n setup, Arabic and English dictionaries, language switcher | 2026-11-10 | 2026-11-10 | 5 | 1.3 | Mirna | Planned | Language switching |
| 4 | 4.2 | RTL mirroring with logical CSS properties, Arabic font, number and date formats | 2026-11-10 | 2026-11-11 | 5 | 4.1 | Mirna | Planned | Correct RTL layout |
| 4 | 4.3 | Responsive shell: sidebar on laptop, drawer on phone | 2026-11-11 | 2026-11-11 | 4 | 4.1 | Mirna | Planned | Responsive navigation |
| 5 | 5.1 | Students: list, search, create, edit, archive, profile page | 2026-11-11 | 2026-11-12 | 5 | 3.1, 4.3 | Majd | Planned | Students module |
| 5 | 5.2 | Teachers: list, create, edit, pay notes, active status | 2026-11-12 | 2026-11-12 | 3 | 4.3 | Mirna | Planned | Teachers module |
| 5 | 5.3 | Subjects: instruments and school subjects/agenda, type, group and one-on-one prices, monthly sessions | 2026-11-12 | 2026-11-13 | 3 | 4.3 | Mirna | Planned | Subject price book |
| 5 | 5.4 | Grade levels with rates | 2026-11-13 | 2026-11-13 | 3 | 4.3 | Mirna | Planned | Grade rates |
| 6 | 6.1 | Enrollment form: Music or Education switch, subject, grade, teacher, format | 2026-11-12 | 2026-11-13 | 5 | 5.1, 5.3, 5.4 | Majd | Planned | Enrollments |
| 6 | 6.2 | Price calculation (subject price × grade rate), discount, unit tests | 2026-11-13 | 2026-11-16 | 4 | 6.1 | Majd | Planned | Correct saved price |
| 6 | 6.3 | Enrollment list, pause and end, student profile view | 2026-11-16 | 2026-11-16 | 3 | 6.1 | Majd | Planned | Enrollment management |
| 7 | 7.1 | Calendar views (day, week), mobile default for today | 2026-11-13 | 2026-11-16 | 7 | 5.2 | Mirna | Planned | Calendar UI |
| 7 | 7.2 | Assign a student to a slot (creates session); group = several students in one slot | 2026-11-16 | 2026-11-17 | 5 | 6.1, 7.1 | Mirna | Planned | Slot assignment |
| 7 | 7.3 | Remaining music sessions per month (counted, resets monthly, Lebanon time), unit tests | 2026-11-16 | 2026-11-17 | 4 | 6.1 | Majd | Planned | Session counting |
| 7 | 7.4 | Warnings with override: no sessions left, teacher overlap | 2026-11-17 | 2026-11-17 | 2 | 7.2, 7.3 | Mirna | Planned | Safe scheduling |
| 7 | 7.5 | Delete (returns session) and move slots | 2026-11-17 | 2026-11-17 | 2 | 7.2 | Mirna | Planned | Edit calendar slots |
| 8 | 8.1 | Monthly charge creation, duplicate protection | 2026-11-16 | 2026-11-17 | 5 | 6.2 | Majd | Planned | Monthly charges |
| 8 | 8.2 | Payment entry: method, currency, rate and USD value saved | 2026-11-17 | 2026-11-17 | 5 | 9.1, 8.1 | Majd | Planned | Payments |
| 8 | 8.3 | Balance calculation and void logic, unit tests | 2026-11-17 | 2026-11-18 | 5 | 8.2 | Majd | Planned | Accurate balances |
| 8 | 8.4 | Ledger history and balance on the student profile | 2026-11-18 | 2026-11-18 | 3 | 8.3 | Mirna | Planned | Balance UI |
| 9 | 9.1 | Exchange rate screen | 2026-11-13 | 2026-11-13 | 3 | 4.3 | Majd | Planned | Rate management |
| 9 | 9.2 | Expense entry with categories, currency and rate saved | 2026-11-18 | 2026-11-18 | 5 | 9.1 | Mirna | Planned | Expenses |
| 10 | 10.1 | Dashboard summary: revenue, expenses, profit, outstanding | 2026-11-18 | 2026-11-19 | 6 | 8.3, 9.2 | Majd | Planned | Core dashboard |
| 10 | 10.2 | Breakdowns: revenue per subject and per teacher, active students | 2026-11-19 | 2026-11-19 | 2 | 10.1 | Majd | Planned | Breakdown reports |
| 10 | 10.3 | Period filter and USD/LBP switch | 2026-11-19 | 2026-11-19 | 3 | 10.1 | Mirna | Planned | Filters |
| 10 | 10.4 | Reminders panel: outstanding balances, music students low on sessions | 2026-11-19 | 2026-11-19 | 3 | 7.3, 8.3 | Mirna | Planned | Reminders |
| 11 | 11.1 | PDF receipt (Arabic and English), numbering, download | 2026-11-19 | 2026-11-20 | 6 | 8.2 | Mirna | Planned | PDF receipts |
| 11 | 11.2 | Excel export of all tables, last-export indicator, 7-day reminder | 2026-11-19 | 2026-11-20 | 6 | 1.2 | Majd | Planned | Excel backup |
| 12 | 12.1 | Manual test script per module, bug fixing | 2026-11-19 | 2026-11-20 | 6 | 1 to 11 | Majd, Mirna | Planned | Bug list closed |
| 12 | 12.2 | Full Arabic/RTL and phone walkthroughs | 2026-11-20 | 2026-11-20 | 2 | 12.1 | Mirna | Planned | UI verified |
| 12 | 12.3 | Data-safety test: export, restore, check figures against manual calculation | 2026-11-20 | 2026-11-20 | 2 | 11.2, 2.5 | Majd, Ali | Planned | Verified backups and figures |
| 12 | 12.4 | Handover documentation: setup, deployment, backup and restore | 2026-11-20 | 2026-11-20 | 2 | 12.1 | Majd, Mirna | Planned | README and runbook |

---

## Milestones

| Date | Milestone |
| --- | --- |
| Mon 9 Nov | Scope freeze; kickoff; hosting and database provisioned |
| Wed 11 Nov | Login with 2FA, language switching, responsive shell; CI running |
| Fri 13 Nov | **Client review with Abdullah Maatouk (end of week 1):** students, teachers, subjects, grades, enrollments demo; slip check; backups tested |
| Wed 18 Nov | Calendar, charges, payments, balances, and expenses working |
| Fri 20 Nov | Feature complete; QA done; release candidate in production |
| Wed 25 Nov | Buffer ends; final acceptance and sign-off |

## Work Split

- **Majd:** data-heavy work: schema and seed, login and 2FA, students, enrollments and price logic, session counting, charges, payments, balances, dashboard calculations, Excel export.
- **Mirna:** experience-heavy work: design tokens, i18n and RTL, shell, teachers, subjects, grades, calendar, balance UI, expenses, dashboard filters and reminders, PDF receipts.
- **Ali:** hosting, environments, CI/CD, backups, security hardening, monitoring, production release, and runbook. Spare capacity goes to QA support, realistic test data, and the data-safety test.
- **Majd and Mirna:** both work on design and engineering, and review each other's finance and RTL work.

---

## Technical Approach

- Single repo; React frontend, Node API using Prisma, hosted PostgreSQL.
- Pricing: `monthly price = subject price for the format × grade rate` (rate = 1 for music), saved on the enrollment.
- Balance and remaining sessions are always calculated from rows, never stored.
- Money rows are voided, never deleted. Payments and expenses store the rate used and their USD value.
- Warnings (no sessions left, teacher overlap) are soft: shown with an override.
- All user-facing text goes through i18n keys; layout uses logical CSS properties for RTL.
- Month boundaries are calculated in Lebanon time.

## Definition of Done

- Works in Arabic (RTL) and English.
- Works on laptop and phone.
- Calculations (price, discount, balance, sessions) have unit tests.
- No console errors; inputs validated.
- Reviewed by the other developer.
- Deployed to staging by the pipeline.
- Documented if it affects setup, backup, or deployment.

## Scope-Freeze Rule

Scope is frozen on 9 Nov. New ideas go on a "Later" list in Notion. Anything added to the scope requires removing something of equal effort or moving the date, agreed with the team lead.

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Development effort (142h) at the 140h capacity | High | Delay | Build in priority order; use buffer; flag slips by 13 Nov; cut polish before features; Ali supports QA |
| Calendar and session-count errors | Medium | High | Count from rows; unit tests; month boundaries in Lebanon time |
| Balance and currency errors | Medium | High | Unit tests; manual cross-check; pair review |
| Arabic/RTL bugs found late | Medium | Medium | RTL from day 1; test each screen in both languages |
| Free-tier database pauses or hits limits | Medium | High | Automated backups, weekly Excel export, usage monitoring |
| Pricing or session rules change mid-build | Medium | Medium | Rules live in data (Subject, GradeLevel), prices saved per enrollment |
| 2FA lockout of the sole admin | Low | High | Recovery codes; documented reset procedure |
| Team member unavailable | Low | High | Shared stack, pair reviews, documentation, Ali familiar with deployment |

## Testing and Handover Checklist

- [ ]  All modules pass the manual test script
- [ ]  Price, discount, balance, and session-count unit tests pass
- [ ]  Arabic/RTL walkthrough done on laptop and phone
- [ ]  Excel export verified; database restore test done
- [ ]  2FA and recovery codes tested
- [ ]  Dashboard figures match manual calculation in USD and LBP
- [ ]  PDF receipts correct in Arabic and English
- [ ]  CI/CD pipeline green; production deployed over HTTPS
- [ ]  Production secrets secured; monitoring and alerts active
- [ ]  README and runbook delivered
- [ ]  Client and team lead sign-off recorded