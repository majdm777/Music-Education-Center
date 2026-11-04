# Project Plan

# Music & Education Center Management System

This document is for the team. It covers what we build, in what order, who owns it, and how we know it is done. Product requirements live in `PRD_Center_Management_System.md`; architecture in `project_spec.md`; data in `schema.md` (v6).

**Client:** Abdullah Maatouk
**Team:** Majd Maatouk (Team Lead, design and engineering), Mirna Derbieh (Product Manager, design and engineering), Ali Othman (DevOps)
**Stack:** TypeScript, Next.js (App Router), NestJS, Prisma 6, PostgreSQL on Neon, pnpm workspaces
**Target:** 9 Nov to 20 Nov 2026 (10 working days). **Buffer:** 23 Nov to 25 Nov 2026.
**Environment setup:** 4 Nov to 8 Nov 2026, before kickoff.
**Sign-off:** client and team lead.

---

## Re-baseline note (4 Nov 2026)

The original plan assumed a single React app with Prisma. The approved v6 scope adds a Next.js + NestJS monorepo, in-house authentication with 2FA, database constraints that Prisma cannot express, and a shared domain package. Those are real hours, so the estimate is restated rather than hidden.

| | Original | Revised | Why |
| --- | --- | --- | --- |
| Engineering effort (Majd + Mirna) | 142h (98-213) | **170h (125-240)** | Monorepo and two apps +8, in-house auth +6, v6 schema and constraints +3, shared Zod/domain package +5, Arabic PDF +2, QA across two apps +4 |
| DevOps effort (Ali) | 40h (28-56) | **44h (30-60)** | Vercel/NestJS spike and Neon branching +4 |
| Total | 182h | **214h** | |

**Capacity.** Majd and Mirna have about 140 productive hours in the ten working days. The revised engineering effort is 170h, so the plan is **30h over capacity** before the buffer. Ali has about 70h: 44h of DevOps leaves 26h for QA support, realistic test data, and the data-safety test, but not feature work. Net slack across the team is roughly zero; the three buffer days (21h) are the only real cushion.

**Consequence.** The **20 Nov** feature-complete target is at risk. **25 Nov remains the commitment.** We check for slip on **13 Nov** (client review). If we are behind, we cut in this order, with the Team Lead's agreement:

1. Reminders panel (10.4, -4h) - keep outstanding balances on the dashboard instead.
2. Dashboard breakdowns per subject/teacher (10.2, -2h) - keep the summary cards.
3. Bilingual PDF receipt (11.2, -3h) - fall back to a print-to-PDF HTML receipt.
4. Excel formatting polish (11.3, -2h) - raw sheets are acceptable; the data is what matters.

We do not cut authentication, backups, balance correctness, session counting, or RTL.

---

## Capacity check

| Resource | Hours |
| --- | --- |
| Engineering capacity (2 x 10 days x 7h) | 140 |
| Revised engineering effort | 170 (range 125-240) |
| Engineering gap | **-30** |
| Ali capacity | 70 |
| DevOps effort | 44 (range 30-60) |
| Ali remaining for QA and test data | 26 |
| Team effort in the ten days | 214 |
| Net slack in the ten days | **-4** |
| Buffer days (3 x 7h) | 21 |

---

## High-level plan

