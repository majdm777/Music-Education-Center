# Product Requirements Document (PRD)

# Music & Education Center Management System

This document defines the goals, purpose, and scope of the project.

## Client Name: Abdullah Maatouk

| Field | Details |
| --- | --- |
| Project Dates | 9 Nov 2026 to 20 Nov 2026 (10 working days), plus buffer to 25 Nov 2026 |
| Document Status | `Draft v2, pending sign-off` |
| Product Manager | Mirna Derbieh |
| Design/Technical Manager | Majd Maatouk |
| Designers/Engineers | Majd Maatouk, Mirna Derbieh (both design and engineering) |
| DevOps | Ali Othman |
| Client Stakeholders & Roles | Abdullah Maatouk (center owner and admin, sole user, final approver) |
| Budget | In-house |

*Note: the center name and branding are placeholders and will be swapped in later.*

---

## Project Goals

1. Build a private web-based management system for the center owner to manage students, teachers, subjects and prices, enrollments, a lesson calendar, payments, and expenses in one place.
2. Give the owner an accurate balance per student and a revenue and profit dashboard (in USD or LBP) so decisions rest on correct records.
3. Protect the center's data with a hosted database, local Excel backups, and a secured login with two-factor authentication.

---

## Who is the target user?

**Primary user:** Abdullah Maatouk, the center owner and admin (single user). Works mainly on a laptop; uses a phone for urgent tasks (today's calendar, recording a payment, looking up a student's or parent's number).

**Secondary user:** None in v1. Teachers and parents do not log in. The data model allows more users to be added later.

---

## Why we believe it is important

The center is launching soon and has no existing records. Starting with a proper system means student records, balances, and finances are accurate from day one instead of being scattered across notebooks and spreadsheets. Pricing follows clear rules (a subject price adjusted by the student's grade), and music students have a monthly session allowance, so the owner needs a tool that applies those rules automatically.

---

## Background

The center offers **music lessons** (instruments) and **education lessons** (school subjects, mainly the Lebanese Baccalaureate, and "agenda" support covering homework help, exam prep, and planning). Lessons are in person, one-on-one or in a group. A team of teachers delivers them.

How the center works:

- **Every enrollment is a one-month plan** that renews monthly. There is no per-session billing.
- **Prices are monthly, in USD**, and depend on the subject, on whether the lesson is group or one-on-one (one-on-one costs more), and, for education, on the student's grade level.
- **Music students have a set number of sessions per month.** Each time the student is assigned to a calendar slot, one session is used, whether or not they attend.
- **Education students have no session limit.**
- **Payments** can be made in USD or LBP, by cash, bank transfer, Whish/OMT, or card.
- **Teacher pay** is not final and is recorded as a manual expense.

---

## Pricing Rules

| Case | Monthly price |
| --- | --- |
| Music | The instrument's price for the chosen format (group or one-on-one) |
| Education | The subject's price for the chosen format × the student's grade rate |
| Discount | Optional percentage or fixed amount on the enrollment |

Example: Math, group, price 20 USD, Grade 3 rate 1.2 → 20 × 1.2 = **24 USD per month**.

The calculated price is saved on the enrollment when the student is enrolled. Later changes to subject prices or grade rates do not change existing students.

---

## Functional Requirements by Priority

| # | Requirement | User Story | Acceptance Criteria |
| --- | --- | --- | --- |
| 1 | **Secure login with 2FA.** Single admin account with password and two-factor authentication. | As the admin, I want only me to access financial and student data. | Unauthenticated users cannot reach any page or API route; login requires a password plus a second factor; recovery codes exist; sessions expire after inactivity. |
| 2 | **Bilingual interface with RTL.** Arabic and English, switchable at any time. | As the admin, I want to use the system in Arabic or English. | All interface text exists in both languages; Arabic renders fully right-to-left; the choice persists; data can be entered in either language. |
| 3 | **Mobile-friendly layout.** Responsive, laptop first. | As the admin, I want to handle urgent tasks from my phone. | Calendar, student lookup, and payment entry work on a 375px-wide screen without horizontal scrolling. |
| 4 | **Students.** Create, edit, search, archive. Fields: name, birth date, phone, parent name and phone, school, notes. Shows the student's balance and enrollments. | As the admin, I want a complete record and balance per student. | A student can be found by name or parent phone; the profile shows enrollments, remaining music sessions, and balance; archived students are hidden but kept. |
| 5 | **Teachers.** Name, phone, pay notes, active status. | As the admin, I want a record of each teacher and their agreed terms. | Teachers can be assigned to enrollments and calendar slots; pay notes are saved; teachers have no login. |
| 6 | **Subjects and prices.** One list for instruments and school subjects/agenda, each with a type (Music or Education), a monthly group price, a monthly one-on-one price (USD), and for music a default number of sessions per month. | As the admin, I want to set and change prices without a developer. | Subjects can be added and edited; prices changes do not alter existing enrollments. |
| 7 | **Grade levels and rates.** Grades with a price rate (for example Grade 3 = 1.2). | As the admin, I want grade-based pricing applied automatically. | Grades can be added and edited with a rate; rate changes do not alter existing enrollments. |
| 8 | **Enrollments.** A student enrolls in one subject as Music or Education, with teacher, group or one-on-one, start date, and optional discount. Education enrollments require a grade; music enrollments do not. | As the admin, I want each student's plan and price calculated correctly. | The monthly price is calculated by the pricing rules and saved; discount (percent or fixed) is applied to the charge; a student can have several enrollments, each with its own price and balance; enrollments can be paused or ended. |
| 9 | **Calendar and sessions.** Assign a student to a slot on a calendar with teacher, date, and time. | As the admin, I want to schedule lessons and track music sessions. | Assigning creates a session; music sessions used = sessions assigned in the calendar month; remaining = monthly allowance minus used, shown on the student; the count resets each month with no carry-over; deleting a slot returns the session; moving a slot keeps the count; group classes are several students in the same slot. |
| 10 | **Session and conflict warnings.** | As the admin, I want to avoid mistakes without being blocked. | A warning appears when a music student has no sessions left, or a teacher has overlapping slots, and the admin can override. |
| 11 | **Monthly charges.** One charge per active enrollment per month. | As the admin, I want what each student owes created automatically. | A charge equals the saved price minus any discount; the same month cannot be charged twice; charges can be voided. |
| 12 | **Payments.** Record a payment with method, currency, and date. | As the admin, I want to record what each parent pays. | Payments can be entered in USD or LBP; the exchange rate used and the USD value are saved; partial payments are allowed; mistakes are voided, never deleted. |
| 13 | **Balance.** Calculated per enrollment and per student. | As the admin, I want to see who owes what at any time. | Balance = charges − payments (excluding voided rows) in USD; the ledger history is visible per student. |
| 14 | **Exchange rate.** USD to LBP, updated manually. | As the admin, I want accurate totals in either currency. | Each payment and expense stores the rate in effect when recorded; changing the rate never changes past records. |
| 15 | **Expenses.** Rent, utilities, teacher pay, equipment, marketing, other. | As the admin, I want profit to reflect all costs. | Expenses can be added in USD or LBP with category and date; teacher pay is entered manually and may be linked to a teacher. |
| 16 | **Dashboard.** Revenue, expenses, profit, outstanding balances, revenue per subject and per teacher, active students; period filter; USD/LBP switch. | As the admin, I want the key numbers at a glance. | All metrics match the underlying records; revenue is based on payments received; the period filter and currency switch work. |
| 17 | **Reminders (admin only).** In-app alerts. | As the admin, I want to see what needs attention. | A panel lists students with outstanding balances and music students with few or no sessions left; nothing is sent to parents. |
| 18 | **PDF receipts.** Download a receipt for any payment. | As the admin, I want to give parents a receipt. | A PDF includes center name, student, amount, currency, method, date, and receipt number; works in Arabic and English. |
| 19 | **Excel export and backup.** One-click export of all data. | As the admin, I never want to lose my data. | The export contains all tables; the app reminds the admin if no export was made in 7 days; the hosted database is the source of truth. |
| 20 | **Deployment, environments, and backups (DevOps).** Hosting, CI/CD, secrets, database backups, monitoring. | As the team, we want a reliable, repeatable way to ship and recover. | Dev, staging, and production environments exist; each push is built and tested automatically; deployments to staging and production are repeatable; the database is backed up automatically and a restore has been tested; HTTPS only. |

---

## UX Design

- **Layout:** sidebar navigation on laptop, collapsible menu on phone. Main sections: Dashboard, Students, Calendar, Teachers, Subjects and Grades, Payments, Expenses, Settings.
- **Enrollment form:** the admin first chooses **Music** or **Education**. Music shows instrument, format, and session allowance. Education shows subject, grade, and format. The calculated monthly price is displayed before saving.
- **Calendar:** day and week views, with today's lessons as the mobile default. Assigning a student is a quick action from a slot.
- **Bilingual and RTL:** the whole layout mirrors in Arabic. Numbers, dates, and currency stay readable in both languages.
- **Warnings, not blocks:** session limit and teacher overlaps show a warning with an override.
- **Branding:** placeholder name, logo, and colors in v1, kept in one place so they can be swapped easily.

---

## Engineering Notes

- **Stack:** React, Prisma, PostgreSQL.
- **Database: 10 tables.** Student, Teacher, Subject, GradeLevel, Enrollment, Session, LedgerEntry, Expense, ExchangeRate, AdminUser. The schema is in `schema_v5.prisma`.
- **Enrollment** is one table with a type (Music or Education). The grade is empty for music.
- **Ledger:** every charge and payment is a `LedgerEntry`. Balance is calculated from it, never stored. Mistakes are voided with a date, not deleted.
- **Session counts** are calculated by counting `Session` rows in the calendar month, never stored.
- **Time zone:** month boundaries are calculated in Lebanon time.
- **Money:** stored as decimals, never floats. USD is the base currency; LBP payments store the rate used and the USD value.
- **Hosting:** free-tier managed PostgreSQL (for example Supabase or Neon) and a free app host, chosen by the team with DevOps. Free tiers can pause or cap storage, so Excel backups and automated database backups are required.
- **Security:** hashed passwords, TOTP-based 2FA, HTTPS only, secrets in environment variables, no sensitive data in logs.
- **Extensibility:** `AdminUser` is a real table so roles can be added later.

---

## Test Plan / Supported Environment

- **Environments:** local development, staging, and production.
- **Supported browsers:** latest Chrome, Safari, Edge, Firefox; mobile Safari and Chrome.
- **Testing approach:** manual test script per module; unit tests for price calculation, discounts, balance, and session counting; full Arabic/RTL walkthrough; mobile walkthrough on a real phone.
- **Review points:** client review with Abdullah Maatouk at the end of week 1 (13 Nov) and final acceptance at the end of week 2.
- **Data safety test:** export to Excel, verify contents, restore from a database backup, and check figures against a manual calculation.

---

## Key Performance Indicators

1. 100% of students, enrollments, and payments are recorded in the system.
2. Dashboard and balance figures match manual spot-checks.
3. Time to record a payment: under 30 seconds on laptop, under 1 minute on phone.
4. At least one successful Excel backup per week.
5. Zero data-loss incidents.

---

## Stretch Goals (next versions)

- Rooms and room double-booking warnings.
- Attendance tracking and make-up sessions.
- Recurring monthly expenses (rent set once).
- Automatic teacher pay calculation.
- Settings screen (center name, logo, defaults).
- Additional user roles (for example an assistant with no revenue access).
- Public landing page and online enrollment form.
- Events, workshops, and summer camps.
- Optional reminders to parents (WhatsApp, SMS, or email).

---

## Out of Scope (v1)

- Public website or marketing pages.
- Student, parent, and teacher accounts or logins.
- Online payment processing.
- Messages sent to parents or students.
- Per-session billing (every enrollment is a monthly plan).
- Installment schedules (partial payments are supported through the balance).
- Rooms and attendance tracking.
- Automatic teacher pay.
- Online (video) lessons.

---

## Assumptions

1. All subject prices are in USD. Payments can be made in USD or LBP at the manually set rate.
2. Every enrollment is a one-month plan that renews monthly.
3. One-on-one costs more than group, so each subject has two prices.
4. The grade rate applies to education subjects and agenda only, not to music.
5. A music session is used when the student is assigned in the calendar, even if they do not attend.
6. The monthly session allowance comes from the instrument's default and can be edited per student. It resets each month with no carry-over.
7. A student taking two subjects has two enrollments, each with its own price and balance.
8. The price is fixed when the student is enrolled and does not follow later price changes (an "apply new price" action may be added).
9. The app creates one charge per active enrollment per month. How and when this is triggered is to be confirmed.
10. Session limits and teacher overlaps warn but allow override.
11. Teachers do not log in. Teacher pay is entered manually as an expense.
12. The center name, logo, and colors will be provided later.

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Two developers at full capacity for 10 days | Delay or reduced polish | Build in priority order; freeze scope on day 1; flag slips by day 5; use buffer days; use DevOps spare capacity for QA support |
| Free-tier database limits or pausing | Downtime or storage cap | Automated backups; weekly Excel export; monitor usage; plan paid upgrade if needed |
| Price or session rules change mid-build | Rework | Rules live in Subject and GradeLevel data, not in code; price saved per enrollment |
| Arabic/RTL complexity | UI bugs | i18n and RTL from day one; test each screen in Arabic as built |
| Calendar and session counting errors | Wrong remaining sessions | Count from rows (never a stored counter); unit tests; month boundaries in Lebanon time |
| Balance or currency errors | Wrong revenue and balances | Store the rate on each payment; unit tests; manual cross-check |
| Single login holds sensitive data | Security exposure | 2FA, recovery codes, HTTPS, session expiry |

## Open Questions

- Birth date or plain age on the student record.
- How monthly charges are created (automatic on the 1st, or a button the admin presses).
- Final center name, logo, and colors.
- Hosting provider choice (Supabase, Neon, or other).
- Who is the Product Manager and Team Lead.

---

## Sign-off

| Role | Name | Date | Signature |
| --- | --- | --- | --- |
| Client (center owner) | Abdullah Maatouk |  |  |
| Team Lead | TBD |  |  |