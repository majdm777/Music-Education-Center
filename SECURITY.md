# Security Policy

## Reporting a vulnerability

**Do not open a public issue for a security problem.** Public issues are visible to
everyone immediately, including anyone who might exploit the report.

Use GitHub's private vulnerability reporting:

1. Open <https://github.com/majdm777/Music-Education-Center/security/advisories/new>.
2. Describe the issue, the affected area, and the steps to reproduce it.
3. If you have a suggested fix, include it.

If private reporting is unavailable, email the maintainers at
[mirnaderbieh1@gmail.com](mailto:mirnaderbieh1@gmail.com). This address is public,
so prefer the GitHub form above when it works. Do not include exploit details in a
public issue.

## What to include

- Affected component or file.
- Impact: data exposure, privilege escalation, financial manipulation, denial of service.
- Reproduction steps or a proof of concept.
- Whether the issue is already public.

## Response expectations

- Acknowledgment within 3 working days.
- A triage decision and severity within 5 working days.
- A fix or mitigation plan for confirmed high-severity issues as soon as practical.

Please give the team reasonable time to fix the issue before disclosing it publicly.

## Scope

In scope:

- Authentication, session handling, and TOTP.
- Authorization and access to student, payment, and financial data.
- Injection, broken access control, and unsafe deserialization.
- Secret exposure in the repository, CI logs, or the client bundle.
- Database constraints that can be bypassed through the API.

Out of scope:

- Reports that require a compromised administrator device.
- Missing hardening headers with no demonstrated impact.
- Automated scanner output with no reproduction steps.
- Denial of service through unrealistic request volumes.

## Secrets

This repository is public. Never commit `.env` files, database URLs with
credentials, JWT secrets, TOTP encryption keys, or API tokens. If a secret is
committed, assume it is compromised, rotate it, and then remove it from history.

## Supported versions

The project is pre-release. Only the latest commit on `main` is supported.
