# Repository rules for coding agents

Maintain Reiwa Sakura's GitLab companion workspace: Chat, Meet, and VPS configuration. This applies to Codex, Claude, AGY, IDE agents, automation, and human contributors. It describes the current working tree, not the removed KYVON application.

## Startup and change protocol

START → Read AGENTS.md → Read [SKILLS.md](SKILLS.md) → Identify task subsystem → Read relevant documentation → Inspect implementation → Inspect tests → Find existing pattern → Plan smallest correct change → Implement → Validate → Review diff → Update documentation → Report results.

Use task-scoped reading; do not load every document. Follow applicable nested instructions after these rules. If instructions conflict with executable behavior, investigate and record the discrepancy; do not silently refactor to match prose.

## Source of truth

In descending order: executable source/configuration; tests; package manifests and lockfiles; CI/CD configuration; official upstream project documentation; repository documentation; comments; agent assumptions. A configured control is not proof of a live control.

Classify uncertainty as **FACT**, **INFERENCE**, **UNKNOWN**, **NEEDS HUMAN DECISION**, **TECHNICAL DEBT**, or **SECURITY RISK**. Never promote an assumption to fact.

## Mandatory safety and engineering rules

- Inspect Git status in the root and affected nested repository. Preserve unrelated changes and deletions. Chat and Meet are independent Git repositories represented by gitlinks; no .gitmodules file exists.
- Read [coding standards](docs/coding-standards.md) and copy established patterns conceptually. Keep strict TypeScript; validate untrusted values at boundaries.
- Preserve mediasoup SFU routing, paused consumer startup, observer restrictions, and the WebGL compositor. Do not introduce P2P mesh or frame-rate React updates.
- Never print or commit secrets, environment values, tokens, private keys, credentials, or sensitive logs. Follow [security](docs/security.md).
- Use exact paths, quote shell arguments, and avoid destructive resets, broad deletes, implicit production migrations, or replacing live TLS configuration.
- An implementation request does not authorize unrelated deployment, messaging, or infrastructure changes. Inspect the requested scope before external writes.
- Validate proportionally: READ → UNDERSTAND → LOCATE EXISTING PATTERN → PLAN → IMPLEMENT → FORMAT → LINT → TYPECHECK → TEST → BUILD → REVIEW DIFF → UPDATE DOCS. Omit unavailable checks explicitly; do not invent scripts.
- Preserve package-manager/lockfile compatibility. Important upgrades require official release notes, breaking-change review, tests, build, lockfile review, and runtime validation.
- Never claim success without execution evidence. Report checks as **VERIFIED**, **NOT RUN**, **FAILED**, **BLOCKED**, or **UNKNOWN**, including command, working directory, and relevant limitations.
- Update documentation that describes changed behavior. Never fabricate reviews, architecture decisions, release history, test coverage, or deployment success.

## Navigation and freshness

[Knowledge index](SKILLS.md) · [Architecture](docs/architecture.md) · [Development](docs/development.md) · [Testing](docs/testing.md) · [Deployment](docs/deployment.md) · [Release](docs/release.md).

Last inspected: 2026-09-13. Commit identities, dirty-tree caveats, and validation evidence are maintained in [verification](docs/verification.md).