| Item | # | Description | Start | End | Original (h) | Revised (h) | Depends on | Owner | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Environment and project setup | 1 | WSL repo, monorepo, tooling, Prisma v6, migration, seed, design tokens | 2026-11-04 | 2026-11-08 | 10 | 14 | N/A | Majd, Mirna | Running app with the base schema |
| DevOps and deployment | 2 | Neon, Vercel, environments, CI/CD, secrets, backups, monitoring, runbook | 2026-11-09 | 2026-11-20 | 40 | 44 | N/A | Ali | Reliable environments and deployments |
| Login and 2FA | 3 | Admin login, argon2id, TOTP, recovery codes, lockout, session expiry | 2026-11-10 | 2026-11-11 | 8 | 14 | 1 | Majd | Secured admin access |
| Language, RTL, layout shell | 4 | next-intl, Arabic/English dictionaries, RTL, responsive shell | 2026-11-10 | 2026-11-11 | 14 | 16 | 1 | Mirna | Bilingual, responsive shell |
| Master data | 5 | Students, teachers, subjects with prices and minutes, grade levels | 2026-11-11 | 2026-11-13 | 14 | 16 | 1, 3, 4 | Majd, Mirna | Core records and price book |
| Enrollments | 6 | Music/Education enrollment, price calculation, discount, status | 2026-11-12 | 2026-11-16 | 12 | 14 | 5 | Majd | Working enrollment flow |
| Calendar and sessions | 7 | Calendar, slot assignment, groups, repeats, session count, warnings | 2026-11-13 | 2026-11-17 | 20 | 22 | 5, 6 | Mirna, Majd | Calendar with session tracking |
| Ledger, payments, balance | 8 | Monthly charges, payments, refunds, currency, void, balance | 2026-11-16 | 2026-11-18 | 18 | 20 | 6, 9 | Majd, Mirna | Accurate balances |
| Expenses and exchange rates | 9 | Rate screen, expense entry, void | 2026-11-13 | 2026-11-18 | 8 | 9 | 1, 4 | Mirna, Majd | Expenses and rate management |
| Dashboard and reminders | 10 | Revenue, expenses, profit, outstanding, credits, breakdowns, filters, reminders | 2026-11-18 | 2026-11-19 | 14 | 15 | 7, 8, 9 | Majd, Mirna | Dashboard with all metrics |
| Receipts and export | 11 | PDF receipts (AR/EN), numbering, Excel export, 7-day reminder | 2026-11-19 | 2026-11-20 | 12 | 14 | 8 | Mirna, Majd | PDF and Excel outputs |
| QA, security, handover | 12 | Testing, bug fixes, RTL and mobile walkthroughs, data-safety test, docs | 2026-11-19 | 2026-11-20 | 12 | 16 | 1 to 11 | Majd, Mirna, Ali | Release candidate and handover docs |
| Buffer | 13 | Slip recovery, client feedback fixes, final acceptance | 2026-11-23 | 2026-11-25 | n/a | n/a | 12 | All | Accepted release |
| **Total** | | | | | **182** | **214** | | | |

---

## Detailed plan

### 1. Environment and project setup (14h, 4-8 Nov)

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1.1 | Move repo to WSL ext4, repo hygiene, pnpm workspace, Node/pnpm pins, lint/format, env validation | 2026-11-04 | 2026-11-04 | 3 | N/A | Majd | Reproducible workspace |
| 1 | 1.2 | Prisma v6 schema, initial migration with partial index/CHECKs/sequence, seed (admin, grades, subjects, settings) | 2026-11-05 | 2026-11-06 | 4 | 1.1 | Majd | Migrated, seeded Docker database |
| 1 | 1.3 | Design tokens (placeholder brand), base components, form patterns, Arabic font | 2026-11-05 | 2026-11-08 | 5 | 1.1 | Mirna | Base UI kit |
| 1 | 1.4 | Local/CI env docs, `.env.example`, health check, web-to-API rewrite verified | 2026-11-07 | 2026-11-08 | 2 | 1.1 | Majd | Fresh-clone setup works |

### 2. DevOps and deployment (44h, 9-20 Nov)

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 2.1 | Provision Neon (main/dev/staging branches) and Vercel projects | 2026-11-09 | 2026-11-09 | 4 | N/A | Ali | Live database and hosting |
| 2 | 2.2 | Dev, staging, production environments and secrets matrix | 2026-11-09 | 2026-11-10 | 4 | 2.1 | Ali | Three environments |
| 2 | 2.3 | CI: lint, typecheck, tests, build on every pull request | 2026-11-10 | 2026-11-11 | 6 | 1.1 | Ali | Automated checks |
| 2 | 2.4 | CD: automatic staging deploy, controlled production deploy, migrations with a backup first | 2026-11-11 | 2026-11-12 | 6 | 2.3 | Ali | Repeatable deployments |
| 2 | 2.5 | Daily encrypted `pg_dump` to R2 and a tested restore | 2026-11-12 | 2026-11-13 | 6 | 2.1 | Ali | Verified backups |
| 2 | 2.6 | HTTPS, security headers, CSP, login rate limiting | 2026-11-16 | 2026-11-16 | 4 | 2.4 | Ali | Hardened deployment |
| 2 | 2.7 | Monitoring, logs, alerts, free-tier usage watch | 2026-11-17 | 2026-11-17 | 4 | 2.4 | Ali | Monitoring in place |
| 2 | 2.8 | Production release and deployment runbook | 2026-11-19 | 2026-11-20 | 6 | 2.4, 2.5 | Ali | Live system and runbook |
| 2 | 2.9 | Vercel/NestJS spike: cached bootstrap handler, Prisma + Neon pooling, cold start, fallback host decision | 2026-11-09 | 2026-11-09 | 4 | 2.1 | Ali | Decision record |

