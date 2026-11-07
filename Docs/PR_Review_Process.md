# Pull Request Review Process

This document defines how every pull request is reviewed in this repository. It
applies to human reviewers, CodeRabbit, and SonarQube Cloud. If a review does not
follow this process, it is incomplete.

## Review layers

Every pull request gets three independent checks. They are complementary, not
interchangeable.

| Layer | Tool | What it catches | Blocking |
| --- | --- | --- | --- |
| LLM review | CodeRabbit | Logic errors, missing tests, architectural drift, unclear code, security smells, rule violations | Advisory for the first two weeks, then reviewed |
| Static analysis | SonarQube Cloud | Bugs, code smells, duplication, coverage on new code, security hotspots, quality gate | Yes, once the check is required |
| Human review | A teammate | Product correctness, trade-offs, database guarantees, whether the change should exist at all | Yes, one approval required |

CI also enforces formatting, linting, types, unit tests, build, migrations, seed,
database verification, drift, integration tests, and a production dependency audit.

Configuration lives in:

- [`.coderabbit.yaml`](../.coderabbit.yaml)
- [`sonar-project.properties`](../sonar-project.properties)
- [`.github/workflows/ci.yml`](workflows/ci.yml)
- [`.github/CODEOWNERS`](CODEOWNERS)
- [`.github/pull_request_template.md`](pull_request_template.md)

## Required review format

Every review must contain these six sections, in this order, even when a section
is empty. Write "None." rather than omitting a section.

### 1. Summary

One short paragraph: what the pull request does, whether it matches its stated
scope, and the overall quality. State the number of files and the merge base when
useful.

### 2. Critical Issues

Problems that block merge. Anything that can corrupt data, break a core flow,
contradict the PRD, break the build or deploy, or bypass a database guarantee.

### 3. Security Findings

Authentication, authorization, secrets, injection, unsafe input, exposed data,
missing headers, dependency risk, and anything that weakens a production guard.

### 4. Maintainability Issues

Architecture, naming, duplication, missing tests, unclear error handling, silent
fallbacks, and code that will be expensive to change later.

### 5. Suggested Improvements

Concrete, optional improvements. Keep them actionable. Do not pad this section
with style preferences that Prettier or ESLint already enforce.

### 6. Approval Recommendation

One of:

- **Approve** — ready to merge.
- **Approve with follow-ups** — merge after the listed Blocker/Critical issues are
  fixed; Major and Minor items may become tracked follow-up issues.
- **Request changes** — do not merge until the listed issues are fixed.

Name the blocking issues explicitly.

## Issue format

Every issue, in every section, must include four things:

1. **Why it is a problem** — the consequence, not a restatement of the code.
2. **Affected code** — `path/to/file.ts:line` and the relevant snippet.
3. **Recommended fix** — the smallest correct change.
4. **Severity** — Blocker, Critical, Major, or Minor.

Example:

> **Critical — charge uniqueness can race**
> *Why:* two concurrent requests can both pass the application check and create
> two active charges for the same enrollment and month. Balances then double-count.
> *Code:* `apps/api/src/charges/charges.service.ts:42`
> *Fix:* rely on the partial unique index and translate the unique violation into
> a 409 instead of pre-checking in application code.
> *Severity:* Critical

## Severity definitions

### Blocker

- Data loss, corruption, or a financial miscalculation that can reach production.
- A security hole: exposed secret, missing authorization, injection, credential leak.
- The build, migration, seed, or deploy fails.
- A change that contradicts the PRD or schema without an approved decision.

Fix before merge. No exceptions.

### Critical

- Wrong behaviour in a core flow: enrollments, charges, payments, refunds, balances,
  revenue, expenses, or exchange rate.
- A business rule that exists only in application code but can be bypassed.
- A missing test for a new database invariant.
- An unhandled error path that leaves data half-written.

Fix before merge.

### Major

- A design choice that will cause rework soon.
- Missing validation on a public or mutating endpoint.
- Duplication or coupling that makes the next feature harder.
- Incomplete documentation for a behaviour change.

Fix, or open a tracked follow-up issue that the reviewer approves. A Major item
must not be silently dropped.

### Minor

- Naming, readability, small refactors, local simplification.
- Documentation wording, comments that restate code.

Optional. Do not block a merge on Minor items.

## What to prioritise

Review in this order:

1. Correctness — does it do what the PRD says, including edge cases?
2. Architecture — does it fit the existing boundaries and data model?
3. Security — can it be abused or leak data?
4. Scalability — will it still work with the real data volume?
5. Performance — only where it changes user experience or cost.
6. Readability — only where it harms comprehension.

