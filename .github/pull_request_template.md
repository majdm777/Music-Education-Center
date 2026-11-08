## Summary

<!-- What does this PR change, and why? Link the plan item or issue. -->

- Plan item:
- Related issue:

## Type of change

- [ ] Feature
- [ ] Bug fix
- [ ] Database schema or migration
- [ ] Refactor
- [ ] Documentation or tooling
- [ ] Dependency update

## How to test

<!-- Exact commands and manual steps a reviewer can run. -->

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
```

## Database changes

- [ ] No schema or migration change
- [ ] Migration added and `pnpm db:verify` / `pnpm db:drift` pass
- [ ] Integration tests cover the new invariant
- [ ] `Docs/schema.md` updated

## Author checklist

- [ ] The change is scoped to the linked plan item.
- [ ] New business rules are enforced by the database where possible.
- [ ] New behaviour has a test that fails without the change.
- [ ] No secret, credential, or real personal data is included.
- [ ] Production failure modes fail fast; no silent fallback was added.
- [ ] README or Docs updated when behaviour, scripts, or setup changed.

## Review

Reviewers and AI tools must follow [`Docs/PR_Review_Process.md`](../Docs/PR_Review_Process.md)
and post the six required sections:

1. Summary
2. Critical Issues
3. Security Findings
4. Maintainability Issues
5. Suggested Improvements
6. Approval Recommendation

Every issue must state why it is a problem, show the affected code, recommend a
fix, and carry a Blocker / Critical / Major / Minor severity.

- [ ] CodeRabbit review completed
- [ ] SonarQube Cloud quality gate passed
- [ ] Human review completed with the six sections
