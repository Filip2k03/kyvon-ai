# Proven implementation patterns

Audience: coding agents. Last inspected: 2026-09-13. These are source examples, not reusable framework claims.

| Pattern / purpose | Reference | Structure and common mistakes | Validation |
|---|---|---|---|
| Chat JSON endpoint | [api wrapper and user routes](../../chat/src/server.ts) | Capture request synchronously → abort tracking → bounded parse → auth/role → store → response. Do not access expired uWS request or write after abort; upload is a separate path. | malformed/oversized request, missing identity, denied role, abort |
| Prisma persistence/wire mapping | [ChatStore](../../chat/src/db.ts) | Typed ORM operation → handle intentional P2002 → safe public mapping. Do not expose passwordHash or trust client membership. | uniqueness race, unauthorized channel, deleted content |
| Meet protocol change | [protocol](../../meet/shared/protocol.ts), [session](../../meet/web/src/lib/session.ts) | Extend union and both ends; preserve paused consume/attach/resume. Never produce for observer. | typecheck plus two-peer media |
| Support state transition | [manager](../../meet/src/support.ts), [tests](../../meet/src/support.test.ts) | Validate actor/target → transition → notify → audit. Do not infer consent from provider availability. | allowed/denied/expired/revoked transitions |
| Redacted logging | [logger](../../meet/src/logger.ts), [tests](../../meet/src/logger.test.ts) | operation metadata → recursive key redaction → JSON log. Sensitive unkeyed strings still need care. | nested secret keys, circular objects |
| Password handling | [auth](../../chat/src/auth.ts), [tests](../../chat/src/auth.test.ts) | random salt → explicit scrypt format → strict parse → timing-safe comparison. Never store plaintext or silently remove legacy compatibility. | correct/wrong/malformed/legacy hashes |

Use the closest pattern only after inspecting the current source. Related: [coding standards](../../docs/coding-standards.md), [testing](../../docs/testing.md).
