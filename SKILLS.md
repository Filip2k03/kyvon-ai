# Engineering knowledge index (skills router)

This file is **repository knowledge**, not an installed Codex/Cursor skill package. Product skills (PR, hooks, etc.) live in the agent product; this file routes work inside Reiwa’s GitLab companion workspace.

**FACT:** Workspace = Chat + Meet + VPS/GitLab configuration docs. KYVON app trees were removed; do not restore them from prose. The sibling `../reiwasakura.tech` site is an integration boundary only.

## Agent entrypoints

| Entrypoint | Role |
|---|---|
| [AGENTS.md](AGENTS.md) | Constitution: safety, source-of-truth, validation vocabulary |
| [CODEX.md](CODEX.md) | Full Codex/agent bootstrap, skills map, **done vs remaining** build board |
| [CLAUDE.md](CLAUDE.md) | Claude-oriented pointer into AGENTS + SKILLS |
| This file | Task → doc → implementation table |

**Startup:** AGENTS.md → SKILLS.md → (for long agent sessions) CODEX.md status board → task docs → source.

## Task routing

| Task | Read next | Implementation |
|---|---|---|
| Orientation | [Architecture](docs/architecture.md), [decisions](docs/decisions.md), [CODEX status](CODEX.md) | [Human README](readme.md) |
| Chat finish / MoSCoW | [chat/docs/MOSCOW.md](chat/docs/MOSCOW.md) | `chat/public/index.html`, `chat/src/*` |
| Chat API / Giphy / uploads | [docs/api.md](docs/api.md), [chat/docs/api.md](chat/docs/api.md), [security](docs/security.md) | [Chat server](chat/src/server.ts), [giphy](chat/src/giphy.ts) |
| Chat media UX | MOSCOW + coding standards | Telegram players + clip recorder in `public/` |
| Database | [Database](docs/database.md) | [Prisma schema](chat/prisma/schema.prisma) |
| Meet UI/media | [Coding standards](docs/coding-standards.md), architecture | [Protocol](meet/shared/protocol.ts), [session](meet/web/src/lib/session.ts) |
| Installation/debugging | [Development](docs/development.md), [troubleshooting](docs/troubleshooting.md) | App manifests / Dockerfiles |
| Validation | [Testing](docs/testing.md) | `cd chat\|meet && pnpm test` |
| Dependencies | [Dependencies](docs/dependencies.md) | Manifests, lockfiles |
| Deployment/incident | [Deployment](docs/deployment.md), [operations](.agent/runbooks/operations.md) | `*/deploy/deploy.sh`, `server/` |
| Release/Git | [Release](docs/release.md), [release checklist](.agent/checklists/release.md) | Independent app repos + gitlinks |
| Automation | [CI/CD status](docs/ci-cd.md) | No active root pipeline (FACT) |
| Unknowns/drift | [Verification](docs/verification.md), [security](docs/security.md) | Source overrides prose |
| Patterns / change | [.agent/patterns](.agent/patterns/README.md), [.agent/checklists/change.md](.agent/checklists/change.md) | Copy patterns conceptually |

## Stack (short)

- **Chat:** Node/TypeScript, uWebSockets.js, Prisma/PostgreSQL, Redis Streams, static HTML/JS, optional Ollama AI, Giphy proxy (`GIPHY_API_KEY`), gated E2EE voice.
- **Meet:** Node HTTP/ws, mediasoup SFU, React/Vite/Tailwind, WebGL2 compositor (no P2P mesh).
- **Ops:** Bash, nginx, Docker Compose on shared VPS.

## Documentation map

[docs index](docs/README.md) · [Patterns](.agent/patterns/README.md) · [Runbooks](.agent/runbooks/operations.md) · [Change checklist](.agent/checklists/change.md) · [Upstream research](.agent/references/upstream.md).

## Snapshot note

Exact SHAs and validation evidence: [verification](docs/verification.md).  
Chat live build progress + remaining human gates: [CODEX.md](CODEX.md#build-status--what-is-done-vs-remaining).

Last inspected: 2026-10-06.
