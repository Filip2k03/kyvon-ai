# Development

Audience: an engineer preparing a checkout. Last inspected: 2026-09-13; [verification](verification.md).

## Prerequisites and installation

Use Node 22 matching the app Dockerfiles (Prisma requires a sufficiently recent Node 22 patch). A local Node 26 run does not prove Node 22 compatibility. Docker/Compose is required for containerized dependencies. Meet native worker installation may require Python and build tools, as installed by its Dockerfile.

Both apps now pin pnpm 11.18.0 in Dockerfiles and both manifest declarations (updated 2026-09-14). The default local binary observed is still 9.15.9; use the pinned version. Lockfiles use lockfileVersion 9. Do not regenerate with an arbitrary manager. Chat's security overrides are in pnpm-workspace.yaml for pnpm 11 compatibility.

Installation command present in both Dockerfiles, source-verified but not rerun for this documentation change: run `pnpm install --frozen-lockfile` inside the app. Chat also runs `pnpm exec prisma generate`; its [Prisma config](../chat/prisma.config.ts) requires DATABASE_URL. Never paste a real connection string into documentation or logs.

Create private environment configuration from the app's example, without overwriting an existing file: [Chat example](../chat/.env.example), [Meet example](../meet/.env.example). Chat needs DATABASE_URL and REDIS_URL, plus INITIAL_CEO_PASSWORD and INITIAL_CTO_PASSWORD if bootstrap users are absent. Production Compose requires those bootstrap variables even when users already exist. Optional VAPID values enable push. Meet requires a correct ANNOUNCED_IP for external media; configure Chat origin and admin gate intentionally.

## Repository-defined commands

Run from the named directory. Definitions verified in manifests; long-running servers were NOT RUN during this documentation task.

| Directory | Command | Purpose |
|---|---|---|
| chat | pnpm dev | tsx watch server |
| chat | pnpm start | tsx server |
| chat | pnpm typecheck | strict no-emit TypeScript |
| chat | pnpm test | Node test runner through tsx |
| meet | pnpm dev | signaling/SFU watcher |
| meet | pnpm dev:client | Vite client |
| meet | pnpm start | signaling/SFU server |
| meet | pnpm typecheck | server/shared and web TypeScript |
| meet | pnpm test | Node test runner through tsx |
| meet | pnpm build | Vite writes meet/public; empties output directory |

Chat has no build/lint/format script. Do not invent one. Chat's development Compose exposes database/cache ports on all interfaces with development credentials; never deploy it to production.

Meet Vite currently proxies /ws only, not HTTP /api routes. Secure cookie/origin behavior needs deployment-URL testing; a local UI rendering is insufficient. Respect the user's deployment-only browser testing preference.

Workflow: inspect status → select subsystem → read its instructions → locate source/test pattern → edit → run [appropriate checks](testing.md) → review diff. Generated Prisma output and Meet public output are not hand-edited.
