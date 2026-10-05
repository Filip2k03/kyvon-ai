# Engineering knowledge index

This file is repository knowledge, not an installed Codex skill package.

**FACT:** This workspace coordinates Chat, Meet, and VPS/GitLab configuration. The separate ../reiwasakura.tech website is an integration boundary, not a root workspace package.

## Task routing

| Task | Read next | Implementation |
|---|---|---|
| Orientation | [Architecture](docs/architecture.md), [decisions](docs/decisions.md) | [Human README](readme.md) |
| Installation/debugging | [Development](docs/development.md), [troubleshooting](docs/troubleshooting.md) | App manifests and Dockerfiles |
| Chat/API | [API](docs/api.md), [security](docs/security.md), [patterns](.agent/patterns/README.md) | [Chat server](chat/src/server.ts) |
| Database | [Database](docs/database.md), [security](docs/security.md) | [Prisma schema](chat/prisma/schema.prisma) |
| Meet UI/media | [Coding standards](docs/coding-standards.md), [architecture](docs/architecture.md) | [Protocol](meet/shared/protocol.ts), [session](meet/web/src/lib/session.ts) |
| Validation | [Testing](docs/testing.md) | App package scripts |
| Dependencies | [Dependencies](docs/dependencies.md) | Manifests, lockfiles |
| Deployment/incident | [Deployment](docs/deployment.md), [operations runbook](.agent/runbooks/operations.md) | App deploy scripts, server nginx |
| Release/Git | [Release](docs/release.md), [release checklist](.agent/checklists/release.md) | Independent app repositories |
| Automation | [CI/CD status](docs/ci-cd.md) | No active pipeline found |
| Unknowns/drift | [Verification](docs/verification.md), [security risks](docs/security.md) | Source overrides prose |

Stack: Node/TypeScript; Chat uWebSockets.js, Prisma/PostgreSQL, Redis Streams, static HTML; Meet Node HTTP/ws, mediasoup, React/Vite/Tailwind, WebGL2; Electron desktop and Android TWA auxiliary clients. Bash, nginx and Docker Compose operate deployments.

## Documentation map

[docs index](docs/README.md) owns the deep-document map. [Patterns](.agent/patterns/README.md) identify proven source examples; [runbooks](.agent/runbooks/operations.md) describe operations; [change checklist](.agent/checklists/change.md) covers implementation; [references](.agent/references/upstream.md) routes upstream research.

Last inspected: 2026-09-13. Exact snapshot: [verification](docs/verification.md).
