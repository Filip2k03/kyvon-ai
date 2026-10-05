# Testing and validation

Audience: implementers/release engineers. Last inspected: 2026-09-13; executed results live in [verification](verification.md).

| Directory | Defined check | Scope |
|---|---|---|
| chat | pnpm typecheck | server/generated Prisma type compatibility |
| chat | pnpm test | src/*.test.ts: auth, MCP, attachments, spreadsheets, calls and crypto/worker helpers |
| chat | pnpm build | compiled server/worker and browser JavaScript syntax; not a Docker or device test |
| meet | pnpm typecheck | server/shared and client |
| meet | pnpm test | src/*.test.ts: support, location, hardening, logging |
| meet | pnpm build | Vite production client bundle |

Both test scripts use tsx --test. The equivalent diagnostic invocation `node --import tsx --test src/*.test.ts` runs the same Node test files without the tsx CLI IPC listener, useful when sandbox policy blocks that pipe. It is not a package script.

FACT: no dedicated integration/E2E suite, coverage threshold, root lint, or formatting script was found. Existing tests use node:test and assertions; support tests inject callbacks/time/provider state instead of connecting to a real desktop. Do not describe these as browser or media validation.

For authentication changes, add denial, malformed input, role, expiry and revocation checks proportional to risk. Database changes need disposable-database migration and query verification; these are not covered by current unit tests. Media changes need two-client produce/consume/resume, reconnect, observer restrictions and stage composition on an authorized deployment URL.

Source-defined deployment smoke checks: Chat /healthz at localhost:3100, Meet /healthz at localhost:3200 plus WS connection. Meet's smoke client uses the ws package and sends PUBLIC_ORIGIN from the container environment. Missing configuration, handshake errors and timeouts fail the check. The live handshake still needs deployment validation; server origin enforcement is unchanged.

Markdown/link validation: [documentation validator](../.agent/references/validate-docs.mjs) checks the maintained graph's local file links, fragments, fences and secret-like patterns. Run `node .agent/references/validate-docs.mjs` from the root. It is a documentation check, not a complete secret scanner.

Related: [release](release.md), [troubleshooting](troubleshooting.md).