### 3. Login and 2FA (14h, 10-11 Nov)

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | 3.1 | Login page, argon2id, JWT cookie session, route protection, idle expiry | 2026-11-10 | 2026-11-10 | 6 | 1.2 | Majd | Working login |
| 3 | 3.2 | TOTP setup and verification, encrypted secret, recovery codes, lockout | 2026-11-11 | 2026-11-11 | 6 | 3.1 | Majd | 2FA enabled |
| 3 | 3.3 | Auth unit tests: hashing, token expiry, lockout, recovery codes | 2026-11-11 | 2026-11-11 | 2 | 3.2 | Majd | Covered auth logic |

### 4. Language, RTL, layout shell (16h, 10-11 Nov)

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 4.1 | next-intl setup, Arabic and English dictionaries, language switcher | 2026-11-10 | 2026-11-10 | 5 | 1.3 | Mirna | Language switching |
| 4 | 4.2 | RTL mirroring with logical CSS, Arabic font, number/date/currency formats | 2026-11-10 | 2026-11-11 | 6 | 4.1 | Mirna | Correct RTL layout |
| 4 | 4.3 | Responsive shell: sidebar on laptop, drawer on phone | 2026-11-11 | 2026-11-11 | 4 | 4.1 | Mirna | Responsive navigation |
| 4 | 4.4 | RTL and 375px checklist added to the test script | 2026-11-11 | 2026-11-11 | 1 | 4.3 | Mirna | Reusable checklist |

### 5. Master data (16h, 11-13 Nov)

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 5.1 | Students: list, search, create, edit, archive, restore, profile skeleton | 2026-11-11 | 2026-11-12 | 6 | 3.1, 4.3 | Majd | Students module |
| 5 | 5.2 | Teachers: list, create, edit, pay notes, active status | 2026-11-12 | 2026-11-12 | 3 | 4.3 | Mirna | Teachers module |
| 5 | 5.3 | Subjects: type, group/one-on-one prices, monthly sessions, lesson minutes, active | 2026-11-12 | 2026-11-13 | 4 | 4.3 | Mirna | Subject price book |
| 5 | 5.4 | Grade levels with rates and order | 2026-11-13 | 2026-11-13 | 3 | 4.3 | Mirna | Grade rates |

### 6. Enrollments (14h, 12-16 Nov)

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6 | 6.1 | Enrollment form: Music/Education switch, subject, grade, teacher, format, sessions, start date | 2026-11-12 | 2026-11-13 | 5 | 5.1, 5.3, 5.4 | Majd | Enrollments |
| 6 | 6.2 | Price calculation (subject price x grade rate), discount, clamping, unit tests | 2026-11-13 | 2026-11-16 | 4 | 6.1 | Majd | Correct saved price |
| 6 | 6.3 | Enrollment list, pause/resume/end, student profile view | 2026-11-16 | 2026-11-16 | 5 | 6.1 | Majd | Enrollment management |

### 7. Calendar and sessions (22h, 13-17 Nov)

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 7 | 7.1 | Calendar day/week views, today default on mobile, open hours from Settings | 2026-11-13 | 2026-11-16 | 7 | 5.2 | Mirna | Calendar UI |
| 7 | 7.2 | Assign a student to a slot; group = several students in one slot; weekly repeat with end date | 2026-11-16 | 2026-11-17 | 6 | 6.1, 7.1 | Mirna | Slot assignment |
| 7 | 7.3 | Remaining sessions per Beirut month, unit tests (DST and month boundary) | 2026-11-16 | 2026-11-17 | 4 | 6.1 | Majd | Session counting |
| 7 | 7.4 | Warnings with override: no sessions left, teacher overlap (group mates excluded) | 2026-11-17 | 2026-11-17 | 2 | 7.2, 7.3 | Mirna | Safe scheduling |
| 7 | 7.5 | Move (keeps count), delete (returns session), edit one/following, repeat end date | 2026-11-17 | 2026-11-17 | 3 | 7.2 | Mirna | Editable slots |

### 8. Ledger, payments, balance (20h, 16-18 Nov)

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 8 | 8.1 | Charge proposal for a month, edit/skip, transactional confirm, duplicate protection, re-issue after void | 2026-11-16 | 2026-11-17 | 5 | 6.2 | Majd | Monthly charges |
| 8 | 8.2 | Payment entry (method, currency, rate, USD value, receipt number) and refund entry with cap | 2026-11-17 | 2026-11-17 | 6 | 9.1, 8.1 | Majd | Payments and refunds |
| 8 | 8.3 | Balance, void logic, refund cap, unit tests | 2026-11-17 | 2026-11-18 | 5 | 8.2 | Majd | Accurate balances |
| 8 | 8.4 | Ledger history and balance on the student profile | 2026-11-18 | 2026-11-18 | 4 | 8.3 | Mirna | Balance UI |

