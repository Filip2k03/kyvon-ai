# Codex / agent bootstrap — Reiwa GitLab companion

Applies to Codex, Claude, Cursor agents, AGY, and human contributors working in this workspace.

## Always start here

1. Read [AGENTS.md](AGENTS.md) (constitution).
2. Read [SKILLS.md](SKILLS.md) (task router / knowledge index).
3. Identify the subsystem: **Chat**, **Meet**, **server/VPS**, or **companion docs only**.
4. Read only the docs needed for that task (do not load every file).
5. Inspect executable source and tests in the affected nested repo.
6. Find an existing pattern; plan the **smallest correct** change.
7. Implement → validate → review diff → update docs that describe changed behavior → report.

This file is navigation + operating procedure. It does **not** replace AGENTS.md.

## Repositories (FACT)

| Path | What it is | Git |
|---|---|---|
| `chat/` | Reiwa Office Chat (Node/TS, uWebSockets, Prisma, Redis, static `public/index.html`) | Independent repo / gitlink → `gitlab…/Stephan_Filip/chat.git` |
| `meet/` | Reiwa Meet (mediasoup SFU, React/Vite, WebGL compositor) | Independent repo / gitlink → `gitlab…/Stephan_Filip/meet.git` |
| repo root | Companion workspace: docs, server notes, agent bootstrap | Separate remote (e.g. GitHub companion); **no** `.gitmodules` |
| `../reiwasakura.tech` | Marketing/site boundary | Out of scope unless the task says so |

Always `git status` in **both** the root and the nested app before editing. Preserve unrelated dirty files and deletions (including legacy KYVON removals).

## Skills map (what to read for which job)

| Skill / task | Open next | Do not invent |
|---|---|---|
| Orientation / architecture | [docs/architecture.md](docs/architecture.md), [docs/decisions.md](docs/decisions.md) | Fake ADRs |
| Chat messaging / API / media | [chat/docs/api.md](chat/docs/api.md) or [docs/api.md](docs/api.md), [chat/docs/MOSCOW.md](chat/docs/MOSCOW.md), [chat/src/server.ts](chat/src/server.ts) | New upload protocols without `/api/upload` |
| Chat finish board | [chat/docs/MOSCOW.md](chat/docs/MOSCOW.md) | “Pen-test passed” claims |
| Meet media / SFU | [docs/coding-standards.md](docs/coding-standards.md), `meet/shared/protocol.ts`, `meet/web/src/lib/session.ts` | P2P mesh, OBS, frame-rate React video |
| Security | [docs/security.md](docs/security.md), [chat/docs/security.md](chat/docs/security.md) | Logging secrets / env dumps |
| Develop / run locally | [docs/development.md](docs/development.md) | Root `package.json` (none) |
| Test / validate | [docs/testing.md](docs/testing.md) | Invented npm scripts |
| Deploy / release | [docs/deployment.md](docs/deployment.md), [docs/release.md](docs/release.md), `.agent/checklists/release.md` | Overwriting live TLS / nginx without auth |
| Ops incident | `.agent/runbooks/operations.md` | Silent production migrations |
| Patterns | `.agent/patterns/README.md` | Copy-paste without reading source |
| Freshness / drift | [docs/verification.md](docs/verification.md) | Promoting old SHAs to “current live” |

Installed Cursor/Claude product skills (hooks, PR tools, etc.) are separate. This repo’s “skills” are **knowledge routes** in SKILLS.md + `.agent/`, not a second product skill pack.

## Hard rules (agents)

- Source of truth order: executable code → tests → manifests/lockfiles → CI → upstream docs → repo docs → comments → assumptions.
- Label uncertainty: **FACT** · **INFERENCE** · **UNKNOWN** · **NEEDS HUMAN DECISION** · **TECHNICAL DEBT** · **SECURITY RISK**.
- Never print or commit secrets, tokens, private keys, or `.env` values.
- Report checks as **VERIFIED** / **NOT RUN** / **FAILED** / **BLOCKED** / **UNKNOWN** with command + working directory.
- Chat: keep Telegram-style media players, receipts, Giphy proxy (key server-side), paused Meet-style discipline where applicable.
- Meet: preserve mediasoup SFU, paused consumers, observer restrictions, WebGL compositor.
- Do not claim deployment success without executed evidence on the target host.
- Push/deploy only when the user asked (or the established release thread already authorized that step).

