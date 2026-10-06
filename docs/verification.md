# Verification, freshness and drift

Last inspected: 2026-09-13. Audience: maintainers checking the trust and scope of this documentation.

## Snapshot

## Follow-up implementation — 2026-09-14

- Both manifests and Dockerfiles now pin pnpm 11.18.0; Chat overrides moved to pnpm-workspace.yaml because pnpm 11 ignores the package.json override field.
- VERIFIED: pinned pnpm frozen lockfile-only checks with dependency scripts disabled passed for Chat (230 entries) and Meet (189 entries). These checks do not prove a fresh dependency installation or container build.
- Meet deployment smoke check now sends PUBLIC_ORIGIN using the ws client. Shell syntax is VERIFIED; live handshake is NOT RUN.
- VERIFIED: both TypeScript checks, Chat's 5 tests, Meet's 15 tests, and Meet Vite build passed using installed tools.
- BLOCKED: local Docker image builds; Docker daemon unavailable even after the authorized socket-access retry.
- Chat UI now provides safe-path image/MP4 previews, zoom, original-name blob downloads, download errors/timeouts, custom SVG action icons and channel-stable upload targeting. Inline JavaScript syntax and Chat typecheck/tests are VERIFIED; deployment-URL browser interaction is NOT RUN.
- Existing public attachment retrieval remains a security risk; these UI changes do not introduce authenticated file delivery.

## Chat Parity & MCP Implementation — 2026-09-23

- Message Threads: Added `parentId` and `replyCount` to Prisma schema and migration `20260923120000_threads_and_user_status`. Backend delivers thread messages and broadcasts parent reply counts. Frontend includes a dedicated slide-out drawer with thread composer, attachment handling, and reply count chips.
- User Presence Statuses: Added `statusEmoji` and `statusText` to User schema. Implemented `/api/status` endpoint and status update broadcasts with instant emoji picker and preset status choices.
- MCP (Model Context Protocol) Bot Assistants: Integrated autonomous bot runner with `/ai`, `@Yamato AI`, `@bot`, `/gitlab`, `/poll`, and `/remind` commands. Tools include `system_status`, `calculate`, `thread_summary`, `gitlab_status`, `create_poll`, and `set_reminder`.
- Slack-grade UI/UX enhancements: Syntax-highlighted code fences (JS/TS, Python, SQL, Shell, HTML/CSS), inline markdown badges, Quick Switcher omnibox (`Cmd+K` / `Ctrl+K`), in-memory unsent draft preservation with sidebar pencil badges (`✏️`), saved items (`⭐`), channel details & member rosters, audio notification tones, and drag-and-drop / screenshot paste uploads.
- VERIFIED: Chat TypeScript strict check (`pnpm run typecheck`) passed with 0 errors.
- VERIFIED: Chat unit test suite (`tsx --test src/*.test.ts`) expanded from 5 to 13 tests, all 13 passed (`13 pass, 0 fail`).
- VERIFIED: Client JavaScript inline syntax validated without syntax errors.
- NOT RUN: Remote production container deployment on VPS (`chat.reiwasakura.tech`). Deployment script (`chat/deploy/deploy.sh`) and migration steps prepared for authorized operator execution.

## Meet V2 Refinement & Live VPS Deployment — 2026-10-06

- Codebase Commit: `bcb6af7` on `main` branch (pushed to `gitlab.reiwasakura.tech:Stephan_Filip/meet.git`).
- Mobile & UI/UX Parity: Touch dismissal buttons on all floating panels, iOS Safari auto-zoom prevention via responsive text (`text-base sm:text-sm`), responsive lobby gutters, dynamic participant badge count chip on control bar, audio metering throttling (~12Hz) to prevent 60fps render thrash, and pre-meeting camera hardware light toggle sync.
- Zero-OBS Architecture: Verified native browser WebGL2 compositor, MediaPipe background blur/swapping, and Mediasoup SFU with no OBS or virtual camera dependencies.
- VERIFIED: Local typecheck (`pnpm --dir meet typecheck`), unit tests (`pnpm --dir meet test` with 27/27 pass), production build (`pnpm --dir meet build` in 1.11s), and `git diff --check`.
- VERIFIED: Live VPS container deployment on `187.127.110.32` in `/opt/meet` via `docker compose -f docker-compose.prod.yml up -d --build`. Container `meet-meet-1` restarted and status reported `healthy`.
- VERIFIED: Local VPS health check `http://127.0.0.1:3200/healthz` (`{"ok":true,"rooms":0,"peers":0}`).
- VERIFIED: Public production HTTPS endpoint `https://meet.reiwasakura.tech/` (HTTP 200 OK, serving new production Vite asset hashes `index-CWgHsn7q.js` and `index-bRSCNc_L.css`).
- VERIFIED: Public WebSocket signaling upgrade `https://meet.reiwasakura.tech/ws` (HTTP 101 Switching Protocols with verified origin).

