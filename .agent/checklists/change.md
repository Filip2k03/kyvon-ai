# Change checklist

Audience: agents and reviewers. Last inspected: 2026-09-13.

- [ ] Read root and affected nested instructions; classify subsystem and uncertainty.
- [ ] Inspect source/tests and current root/child Git changes.
- [ ] Plan smallest change using a [proven pattern](../patterns/README.md).
- [ ] Check authorization, input/output boundaries and secrets.
- [ ] Implement without unrelated edits or generated-file hand changes.
- [ ] Run available proportional format/lint/typecheck/test/build checks; mark absent checks NOT RUN.
- [ ] Review diff and update affected docs/links.
- [ ] Report VERIFIED/FAILED/BLOCKED/NOT RUN/UNKNOWN with exact evidence.
- [ ] For dependency upgrades: official release notes, breaking changes, runtime support, lockfile and deployed behavior reviewed.

Related: [AGENTS](../../AGENTS.md), [security](../../docs/security.md).