Formatting is not a review topic. Prettier and ESLint own it. Mention formatting
only when it hides a bug or makes code genuinely hard to read.

## Project principles to enforce

- Prefer database-enforced guarantees over application assumptions.
- Prefer automated validation and tests over manual process.
- Prefer fail-fast behaviour over silent fallbacks and clamping.
- Keep the design simple and pragmatic.
- Do not introduce repository pattern, CQRS, event sourcing, microservices,
  premature optimization, or major framework upgrades without an approved decision.
- Keep `groupPrice` and `oneOnOnePrice` per subject. There is no `teachType`,
  base price, ratio, or multiplier.
- Refunds are standalone `REFUND` rows capped at non-voided payments minus prior
  refunds.
- Revenue attribution uses `Enrollment.teacherId`; the session teacher is
  delivery-only.
- Balance, revenue, profit, and remaining sessions are computed from rows and
  never stored.

## Workflow

1. **Author opens the pull request.** Fill in the template, link the plan item,
   and state how to test.
2. **Automated checks run.** Format, lint, types, tests, build, database, Sonar,
   and CodeRabbit.
3. **Author fixes failures** before requesting a human review. Do not ask a
   reviewer to debug a red pipeline.
4. **Reviewer writes the six-section review.** Read the diff, not only the
   summary. Run the branch locally for anything touching money, dates, or
   migrations.
5. **Author responds to every issue.** Fix it, or explain with a concrete reason
   why it should not change. Resolve the conversation only after the reviewer
   agrees.
6. **Re-run checks.** Any new commit dismisses stale approvals.
7. **Merge with squash.** One pull request becomes one commit on the base branch.

## Merge gates

A pull request may merge only when all of these are true:

- At least one human approval.
- All required status checks pass.
- The branch is up to date with the base branch.
- Every review conversation is resolved.
- No Blocker or Critical issue remains open.

Required checks:

- `Format, lint, types, tests, build`
- `Apply migration, seed, health check`
- `SonarCloud Code Analysis`

`CodeRabbit` is advisory during the first two weeks. After the team tunes the
configuration, it can be added as a required check.

Branch protection for `main` and `initial-setup` blocks direct pushes, force
pushes, and deletion. Direct pushes are not a shortcut; they are a review failure.

## Reviewing database changes

Database changes need extra scrutiny because they are the hardest to reverse.

- Does the migration apply cleanly to an empty database and to seeded data?
- Does it lock or rewrite a large table? At this scale that is unlikely, but say so.
- Is every new rule enforced by a CHECK, unique index, foreign key, or trigger?
- Is a partial unique index still correct after the change?
- Did `apps/api/prisma/verify.ts` gain an assertion for the new invariant?
- Did `apps/api/test/integration/database-invariants.test.ts` gain a test that
  fails without the migration?
- Is `Docs/schema.md` updated?
- Does `pnpm db:drift` still pass?

## Reviewing security

- No secret, token, key, or real personal data in the diff or history.
- Production environment guards fail fast; no placeholder can reach production.
- Every mutating endpoint has authentication and the correct authorization.
- Input is validated at the boundary with Zod or class-validator.
- Errors do not leak stack traces, SQL, or internal identifiers.
- New dependencies are necessary, maintained, and free of known high-severity
  advisories (`pnpm audit --prod`).
- Browser code does not import server-only modules or secrets.

## Reviewing tests

- A test must fail when the behaviour it covers breaks.
- Tests assert outcomes and invariants, not private implementation details.
- Database invariants are tested against PostgreSQL, not mocked.
- Money tests use `Decimal` and assert rounding, not floating-point approximations.
- A new rule without a test is a Critical issue.

## AI review limitations

CodeRabbit and SonarQube Cloud are useful but not authoritative.

- CodeRabbit can miss cross-file consequences and can over-report style.
- SonarQube Cloud measures what it can see; it cannot know the PRD.
- Neither tool can approve a pull request.
- If a tool flags something that contradicts an approved decision, say so in the
  review instead of changing the decision to satisfy the tool.

A human reviewer is responsible for the final approval, including anything the
tools missed.

## Escalation

If a Blocker or Critical issue is disputed, the repository owner (`@majdm777`)
decides. Record the decision in the pull request or in `Docs/project_spec.md` so
the next review does not reopen it.

If a required check is broken or flaky, fix the check. Do not bypass the merge
gate.
