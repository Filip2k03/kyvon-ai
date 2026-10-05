# Dependencies and upgrades

Audience: maintainers. Last inspected: 2026-09-13. Version strings below are declared ranges, not a replacement for resolved lockfile entries.

| Component | Declared version/source |
|---|---|
| Production Node | node:22-slim in both Dockerfiles |
| Chat Prisma/client/adapter | ^7.10.0 |
| Chat TypeScript | ^7.0.2 |
| Chat uWebSockets.js | GitHub tag v20.69.0 |
| Chat ioredis | ^5.11.1 |
| Chat security overrides | deepmerge-ts ^8.0.0, mysql2 ^3.23.1 |
| Meet mediasoup / client | ^3.26.0 / ^3.23.2 |
| Meet React | ^19.3.0 |
| Meet TypeScript / Vite | ^5.9.3 / ^7.3.6 |
| Desktop Electron | ^43.2.0 |
| Production DB / cache | postgres:16-alpine / redis:7-alpine |

Sources: [Chat manifest](../chat/package.json), [Meet manifest](../meet/package.json), [desktop manifest](../meet/desktop/package.json), [Chat lockfile](../chat/pnpm-lock.yaml), [Meet lockfile](../meet/pnpm-lock.yaml).

Updated 2026-09-14: both app manifests (packageManager and devEngines) and Dockerfiles now pin pnpm 11.18.0. Chat overrides live in pnpm-workspace.yaml because pnpm 11 ignores package.json pnpm.overrides. The default local pnpm remains 9.15.9; invoke the pinned version rather than silently using that binary. Local Node 26.8.1 differs from production Node 22. Container/runtime parity remains unverified.

Chat V2 candidate (2026-10-01): SAX 1.6.1 and @types/sax ^1.2.7 were added for bounded XLSX previews. `fast-uri` is overridden to 3.1.8 after the maintainer advisory/release review; production audit returned zero advisories after the patch. See [candidate evidence and override removal criterion](../chat/V2_RELEASE.md). The pnpm 11 lockfile contains two YAML documents; pnpm 9 cannot install it. Local dependency layout was repaired using pinned pnpm 11.18.0.

Upgrade protocol: inspect resolved version → read official release notes/security advisory → review breaking changes and runtime support → check source compatibility → update deliberately → test/typecheck/build → inspect lockfile → exercise runtime on deployment URL. Do not upgrade solely because a newer version exists. Overrides need explicit compatibility verification and removal criteria; Chat Prisma validation and unit tests do not exercise every Prisma CLI path.

Use `pnpm audit --prod --json` inside each app for production audit. Audit desktop/mobile separately; production-only audit does not cover all development tooling. Never suppress findings merely to obtain a green report.

Related: [upstream references](../.agent/references/upstream.md), [testing](testing.md), [release](release.md).
