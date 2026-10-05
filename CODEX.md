# Codex bootstrap

1. Read [AGENTS.md](AGENTS.md).
2. Read [SKILLS.md](SKILLS.md).
3. Determine the affected subsystem and repository.
4. Read relevant documentation.
5. Inspect source and tests.
6. Find existing patterns.
7. Plan the smallest correct change.
8. Implement.
9. Validate.
10. Review the diff in each affected repository.
11. Update documentation and report results.

Use explicit working directories and repository-defined commands. Prefer rg for discovery and apply_patch for edits. Quote shell arguments; never treat JSON encoding as shell escaping. Avoid destructive Git commands and commands that dump environment values. A sandbox denial is a blocked command, not evidence of a code defect; use the product approval mechanism when required.

For incomplete requirements, proceed with reversible work supported by evidence and label assumptions. Ask only for material choices that cannot be inferred. Report each failed command with its directory, failure category, and whether a retry resolved it. Final reports identify behavior changed, validation results, outstanding risks, and deployment status.

Related: [testing](docs/testing.md), [release](docs/release.md).
Last inspected: 2026-09-13; snapshot: [verification](docs/verification.md).
