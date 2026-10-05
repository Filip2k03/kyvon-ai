# Deployment

Audience: authorized operators. Last inspected: 2026-09-13; [verification](verification.md). Commands below are source-verified operational procedures, not evidence that deployment ran.

## Environments

Development: Chat dependency Compose and watch server; Meet watch server/Vite. Staging: no separate checked-in staging stack or URL established. Production: app-specific Compose on a shared VPS with host nginx, GitLab Omnibus and other services. The sibling website has its own deploy process.

| Service | Path documented in repository | HTTP upstream |
|---|---|---|
| Chat | /opt/chat | 127.0.0.1:3100 → container:3000 |
| Meet | /opt/meet | 127.0.0.1:3200, host networking |
| GitLab | Omnibus; see server notes | 127.0.0.1:6969 |

DNS/TLS details: [GitLab notes](../server/gitlab.md), [Chat proxy](../chat/deploy/nginx-chat.conf), [Meet proxy](../meet/deploy/nginx-meet.conf), [Cloudflare mode](../meet/deploy/CLOUDFLARE.md). Standard checked-in vhosts are HTTP templates; certificate installation is separate. Never overwrite a certbot-managed live vhost with a bare template. GitLab's server_name must not include the apex website.

Meet requires reachable announced public IP and UDP/TCP 40000–40099. HTTP success cannot establish RTP reachability. Cloudflare proxies signaling, not ordinary mediasoup UDP. TURN status must be verified independently.

## Deployment procedure

Current prepared release: [2026-09-14 operator handoff](../server/release-handoff-2026-09-14.md), including exact pushed commits and access blockers.

1. Follow the [release checklist](../.agent/checklists/release.md); inspect target checkout, revision, local changes, disk and backup evidence.
2. Verify required environment variable presence privately. Chat production Compose requires POSTGRES_PASSWORD and bootstrap password variables; Meet loads .env. Never log values.
3. In the target app, `docker compose -f docker-compose.prod.yml config -q` validates interpolation without printing configuration.
4. App scripts [Chat deploy](../chat/deploy/deploy.sh) and [Meet deploy](../meet/deploy/deploy.sh) pull with --ff-only unless --no-pull; then build/recreate containers. Chat startup applies migrations automatically.
5. Only after authorization and preflight, run `./deploy/deploy.sh --no-pull` on the reviewed revision. Meet's WS smoke check requires PUBLIC_ORIGIN in the container. Nginx flags require elevated host privileges and additional live TLS review.
6. Check Compose status, bounded logs, deployment URL health, authentication denial/success with approved test users, and media/file behavior as affected.
7. Record deployed SHA, artifact identity, migration status and results. On failure use the [operations runbook](../.agent/runbooks/operations.md).

FACT: scripts deploy in place, not blue/green; no automated rollback or durable release artifact registry is defined. Meet restart interrupts sessions/rooms. Chat uploads and PostgreSQL volumes must be preserved. Existing health endpoints are not full readiness probes. UNKNOWN: monitoring alerts, backup schedule and recovery objectives.

Chat attachment rollout (2026-10-01, not deployed): deploy the server and updated web client together. `/files/:name` no longer works as an anonymous link; old clients using direct image URLs must refresh. Preserve the entire uploads volume, including new `.owner` sidecars. Verify anonymous denial, uploader preview, allowed DM member download and unrelated-user denial on the deployment URL. Review historical browser/proxy caches: prior public file responses cannot be retroactively revoked. Do not describe this authorization change as end-to-end encryption.