### 9. Expenses and exchange rates (9h, 13-18 Nov)

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 9 | 9.1 | Exchange rate screen with effective dates | 2026-11-13 | 2026-11-13 | 3 | 4.3 | Majd | Rate management |
| 9 | 9.2 | Expense entry: categories, currency, rate, USD value, optional teacher | 2026-11-18 | 2026-11-18 | 5 | 9.1 | Mirna | Expenses |
| 9 | 9.3 | Void expense and unit test | 2026-11-18 | 2026-11-18 | 1 | 9.2 | Mirna | Corrected costs |

### 10. Dashboard and reminders (15h, 18-19 Nov)

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | 10.1 | Summary: revenue, expenses, profit, outstanding, credits | 2026-11-18 | 2026-11-19 | 6 | 8.3, 9.2 | Majd | Core dashboard |
| 10 | 10.2 | Breakdowns: revenue per subject and per enrollment teacher, active students | 2026-11-19 | 2026-11-19 | 2 | 10.1 | Majd | Breakdown reports |
| 10 | 10.3 | Period filter and USD/LBP switch with the period-end rate label | 2026-11-19 | 2026-11-19 | 3 | 10.1 | Mirna | Filters |
| 10 | 10.4 | Reminders panel: outstanding/overdue, low or no sessions | 2026-11-19 | 2026-11-19 | 4 | 7.3, 8.3 | Mirna | Reminders |

### 11. Receipts and export (14h, 19-20 Nov)

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 11 | 11.1 | Day-1 Arabic PDF spike: library, font, RTL shaping, print fallback | 2026-11-19 | 2026-11-19 | 2 | 1.3 | Mirna | PDF decision |
| 11 | 11.2 | PDF receipt (AR/EN), receipt numbering, download | 2026-11-19 | 2026-11-20 | 5 | 8.2 | Mirna | PDF receipts |
| 11 | 11.3 | Excel export of all business tables (auth secrets excluded), last-export timestamp, 7-day reminder | 2026-11-19 | 2026-11-20 | 5 | 1.2 | Majd | Excel backup |
| 11 | 11.4 | Export/restore cross-check against a manual calculation | 2026-11-20 | 2026-11-20 | 2 | 11.3 | Majd, Ali | Verified totals |

### 12. QA, security, handover (16h, 19-20 Nov)

| HL # | Item # | Description | Start | End | Effort (h) | Depends on | Engineer | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 12 | 12.1 | Manual test script per module, bug fixing | 2026-11-19 | 2026-11-20 | 6 | 1 to 11 | Majd, Mirna | Bug list closed |
| 12 | 12.2 | Full Arabic/RTL and phone walkthroughs | 2026-11-20 | 2026-11-20 | 3 | 12.1 | Mirna | UI verified |
| 12 | 12.3 | Data-safety test: export, restore, figures vs manual | 2026-11-20 | 2026-11-20 | 3 | 11.3, 2.5 | Majd, Ali | Verified backups and figures |
| 12 | 12.4 | Handover: README, setup, deployment, backup/restore, reset script | 2026-11-20 | 2026-11-20 | 4 | 12.1 | Majd, Mirna, Ali | Runbook delivered |

---

## Milestones

| Date | Milestone |
| --- | --- |
| 4-8 Nov | Environment ready: WSL repo, monorepo, Docker Postgres, schema v6 and seed, CI skeleton, deployment spike |
| Mon 9 Nov | Scope freeze; kickoff; Neon and Vercel provisioned |
| Wed 11 Nov | Login with 2FA, language switching, responsive shell; CI running |
| Fri 13 Nov | **Client review (end of week 1):** students, teachers, subjects, grades, enrollments; backups tested; **slip check** |
| Wed 18 Nov | Calendar, charges, payments, refunds, balances and expenses working |
| Fri 20 Nov | Feature complete; QA done; release candidate in production (**at risk, see re-baseline**) |
| Wed 25 Nov | Buffer ends; final acceptance and sign-off |

---

## Work split

