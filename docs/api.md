# API contracts

Audience: API/client engineers. Last inspected: 2026-09-13. Source: [Chat server](../chat/src/server.ts), [Meet server](../meet/src/server.ts). No OpenAPI contract is present.

## Chat HTTP

JSON wrapper returns JSON objects, commonly {error: string}; login returns {token, user}. Authorization uses Bearer tokens except public endpoints. The wrapper caps JSON bodies at 64 KiB, rejects malformed input, maps handler errors to server errors, and rejects a mismatched supplied browser Origin.

| Method | Route | Input / authorization |
|---|---|---|
| POST | /api/login | email, password; company email; 8 failed attempts per IP/email per 15 minutes |
| POST | /api/logout | bearer token; returns ok |
| GET | /api/users | authenticated; returns users |
| POST | /api/users | email, displayName, password, role; CEO creates STAFF/CTO, CTO creates STAFF |
| POST | /api/password | current, next; authenticated; minimum next length 12 |
| GET | /api/push/key | public; key or null |
| POST | /api/push/subscribe | endpoint, keys.p256dh, keys.auth; authenticated; HTTPS endpoint |
| POST | /api/push/unsubscribe | endpoint; authenticated |
| POST | /api/status | emoji, text; authenticated; updates and broadcasts user presence status |
| POST | /api/channels | name; CEO/CTO |
| POST | /api/dm | userId; authenticated; valid other user |
| POST | /api/search | q; authenticated; minimum 2 characters |
| POST | /api/upload | raw body, Content-Type, URI-encoded X-File-Name; bearer; 10 MiB cap |
| POST | /api/files/preview | bearer + file visibility; stored XLSX name; bounded worker result; per-user/global limits |
| POST | /api/calls/config | bearer; enabled flag and temporary TURN credentials, or disabled status; no shared secret |
| GET | /files/:name | bearer session plus upload-owner or visible-message authorization; no-store; inaccessible files return 404 |
| GET | /healthz | liveness response |
| GET | /livez | status and process uptime |
| GET | /readyz | static ready status and timestamp; does not probe dependencies |

Common statuses: 200/201 success, 400 invalid request, 401 missing/invalid identity, 403 permission/origin rejection, 404 missing target, 409 uniqueness conflict, 413 oversized JSON, 429 login throttling, 500 internal failure. Upload uses its own handler and currently returns 400 for excess size; do not assume wrapper behavior applies.

Chat /ws first authenticates with {type:"auth", token}; events include open, message, thread, status, typing, react, edit, delete, pin, pins. Messages support `parentId` for thread replies and auto-invoke autonomous MCP bot assistants when mentioning `@Yamato AI`, `@ai`, `@bot`, or `/ai`. See ClientEvent, parseClientEvent and handleEvent for exact fields and ownership checks. Persisted message payloads are defined in [db.ts](../chat/src/db.ts) and MCP tools in [mcp.ts](../chat/src/mcp.ts).

### Chat attachment client update (2026-10-01)

The web client accepts multi-selection, dropped files and pasted images in bounded batches: at most 10 files, 10 MiB per file, 50 MiB total. Uploads are sequential and each file remains a separate message using the existing single-attachment protocol. The first message carries the caption; the destination is captured before upload. A failed upload stops remaining files; there is no transactional batch or delivery acknowledgment guarantee.

CSV previews handle quoted fields and render cells as text. XLSX previews use a bounded isolated worker; formulas/external links are not executed and Excel formatting is not reproduced. Limits and candidate evidence are authoritative in [Chat V2 release notes](../chat/V2_RELEASE.md). Attachment retrieval requires bearer authentication and file visibility; tokens must never be placed in URLs. Upload owners retain access after message deletion. Legacy orphaned uploads without ownership metadata or a visible message are inaccessible. See historical cache and rollout risks in [security](security.md).

Chat voice `call` signaling is a disabled-by-default one-to-one candidate: invite/accept carry ephemeral public keys, offer/answer carry audio SDP, ice carries a bounded relay candidate JSON string, and end closes the call. Server-authorized DIRECT membership is required to invite; subsequent transitions bind user/connection, validate current session and enforce state order/rate/time limits. No media/private encryption key is sent through Chat WS. See [calls](../chat/src/calls.ts), [browser crypto](../chat/public/voice-crypto.js) and [TURN release gate](../chat/deploy/TURN.md). This is not a production E2EE certification. Logout now closes WS connections and calls using the revoked session token.

Validation record is maintained with the candidate in [release notes](../chat/V2_RELEASE.md). The full test suite needs execution outside this sandbox because system uptime access and the runner socket are restricted. Browser/device validation, live database authorization and deployment remain **NOT RUN**. Policy/helper tests are not an end-to-end security certification.

## Meet HTTP and signaling

| Method | Route | Behavior |
|---|---|---|
| GET | /healthz | ok plus registry stats |
| POST | /api/auth/login | email/password → Chat verification → secure session cookie |
| POST | /api/auth/logout | expires cookie/session |
| GET | /api/auth/me | user or null, adminUnlocked |
| GET | /api/lyrics?q=... | capped query; rate-limited upstream lyrics lookup |
| POST | /api/admin/unlock | CEO/CTO, slug/accessKey; rotates session |
| GET | /api/admin/sessions | admin snapshot |
| GET | /api/admin/devices | admin device registry |
| GET | /api/admin/support | admin support list |
| POST | /api/admin/support/request | admin support request; validated target/reason/duration in source |
| POST | /api/admin/devices/:uuid/revoke | admin revocation |
| GET | /api/admin/support/:uuid | admin support detail |
| POST | /api/admin/support/:uuid/end | admin termination |
| POST | /api/admin/support/:uuid/revoke | admin revocation |
| POST | /api/admin/support/:uuid/provider-opened | provider-open event |
| GET | /room/:roomId/files/:uuid | room-shared file path; inspect handler's access checks |

/ws uses the request/response/notification union in [protocol.ts](../meet/shared/protocol.ts); /admin-ws is separately gated. Transport creation, connection, production, consumption and resume belong to that protocol, not invented REST endpoints. Error handling includes SupportError codes and HTTP denial responses; read the affected branch before extending it.

Related: [security](security.md), [architecture](architecture.md), [patterns](../.agent/patterns/README.md).