## Working directories and commands

```bash
# Chat
cd chat && pnpm test && pnpm build
node scripts/smoke-qa.mjs https://chat.reiwasakura.tech   # optional live smoke

# Meet
cd meet && pnpm test && pnpm typecheck && pnpm build

# VPS Chat deploy (operator)
ssh <vps> 'cd /opt/chat && git fetch && git checkout -B main origin/main && ./deploy/deploy.sh --no-pull'
```

Root has **no** application package manifest. Always `cd` into `chat/` or `meet/` first.

## Git protocol (companion + apps)

1. Commit inside the nested app repo first (`chat` or `meet`), push that remote.
2. Update the gitlink in the companion root if the pointer should move; commit **only** that pointer (and intentional docs), then push the companion remote.
3. Do not sweep unrelated KYVON deletions or mail/server WIP into the same commit unless the user explicitly requests that cleanup.

---

## Build status — what is done vs remaining

Last updated: **2026-10-06**. Live Chat target: `https://chat.reiwasakura.tech`. Detail board: [chat/docs/MOSCOW.md](chat/docs/MOSCOW.md).

### Done (shipped in Chat source + deployed this thread unless noted)

| Area | Status |
|---|---|
| Core Chat: auth, channels/DMs, threads, reactions, pins, presence status | Done |
| Authenticated attachments + Telegram-style voice/video clip UI | Done · live |
| Voice-mail / video-clip recorder (review before send, level/preview) | Done · live |
| Call ring UX + Accept identity fix (`voice-call.js`) | Done · live |
| Sent → Delivered → Seen receipts | Done · live |
| Giphy Stickers/GIFs picker (proxy `/api/giphy/*`, emoji as tab, portal decoration) | Done in source · **live UI**; Giphy results need `GIPHY_API_KEY` |
| Yamato AI (Ollama path), memory, learn/reactions, hubs, push | Done in source |
| E2EE voice calls | Code present · **gated OFF** until TURN gate |

### Remaining / blocked for “fully built”

| Item | Owner | Notes |
|---|---|---|
| Set production `GIPHY_API_KEY` and recreate Chat app container | **Human** | Placeholder line exists in VPS `.env`; without key, picker falls back to Emoji tab |
| TURN review + two-network QA → decide `ENABLE_E2EE_CALLS` | **Human** | See `chat/deploy/TURN.md` |
| Live browser E2E (two devices): call + file auth | Human / later | Unit tests ≠ device E2E |
| Real GitLab webhook secrets for labar/tapmi hubs | Operator | |
| Cookie-only sessions (drop localStorage bearer) | Debt | Partial cookie resume exists |
| Split `index.html` JS → hashed assets; tighten CSP (`unsafe-inline`) | Debt | |
| Disposable-DB Prisma access tests | Debt | |
| Companion root: large legacy KYVON file deletions still dirty | Human decision | Do not wipe without an explicit cleanup commit |
| Host nginx 301 / sudo TLS edits | **BLOCKED** historically | Needs interactive sudo |
| Meet: only touch when the task is Meet | — | Independent repo |

### Agent “done” checklist for a Chat feature

- [ ] Nested `chat` commit + push
- [ ] `pnpm test` + `pnpm build` VERIFIED
- [ ] Docs/MOSCOW/api updated if behavior changed
- [ ] Deploy evidence (`/opt/chat` SHA + health) if user asked to ship
- [ ] Companion gitlink updated only when intentional
- [ ] Remaining human gates listed (keys, TURN, sudo) — not claimed complete

Related: [SKILLS.md](SKILLS.md) · [AGENTS.md](AGENTS.md) · [docs/verification.md](docs/verification.md) · [chat/docs/MOSCOW.md](chat/docs/MOSCOW.md).
