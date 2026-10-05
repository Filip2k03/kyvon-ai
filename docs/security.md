# Security controls and risks

Audience: reviewers and operators. Last inspected: 2026-09-13; source snapshot [verification](verification.md). This is a source review, not a penetration-test certification.

## Implemented controls

- Chat [auth](../chat/src/auth.ts): random opaque Redis bearer sessions, sliding seven-day TTL; salted scrypt (N=32768,r=8,p=1), constant-time comparison, legacy hash verification. Legacy verification does not automatically rehash.
- Chat [server](../chat/src/server.ts): account creation role constraints; channel membership checks; bounded JSON/text/files; login throttling; production Origin matching when supplied; generated upload filenames.
- Meet [auth](../meet/src/auth.ts): Chat credential verification; HttpOnly/Secure/SameSite=Lax cookie, 12-hour absolute and 30-minute idle session expiry; privilege-elevation rotation.
- Meet [server](../meet/src/server.ts): CEO/CTO admin gate, optional configured access-key gate, origin checks, WS size/connection limits, HTML CSP, path restrictions, request throttling.
- Meet [support](../meet/src/support.ts): consent and bounded support-session state transitions. Never turn provider launch into silent remote-control approval.
- Meet [logger](../meet/src/logger.ts): structured key-based redaction. It is not permission to log arbitrary sensitive strings.
- Prisma parameterized ORM access reduces SQL injection exposure; validate identifiers and permissions independently.
- Chat attachment update (2026-10-01): `/files/:name` requires a bearer session. New-upload ownership is recorded in a mode-0600 `.owner` sidecar; other users and legacy files require a non-deleted message in a GROUP channel or a DIRECT channel where the requester is a member. Message creation also checks attachment visibility. Responses use `private, no-store` and `nosniff`; browser previews use authorized fetches and revocable blob URLs. Policy unit tests pass; live database/browser enforcement is not yet verified.
- Chat voice candidate: disabled unless `ENABLE_E2EE_CALLS=true` and valid TURN configuration exists. Per-action session/membership/device-state checks protect signaling; ephemeral ECDH/HKDF/directional AES-GCM and a manual 96-bit code protect frames under the stated threat model. Worker helper tests verify fail-closed gating/tampering/replay; real browser E2EE and protocol review remain outstanding. The server/relay sees call metadata. Text/files are not E2EE. See [the required gate](../chat/deploy/TURN.md), not marketing claims.
- Production app HTTP binds localhost; Chat DB/cache have no host port mappings in production Compose. Nginx templates define forwarding behavior and headers.

## Risks requiring explicit review

| Classification | Finding | Required follow-up |
|---|---|---|
| SECURITY RISK | Historical file responses were publicly cacheable; already copied/cached files cannot be revoked by new authorization | Review proxy/CDN caches and sensitive historical uploads before rollout; update cached/old clients |
| SECURITY RISK | Push endpoint validation checks HTTPS only; unsubscribe uses endpoint without user ownership predicate | Review SSRF/private-network access and subscription ownership |
| SECURITY RISK | Chat password changes do not revoke all existing sessions | Define revocation policy and test it |
| SECURITY RISK | Chat upload still buffers bounded bodies before resolving session identity, although missing bearer tokens and malformed encoded names are now rejected immediately | Review concurrency/resource limits and authenticate before buffering |
| SECURITY RISK | Chat origin helper permits absent Origin; raw upload is outside JSON wrapper | Treat CORS/origin as browser controls, not authorization |
| SECURITY RISK | No comprehensive Chat CSP found; browser token storage increases XSS impact | Review client storage and script policy |
| SECURITY RISK | Encrypted-call candidate is custom protocol code with manual identity comparison; endpoint compromise or malicious delivered JavaScript defeats it | Keep calling disabled until independent review and separate-network device validation |
| TECHNICAL DEBT | Meet auth/rate/session maps are local to one process | Define scaling, memory bounds, restart and revocation behavior |
| SECURITY RISK | Dockerfiles do not specify USER; build tooling remains in runtime | Review non-root execution and reduced runtime images |
| SECURITY RISK | Development Compose exposes PostgreSQL/Redis ports | Never use development Compose on an exposed host |
| UNKNOWN | Live TLS/HSTS, firewall, SSH policy, GitLab version, backup controls | Verify with authorized administrative access |
| NEEDS HUMAN DECISION | Guest room access and optional admin gate configuration | Define intended access policy; hidden path is not authorization |

No dedicated CSRF token mechanism was identified; Meet relies on cookies plus origin checks, while Chat uses bearer tokens. Missing-Origin requests are accepted in some HTTP paths. Do not claim blanket CSRF protection. Meet CSP includes unsafe-inline styles and external YouTube origins; policy scope is HTML responses.

Output encoding is required independently of input validation. Keep text-node/React rendering; do not insert user HTML. Validate outbound URL destinations for SSRF, upload path ownership for traversal, and Electron IPC/provider invocation for command injection; inspect [desktop main](../meet/desktop/main.js) and [preload](../meet/desktop/preload.js) for affected work.

Never include actual environment values in docs, test fixtures, shell output, tickets, or reports. If a secret was exposed, rotate through the authorized operator; deleting current source does not remove Git history. Do not print full docker inspect or compose config with resolved environments. Use config -q or selected non-secret fields.

Related: [dependencies](dependencies.md), [deployment](deployment.md), [change checklist](../.agent/checklists/change.md).