- **Majd:** environment and schema, auth and 2FA, students, enrollments and pricing, session counting, charges, payments/refunds/balance, dashboard calculations, Excel export.
- **Mirna:** design tokens, i18n and RTL, shell, teachers, subjects, grades, calendar, balance/ledger UI, expenses, dashboard filters and reminders, PDF receipts.
- **Ali:** hosting, environments, CI/CD, Vercel/NestJS spike, backups, security hardening, monitoring, production release, runbook; spare capacity goes to QA support, realistic test data, and the data-safety test.
- **Both developers:** design and engineering, and review each other's finance and RTL work.

---

## Technical approach

- **Monorepo:** `apps/web` (Next.js), `apps/api` (NestJS), `packages/shared` (Zod DTOs and pure domain math). Prisma lives in the API only.
- **Same-origin API:** Next.js rewrites `/api/*` to the NestJS API; the session cookie stays first-party and CORS stays minimal.
- **Pricing:** `monthly price = subject price for the format x grade rate` (rate = 1 for music), saved on the enrollment. Fixed discounts clamp at 0; percent is 0-100.
- **Computed, not stored:** balance, revenue, profit, outstanding and remaining sessions are all derived from rows.
- **Money:** Prisma `Decimal` and `decimal.js`, HALF_UP to 2 decimals, never floats.
- **Dates:** timestamps in UTC; month windows and "today" in `Asia/Beirut`; one shared date utility; DST and month-boundary tests.
- **Corrections:** money rows are voided, never deleted; refunds are separate rows capped at net paid.
- **Warnings, not blocks:** no sessions left and teacher overlap are warnings with an override; group mates in the same slot are not a conflict.
- **Auth:** argon2id, mandatory TOTP, encrypted secret, hashed recovery codes, 30-minute idle JWT session, lockout, `tokenVersion` revocation.
- **i18n:** every string through next-intl; logical CSS properties for RTL; Arabic font and number/date formatting verified per screen.
- **Database:** v6 schema plus the partial unique index, CHECK constraints and receipt sequence in the migration SQL (see `schema.md`).

---

## Definition of Done

- Works in Arabic (RTL) and English.
- Works on laptop and on a 375px phone.
- Calculations (price, discount, balance, refund cap, sessions, currency) have unit tests.
- No console errors; inputs validated on the server.
- Reviewed by the other developer.
- Deployed to staging by the pipeline; CI green.
- Migration applied to staging without manual steps.
- Arabic PDF receipt verified (or the documented print fallback used).
- Documented if it affects setup, backup or deployment.

## Scope-freeze rule

Scope is frozen on 9 Nov. New ideas go on a "Later" list in Notion. Anything added requires removing something of equal effort or moving the date, agreed with the Team Lead. The cut list in the re-baseline note is pre-agreed for schedule recovery.

## Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Revised effort (170h) exceeds engineering capacity (140h) | High | Delay | Environment done before kickoff; priority order; slip check on 13 Nov; pre-agreed cut list; buffer days |
| Calendar and session-count errors | Medium | High | Count from rows; Beirut month window; DST and boundary tests |
| Balance, refund or currency errors | Medium | High | Unit tests; refund cap; stored rates; manual cross-check; pair review |
| Arabic/RTL bugs found late | Medium | Medium | RTL from day 1; test each screen in both languages; checklist from 4.4 |
| Arabic text in PDFs | Medium | Medium | Day-1 spike; font verified; print-to-PDF fallback |
| Vercel Hobby cannot host NestJS cleanly | Medium | High | Day-1 spike; API kept host-agnostic; fallback container host |
| Free-tier database pauses or hits limits | Medium | High | Automated backups; weekly Excel export; usage monitoring |
| Pricing or session rules change mid-build | Medium | Medium | Rules live in Subject and GradeLevel data; price saved per enrollment |
| 2FA lockout of the sole admin | Low | High | Recovery codes; documented reset procedure |
| Team member unavailable | Low | High | Shared stack, pair reviews, documentation, Ali familiar with deployment |

## Testing and handover checklist

- [ ] All modules pass the manual test script
- [ ] Price, discount, balance, refund-cap, currency and session-count unit tests pass
- [ ] Arabic/RTL walkthrough done on laptop and phone
- [ ] Excel export verified; database restore test done
- [ ] 2FA and recovery codes tested; reset script documented
- [ ] Dashboard figures match a manual calculation in USD and LBP
- [ ] PDF receipts correct in Arabic and English
- [ ] CI/CD pipeline green; production deployed over HTTPS
- [ ] Production secrets secured; monitoring and alerts active
- [ ] README and runbook delivered
- [ ] Client and team lead sign-off recorded
