# Product Requirements Document (PRD)

# Music & Education Center Management System

This document defines the product: who it is for, what it must do, and how we will know it is done. Technical design lives in `project_spec.md`; the database lives in `schema.md` (v6). Where those documents disagree with this one on product behaviour, this PRD wins; where they disagree on implementation, the spec wins.

| Field | Details |
| --- | --- |
| Client | Abdullah Maatouk |
| Project dates | 9 Nov 2026 to 20 Nov 2026 (10 working days), buffer to 25 Nov 2026. Environment setup 4-8 Nov 2026. |
| Document status | `Draft v3, pending sign-off` |
| Version / date | 3.0 / 4 Nov 2026 |
| Product Manager | Mirna Derbieh |
| Technical Manager / Team Lead | Majd Maatouk |
| Designers / Engineers | Majd Maatouk, Mirna Derbieh |
| DevOps | Ali Othman |
| Client stakeholder | Abdullah Maatouk (center owner and admin, sole user, final approver) |
| Budget | In-house |

*The center name, logo and colours are placeholders and will be supplied by the client later. They are stored in Settings, not hard-coded.*

---

## 1. Purpose

Build a private web application that lets the center owner run registration, scheduling, billing and expenses from one place, with a balance for every student and a profit figure he can trust. The center is launching with no old records, so this system is the single source of truth from day one.

## 2. Goals

1. Replace notebooks and spreadsheets for students, enrollments, lessons, payments and expenses.
2. Answer "who owes me money?" accurately at any moment, per enrollment and per student.
3. Show revenue, expenses and profit for any period, in USD or LBP, without manual calculation.
4. Protect the data with a hosted database, automatic backups, weekly Excel exports, and a secured single-admin login.

## 3. Target user