### Original documentation snapshot

| Repository | HEAD inspected |
|---|---|
| Root | a148aea0f060994f337fde798724dae778b0c72f |
| Chat | 3f5d8d4ddf7c0a7cab662783b40482b0649fbe26 |
| Meet | 356b4c4493b28d98fa6899506eff3ba3e6025215 |

All three trees already had uncommitted changes. These hashes identify the base, not a complete immutable snapshot of inspected behavior. Documentation describes the current files including prior security/build changes. The sibling website is out of scope for this documentation change.

## Executed validation

| Status | Directory / command | Result and limit |
|---|---|---|
| VERIFIED | chat: pnpm typecheck | exit 0 |
| VERIFIED | chat: node --import tsx --test src/*.test.ts | 5 tests pass; same test files as package script |
| VERIFIED | meet: pnpm typecheck | both TypeScript projects pass |
| VERIFIED | meet: node --import tsx --test src/*.test.ts | 15 tests pass |
| VERIFIED | meet: pnpm build | Vite production build passes |
| VERIFIED | root: bash -n chat/deploy/deploy.sh meet/deploy/deploy.sh server/setup-nginx-ssl.sh | shell syntax only |
| VERIFIED | root: node .agent/references/validate-docs.mjs | 29 maintained Markdown files; 215 local links; balanced fences; no matched credential patterns |
| VERIFIED | scoped git diff --check in root/Chat/Meet | documentation changes pass whitespace checks |
| FAILED | root: unrestricted git diff --check | existing trailing whitespace in unrelated server notes; preserved rather than changed |
| NOT RUN | dependency installation/audit | not rerun for documentation-only task; earlier session evidence is not a fresh audit |
| NOT RUN | Docker builds, migrations, live deployment, media E2E | documentation work does not establish these outcomes |
| UNKNOWN | GitLab/host administrative security state | previous SSH could reach host, but sudo checks required a password |

Local tools observed: Node v26.8.1 and pnpm 9.15.9. See [dependency drift](dependencies.md). Build/typecheck success here is not production-runtime parity.

## Drift found and disposition

- Root legacy application files and CI are deleted. New docs describe Chat/Meet/server; no legacy application or pipeline was restored.
- Root tracks gitlinks but has no .gitmodules. Fresh clone behavior remains unresolved.
- Existing generic Chat guidance describes Redis Pub/Sub, while Broker implements Redis Streams. Architecture docs reference the implementation.
- Meet's old agent file was a malformed fenced document and referenced an absent native virtual-camera addon. The replacement keeps the implemented SFU/compositor/observer constraints without inventing a native subsystem.
- Old Meet styling prose says no inline styles, while the implementation uses CSS and style properties. Standards now distinguish observed code from constraints on new work.
- Both package manager declarations/Dockerfiles differ from the observed local manager. This remains technical debt, not silently fixed by documentation.
- Meet deploy WS smoke omits Origin, conflicting with production upgrade policy. Operational docs flag this blocker.
- Chat /readyz returns static readiness, uploaded files are publicly retrievable, and Meet sessions are volatile. No stronger guarantees are claimed.

## Chat portal + Giphy — 2026-10-06

- Chat commits pushed on `main` include Telegram media UI, receipts, call Accept fix, Giphy sticker proxy (`9014a74` + follow-up hardening for Giphy download bounds / sticker send target lock).
- VERIFIED: `cd chat && pnpm test` (123 pass) and `pnpm build`.
- VERIFIED: VPS deploy `/opt/chat` healthy on `127.0.0.1:3100`; public HTML serves sticker modal / `composerStickerBtn`.
- FACT: production `GIPHY_API_KEY` was empty at deploy time — sticker UI is live; Giphy search returns empty/configured=false until operator sets the key and recreates the app container.
- Agent docs expanded: [CODEX.md](../CODEX.md) (skills map + done/remaining), [SKILLS.md](../SKILLS.md), [AGENTS.md](../AGENTS.md), [CLAUDE.md](../CLAUDE.md).
- Remaining human gates summarized in CODEX.md: Giphy key, TURN/`ENABLE_E2EE_CALLS`, E2E call QA, hub secrets, companion KYVON cleanup commit, sudo nginx.

## Known unknowns / human decisions

Backup/restore schedule, RPO/RTO, live GitLab version and patch policy, TURN availability, staging URL, release owner, registry/signing provenance, branching/tag conventions, protected pipeline secrets, and whether private uploads require authorization.

## New-agent self-test

Starting at AGENTS → SKILLS discovers project/stack/architecture, install/develop commands, coding patterns, tests/build, security prohibitions, deployment/release, runbooks and decisions. Unknown operational facts route to explicit entries above rather than invented commands. Related links provide navigation, not recursive reading requirements.

Related: [documentation index](README.md), [security](security.md), [release](release.md).
