# Chat / Meet release handoff — 2026-09-14

Audience: authorized VPS administrator. This is a prepared procedure, not a completed deployment.

## Verified state

| App | Live checkout observed | Pushed target on GitLab main |
|---|---|---|
| Chat | 03c8f6b | 445848e54080e4b212e4507bcdbfa202fb600c3e |
| Meet | f14f373 | 0c92c173f39adba6056d0cc952097aa2155f6e0d |

The sakuraCTO SSH account cannot write /opt/chat or /opt/meet. Noninteractive sudo requires a password. Chat's environment file is unreadable to that account. Remote status also reports a modified deployment script and an untracked environment backup; inspect each checkout separately to identify and preserve them. Never print the backup contents.

## Administrator preflight

1. Use an authorized administrative session. Do not grant unrestricted Docker-based access as a workaround for denied host permissions.
2. Inspect status and the deployment-script diff independently in /opt/chat and /opt/meet. Preserve local modifications in a private operator-controlled backup before reconciling them with the target revision. Do not use reset --hard, clean, or a blanket stash that could capture secrets.
3. Verify recoverable database/upload backups and record existing image IDs privately. Check migration status; Chat startup applies pending Prisma migrations automatically. No new migration files were introduced in this release, but the live database may still have pending older migrations.
4. Verify Chat's required environment variables privately: POSTGRES_PASSWORD, INITIAL_CEO_PASSWORD, INITIAL_CTO_PASSWORD. Use the existing database's actual credential; changing an environment value does not rotate an initialized PostgreSQL database password. Bootstrap passwords do not overwrite existing users.
5. Verify Meet's ANNOUNCED_IP and admin configuration. PUBLIC_ORIGIN is set in its production Compose configuration and is used by the repaired smoke check. Preserve downloads and all persistent volumes.

## Deploy the exact reviewed commits

Only after preflight and reconciliation, run these in the named app directory from the authorized administrative session. Stop immediately if any command fails. A successful fetch is not a deployment.

Chat, from /opt/chat:

```bash
git fetch origin main
git merge --ff-only 445848e54080e4b212e4507bcdbfa202fb600c3e
docker compose -f docker-compose.prod.yml config -q
./deploy/deploy.sh --no-pull
```

Meet, from /opt/meet:

```bash
git fetch origin main
git merge --ff-only 0c92c173f39adba6056d0cc952097aa2155f6e0d
docker compose -f docker-compose.prod.yml config -q
./deploy/deploy.sh --no-pull
```

These commands deliberately omit nginx-install flags: the application release does not require replacing live TLS vhosts. Build failures must leave existing services intact where possible; inspect status before retrying. Do not remove volumes. Meet recreation interrupts active rooms and in-memory sessions; schedule accordingly.

## Verification and rollback

- Check Compose status and bounded, sanitized logs in each app directory.
- Verify https://chat.reiwasakura.tech/healthz and https://meet.reiwasakura.tech/healthz.
- Confirm Chat's new preview/download controls are served; test image preview, MP4 controls, original-name downloads, failure feedback and channel switching during upload using approved test data.
- Verify Meet sign-in, denied admin access, Origin-aware WS handshake and two-client media on the deployment URL. Health alone is not proof of functional media.
- Record deployed SHA, image identity, migration outcome and each check as VERIFIED/FAILED/NOT RUN.
- If rollback is required, use the recorded prior image/revision only after checking database compatibility. There is no automatic rollback procedure; preserve dirty work and data.

## Current blocker

BLOCKED: application deployment requires authorized write access to the live checkouts and private environment configuration. The pushed commits are ready for operator review, but neither release has been deployed by this session.

Related: [deployment](../docs/deployment.md), [release](../docs/release.md), [security](../docs/security.md), [operations](../.agent/runbooks/operations.md).