| | |
| --- | --- |
| **Primary user** | Abdullah Maatouk, owner and admin. The only user in v1. |
| **Comfort level** | Comfortable with software; works in Arabic and English. |
| **Devices** | Mostly laptop; phone for urgent tasks (today's lessons, recording a payment, looking up a student or parent). |
| **Scale (year 1)** | 50 to 70 students, 5 to 10 teachers, a few dozen subjects. |
| **Not users** | Teachers, students and parents do not log in. Nothing is sent to them. |
| **Later** | Additional users with limited roles (for example an assistant) are possible in a later version. |

## 4. Background

The center offers **music lessons** (instruments) and **education lessons** (school subjects, mainly the Lebanese Baccalaureate, plus "agenda" support covering homework help, exam preparation and planning). Lessons are in person, one-on-one or in a group, delivered by a team of teachers.

How the center works:

- **Every enrollment is a one-month plan that renews monthly.** There is no per-session billing.
- **Prices are monthly, in USD.** They depend on the subject, on the format (one-on-one costs more than group), and for education on the student's grade level.
- **Music students have a monthly session allowance.** Assigning a student to a calendar slot uses one session, whether or not they attend.
- **Education students have no session limit.**
- **Payments** can be made in USD or LBP by cash, bank transfer, Whish/OMT, or card.
- **Teacher pay** is not calculated by the system in v1; it is recorded as a manual expense.

## 5. Scope at a glance

| Module | What it does |
| --- | --- |
| **Students** | Register, search, edit, archive. Profile with enrollments, remaining music sessions, balance and ledger history. |
| **Teachers** | Name, phone, pay notes, active status. No login. |
| **Subjects and prices** | One list of instruments and school subjects/agenda. Type, monthly group and one-on-one prices in USD, default lesson length per format, and for music a default monthly session allowance. |
| **Grade levels** | Grades with a price rate (for example Grade 3 = 1.2). |
| **Enrollments** | One student joins one subject as Music or Education, with teacher, format, start date, optional discount. The monthly price is calculated and saved. |
| **Calendar** | Day and week views. Assign a student to a slot with teacher, date and time. Weekly repeats. Group lessons. Warnings for overlaps and exhausted sessions. |
| **Monthly charges** | A button creates the month's charges as a review list. The admin edits or skips, then confirms. |
| **Payments and refunds** | Full or partial payments with method, currency and date. Refunds are separate entries. Mistakes are voided, never deleted. |
| **Balance** | Calculated per enrollment and per student. Credit balances are allowed. |
| **Exchange rate** | Manual USD to LBP rate, with the rate used stored on every payment and expense. |
| **Expenses** | Rent, utilities, teacher pay, equipment, marketing, other, in USD or LBP. |
| **Dashboard** | Revenue, expenses, profit, outstanding balances, credits, revenue per subject and per teacher, active students. Period filter and USD/LBP switch. |
| **Reminders** | In-app panel: students with outstanding balances, music students low on sessions. |
| **Receipts** | Downloadable PDF per payment, Arabic or English. |
| **Backup** | One-click Excel export of all data, a 7-day reminder, and automatic database backups. |
| **Settings** | Center name, logo, colours, open days and hours, defaults. |
| **Language** | Arabic (RTL) and English, switchable at any time. |

## 6. Pricing rules

All prices are monthly and in USD.

| Case | Monthly price |
| --- | --- |
| Music | The instrument price for the chosen format (group or one-on-one) |
| Education (school subject or agenda) | The subject price for the chosen format x the student's grade rate |
| Discount | Optional percentage or fixed amount on the enrollment, applied every month until changed |

Example: Math, group, 20 USD, Grade 3 rate 1.2 -> 20 x 1.2 = **24 USD per month.**

The calculated price is saved on the enrollment. Later changes to subject prices or grade rates never change existing enrollments. A fixed discount larger than the price produces a charge of 0, never a negative charge.

## 7. Business rules

### 7.1 Enrollments and charges

- A student can have several enrollments; each has its own price, balance and ledger.
- An enrollment has a status: **Active**, **Paused** or **Ended**.
- A student who joins mid-month pays the full month. There is no proration; the discount can adjust it.
- A paused enrollment is not charged. An enrollment ended during a month is billed for that final month and stops from the next month; ending it sets its end date.
- Changing an enrollment's discount affects the next generated charge, not charges already created.
- Charges are created only when the admin presses the button and confirms the review list.
- One live charge exists per enrollment per month. A voided charge does not block a corrected replacement.
- A charge equals the saved price minus the discount, but the admin may edit the amount in the review list before confirming. The confirmed amount is what the ledger stores.
- Charges are created in one transaction; the unique constraint is the final guard against duplicates.

### 7.2 Music sessions

- Each music enrollment has a monthly allowance, copied from the subject at enrollment and editable per student.
- A session is used when the student is assigned to a calendar slot, whether or not they attend.
- Remaining = allowance minus the number of sessions whose start time falls in that calendar month, Beirut time. The count resets monthly with no carry-over.
- Deleting a slot returns the session. Moving a slot keeps the count; a cross-month move counts in the month of the new start time.
- Exceeding the allowance warns but can be overridden.
- Education enrollments have no limit and no counter.
- A group lesson is several students in one slot: one `Session` row per student, same teacher and time.
- Warnings are soft. The admin can always override.

### 7.3 Money

- USD is the base currency. Prices are USD.
- Payments and expenses can be in USD or LBP. Each stores the amount, the currency, the rate used and the USD value.
- **Balance** = charges - payments + refunds, ignoring voided rows. A negative balance is a credit.
- **Revenue** = payments received - refunds, by payment/refund date.
- **Profit** = revenue - expenses.
- **Outstanding** = the sum of positive enrollment balances as of the period end. Credits are shown separately and never netted against another student's debt.
- **Refund cap:** refunds for an enrollment cannot exceed its non-voided payments minus prior refunds. Overpayment credits are still allowed; the cap applies to refunds, not to the resulting balance.
- Changing the exchange rate never changes past records.
- Rounding is HALF_UP to 2 decimals, using decimal arithmetic; never floating point.

### 7.4 Corrections

- Mistakes are voided, never deleted. A void sets a timestamp and the row stops counting immediately.
- A refund is a real event on its own date, not a void of a payment.
- A voided payment keeps its receipt number; numbers are never reused.
- Receipt numbers are global and monotonic, assigned inside the payment transaction. Only payments have receipts.

### 7.5 Dates, periods and definitions

- All month boundaries and "today" are calculated in `Asia/Beirut`. Timestamps are stored in UTC.
- `periodMonth` is the first day of the month a charge covers (for example 2026-11-01).
- **Active student:** not archived and has at least one Active enrollment.
- **Overdue:** an enrollment with a positive balance and at least one non-voided charge whose month is strictly before the current Beirut month.
- **Low sessions:** a music enrollment with 1 or fewer sessions remaining in the current month.
- **Revenue per teacher:** attributed to the enrollment's teacher. The session's teacher is who delivered the lesson and is used only for the calendar and conflict checks.

## 8. Functional requirements

| # | Requirement | User story | Acceptance criteria |
| --- | --- | --- | --- |
| FR-01 | **Secure login with 2FA.** Single admin account, password plus TOTP. | As the admin, I want only me to reach financial and student data. | No page or API route is reachable unauthenticated; TOTP is mandatory; 10 recovery codes exist; session expires after 30 minutes idle; repeated failures trigger a temporary lockout. |
| FR-02 | **Bilingual interface with RTL.** | As the admin, I want to work in Arabic or English. | Every interface string exists in both languages; Arabic renders fully RTL; the choice persists per admin and across devices; data can be entered in either language. |
| FR-03 | **Mobile-friendly layout.** | As the admin, I want urgent tasks on my phone. | Calendar, student lookup and payment entry work at 375px wide without horizontal scrolling. |
| FR-04 | **Students.** Create, edit, search, archive. Fields: name, optional birth date, phone, parent name and phone, school, notes. | As the admin, I want a complete record and balance per student. | Found by name or parent phone; profile shows enrollments, remaining sessions, balance and ledger; archived students are hidden but kept and can be restored. |
| FR-05 | **Teachers.** Name, phone, pay notes, active status. | As the admin, I want a record of each teacher and their terms. | Teachers can be assigned to enrollments and slots; pay notes are saved; teachers have no login. |
| FR-06 | **Subjects and prices.** One list for instruments and subjects/agenda, with type, group and one-on-one monthly prices, default lesson minutes per format, and a music session allowance. | As the admin, I want to set prices without a developer. | Subjects can be added, edited and deactivated; price changes do not alter existing enrollments. |
| FR-07 | **Grade levels and rates.** | As the admin, I want grade pricing applied automatically. | Grades can be added and edited with a rate and order; rate changes do not alter existing enrollments. |
| FR-08 | **Enrollments.** Music or Education, subject, teacher, format, start date, optional discount. Education requires a grade; music does not. | As the admin, I want each plan and price calculated correctly. | The price is calculated by the rules and saved; discount is stored and applied monthly; multiple enrollments per student each keep their own price and balance; enrollments can be paused, resumed and ended. |
| FR-09 | **Calendar and sessions.** Day and week views; assign a student to a slot. | As the admin, I want to schedule lessons and track sessions. | Assigning creates a Session; group lessons are several students in one slot; weekly repeats run to an end date, default end of month and maximum 3 months; edit/delete applies to one or all following; delete returns the session; move keeps it. |
| FR-10 | **Conflict warnings.** | As the admin, I want to avoid mistakes without being blocked. | A warning appears when a music student is out of sessions or a teacher has an overlapping slot; the admin can override; group mates in the same slot do not trigger an overlap warning. |
| FR-11 | **Monthly charges.** One live charge per billable enrollment per month. | As the admin, I want what each student owes created correctly. | Proposal lists each billable enrollment (Active, or Ended with its end date in that month) that is not yet charged; admin edits or skips; confirm creates all charges in one transaction; duplicates are impossible; a voided charge can be replaced. |
| FR-12 | **Payments.** Method, currency, date, receipt. | As the admin, I want to record what each parent pays. | Payments in USD or LBP; the rate and USD value are saved; partial payments allowed; a receipt number is assigned; mistakes are voided, never deleted. |
| FR-13 | **Refunds.** Separate entries with method, currency and date. | As the admin, I want to return money correctly. | A refund is its own ledger row; refunds cannot exceed net paid for the enrollment; refunds reduce revenue; no receipt is issued. |
| FR-14 | **Balance.** Per enrollment and per student. | As the admin, I want to see who owes what at any time. | Balance = charges - payments + refunds, excluding voids, in USD; negative means credit; ledger history is visible per student. |
| FR-15 | **Exchange rate.** Manual USD to LBP, one per effective date. | As the admin, I want accurate totals in either currency. | Each payment, refund and expense stores its rate; changing the rate never alters past records; the dashboard's LBP view converts at the rate effective on the period end and labels it. |
| FR-16 | **Expenses.** Six categories, USD or LBP, optional teacher link. | As the admin, I want profit to reflect all costs. | Expenses can be added and voided with category, date, currency and rate; teacher pay is manual; voided expenses drop out of profit immediately. |
| FR-17 | **Dashboard.** Revenue, expenses, profit, outstanding, credits, per subject, per teacher, active students. | As the admin, I want the key numbers at a glance. | All metrics match the underlying rows; the period filter works on transaction dates; the currency switch works and is labelled with the rate used; definitions in section 7.5 are applied. |
| FR-18 | **Reminders (admin only).** | As the admin, I want to see what needs attention. | A panel lists outstanding balances and overdue enrollments, and music students with no or low sessions; nothing is sent to parents. |
| FR-19 | **PDF receipts.** Per payment. | As the admin, I want to give parents a receipt. | The PDF includes center name, student, amount, currency, method, date and receipt number; it renders correctly in Arabic and English; the Arabic font is verified before launch. |
| FR-20 | **Excel export and backup.** | As the admin, I never want to lose my data. | One click exports every business table; authentication secrets (password hash, TOTP secret, recovery codes) are never exported; the app records the last export and reminds after 7 days; the hosted database remains the source of truth; daily encrypted backups are restorable. |
| FR-21 | **Settings.** Center identity, open days and hours, defaults. | As the admin, I want to configure the center without a developer. | Center name, logo and colour are editable; open days/hours drive the calendar; default lesson length is used when a subject has none; changes apply without deployment. |
| FR-22 | **Deployment, environments and backups (DevOps).** | As the team, we want a reliable, repeatable way to ship and recover. | Dev, staging and production exist; every push is built and tested; deployments are repeatable; backups run daily and a restore has been tested; HTTPS only. |

## 9. UX design

- **Layout:** sidebar navigation on laptop, collapsible drawer on phone. Main sections: Dashboard, Students, Calendar, Teachers, Subjects and Grades, Payments, Expenses, Settings.
- **Enrollment form:** the admin first chooses **Music** or **Education**. Music shows instrument, format and session allowance. Education shows subject, grade and format. The calculated monthly price appears before saving.
- **Calendar:** day and week views; today's lessons are the mobile default. Assigning a student is a quick action from a slot; the default length comes from the subject or Settings.
- **Payments:** the fastest path in the product, usable one-handed. Enrollment, amount, currency, method, date, save, receipt.
- **Bilingual and RTL:** the whole layout mirrors in Arabic using logical CSS properties. Numbers, dates and currency stay readable in both languages.
- **Warnings, not blocks:** session limits and teacher overlaps show a warning with an override.
- **Corrections:** void actions are explicit, require a confirmation, and never hide the history.
- **Branding:** placeholder name, logo and colours in v1, stored in Settings so they can be swapped without code changes.

## 10. Non-functional requirements

### Security

- HTTPS only, security headers and a basic content security policy.
- Passwords hashed with argon2id. Login rate limiting and temporary lockout after repeated failures.
- TOTP two-factor authentication is mandatory. Ten recovery codes, stored hashed and single-use. The TOTP secret is encrypted at rest.
- Sessions expire after 30 minutes of inactivity.
- No public sign-up. The admin is created by a seed script. A forgotten password is reset by DevOps with a documented script.
- All input is validated on the server. Database queries are parameterized.
- Secrets live in environment variables, never in the repository. No personal data in logs.

### Reliability and data safety

- Daily automatic encrypted backup to Cloudflare R2. RPO 24 hours, RTO 1 day. Neon's built-in restore window (about 6 hours on the free plan) is an extra layer, not the plan.
- Weekly Excel export, with an in-app reminder if none was made in 7 days.
- One full restore test before launch, then regularly.
- Online only. The Excel export is the emergency fallback.

### Performance and usability

- Pages interactive within 2 seconds on a normal connection once the database is awake. The first request after idle may be slower on free tiers.
- Search, payment entry and balance lookup are the fastest paths, designed for mobile.
- Works on the latest Chrome, Safari, Edge, Firefox, and on mobile Safari and Chrome.
- Every screen works in Arabic (RTL) and English.

### Quality

- Unit tests cover price calculation, discounts, balance, refund caps, session counting and currency conversion.
- Pull requests need passing checks and one teammate's approval (2 of 3 with the author).
- A feature is done when it passes the Definition of Done in the project plan.

## 11. Out of scope (v1)

Public website, accounts for teachers/parents/students, online payments, messages to parents, per-session billing, installment schedules, rooms and room double-booking, attendance and make-up tracking, recurring expenses, automatic teacher pay calculation, video lessons, and extra user roles. The stretch goals list the candidates for later versions.

## 12. Assumptions

1. All subject prices are in USD. Payments can be in USD or LBP at the manual rate.
2. Every enrollment is a one-month plan that renews monthly.
3. One-on-one costs more than group, so every subject has two prices.
4. The grade rate applies to education subjects and agenda only, not to music.
5. A music session is used when the student is assigned in the calendar, even if they do not attend.
6. The monthly session allowance comes from the instrument and can be edited per student; it resets monthly with no carry-over.
7. A student taking two subjects has two enrollments, each with its own price and balance.
8. The price is fixed when the student is enrolled and does not follow later price changes. An "apply new price" action may be added later.
9. Charges are created by an explicit button, reviewed, then confirmed.
10. Session limits and teacher overlaps warn but allow override.
11. Teachers do not log in. Teacher pay is entered manually as an expense.
12. The center name, logo and colours are supplied later.
13. The system runs on managed free-tier infrastructure (Neon, Vercel, R2, Resend). Free tiers can pause or cap usage; backups are the safety net.

## 13. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Ten-day schedule with a heavier stack (Next.js + NestJS + in-house auth) | Delay or reduced polish | Environment work done before kickoff; build in priority order; flag slips on 13 Nov; use the buffer and the defined cut list. |
| Free-tier database limits or pausing | Downtime or storage cap | Automated backups; weekly Excel export; usage monitoring; paid upgrade if needed. |
| Price or session rules change mid-build | Rework | Rules live in Subject and GradeLevel data; price saved per enrollment. |
| Arabic/RTL complexity | UI bugs | i18n and RTL from day one; test each screen in Arabic as it is built. |
| Calendar and session counting errors | Wrong remaining sessions | Count rows, never a counter; unit tests; Beirut month boundaries. |
| Balance, refund or currency errors | Wrong revenue and balances | Store the rate per transaction; refund cap; unit tests; manual cross-check before launch. |
| Arabic text in PDFs | Unreadable receipts | Day-1 test of the chosen library and font; fallback to an HTML receipt printed to PDF. |
| Lockout of the only admin | Total loss of access | Recovery codes; documented reset script; 2FA setup tested. |
| Vercel's Hobby plan limits and commercial-use terms (accepted by the client) | Suspension or forced migration | Host-agnostic API; backups outside Vercel; day-1 deployment spike; move triggers agreed in the spec. |
| Single login holds sensitive data | Security exposure | 2FA, recovery codes, HTTPS, session expiry, rate limiting. |

## 14. Test plan and supported environment

- **Environments:** local development (Docker Postgres), staging (Neon branch), production (Neon main).
- **Supported browsers:** latest Chrome, Safari, Edge, Firefox; mobile Safari and Chrome.
- **Testing approach:** a manual test script per module; unit tests for price, discount, balance, refund cap and session counting; a full Arabic/RTL walkthrough; a mobile walkthrough on a real phone.
- **Data safety test:** export to Excel, verify contents, restore from a database backup, and check figures against a manual calculation.
- **Review points:** client review with Abdullah Maatouk at the end of week 1 (13 Nov), and final acceptance at the end of the buffer (25 Nov).

## 15. Key performance indicators

1. 100% of students, enrollments and payments are recorded in the system.
2. Dashboard and balance figures match manual spot-checks.
3. Time to record a payment: under 30 seconds on laptop, under 1 minute on phone.
4. At least one successful Excel backup per week.
5. Zero data-loss incidents.

## 16. Stretch goals (next versions)

- Rooms and room double-booking warnings.
- Attendance tracking and make-up sessions.
- Recurring monthly expenses (rent entered once).
- Automatic teacher pay calculation.
- Additional user roles (for example an assistant without revenue access).
- Public landing page and online enrollment form.
- Events, workshops and summer camps.
- Optional reminders to parents (WhatsApp, SMS or email).
- "Apply new price" action for existing enrollments.

## 17. Open questions

| Question | Owner | Needed by |
| --- | --- | --- |
| Final center name, logo and colours | Client | Before launch; placeholders until then |
| Default lesson length per subject and default open hours (data, not code) | Client / Team | Seed and Settings before the client review |
| Vercel Hobby deployment of NestJS confirmed, or fallback host chosen | Ali | Day 1 (spike) |
| Arabic PDF library and font verified | Mirna | Day 1 |
| Backup encryption tool and key storage | Ali | Before the backup job is enabled |

## 18. Sign-off

| Role | Name | Date | Signature |
| --- | --- | --- | --- |
| Client (center owner) | Abdullah Maatouk | | |
| Team Lead | Majd Maatouk | | |
| Product Manager | Mirna Derbieh | | |
