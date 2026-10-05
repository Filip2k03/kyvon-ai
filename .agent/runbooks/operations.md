# Deployment, incident and rollback runbook

Audience: authorized operators. Last inspected: 2026-09-13. These steps are procedures, not execution evidence.

1. Identify impacted app, deployment URL, current revision and incident start. Read [deployment](../../docs/deployment.md) and [security](../../docs/security.md).
2. Inspect checkout status before changes. In target app run `docker compose -f docker-compose.prod.yml ps` and bounded `docker compose -f docker-compose.prod.yml logs --tail 50`; redact before sharing.
3. Inspect the relevant health endpoint. Chat uses localhost:3100/healthz; Meet localhost:3200/healthz. Public URL failures with local success suggest proxy/TLS/DNS. Neither proves media or DB functionality.
4. For proxy work, have an authorized operator inspect/test nginx, preserving certificates and unrelated vhosts. Do not use Docker privileges to bypass a denied sudo action.
5. Before deploy, validate env privately and Compose with config -q; verify backup and migration compatibility. Use exact reviewed revision and the source-defined deploy script only after resolving its documented caveats.
6. After deploy, test public URL, denial behavior, approved account sign-in, and affected media/files. Record exact results and timestamps.
7. Rollback: select previously known-good revision/image; preserve dirty work and volumes. If schema is incompatible, stop and choose a reviewed restore/forward-fix plan. No automatic rollback command exists.
8. Close incident only after user-visible recovery and monitoring evidence; record root cause, change, checks, unknowns and follow-up.

Related: [release checklist](../checklists/release.md), [troubleshooting](../../docs/troubleshooting.md).
