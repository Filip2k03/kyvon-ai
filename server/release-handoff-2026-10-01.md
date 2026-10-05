# Chat V2 operator handoff — 2026-10-01

## Candidate and evidence

**VERIFIED:** Chat `2.0.0-rc.1` committed and pushed to GitLab `Stephan_Filip/chat` main as `731d808e2d42856c4c5613ac45f1669848bc926f`. Only 35 Chat candidate files were committed; unrelated root/Meet changes and two `.DS_Store` modifications were preserved.

Typecheck, compiled build, 35 tests, 11 compiled tests and production dependency audit (zero advisories) passed. Documentation validation checked 32 documents and 237 local links. See the authoritative [candidate evidence and limitations](../chat/V2_RELEASE.md).

**BLOCKED:** available `sakuraCTO` SSH identity cannot write `/opt/chat`, read its deployment environment, or use noninteractive sudo. Root SSH authentication was denied. No deployment or TURN installation was performed. Resuming another CLI does not confer administrator authority.

**NOT RUN:** Docker build, live database/access integration, deployment-URL browser tests, iOS/Android media tests and independent cryptographic review. Calling remains disabled by default; this is not a final production-certified release.

## Authorized operator procedure

### Follow-up preflight — 2026-10-02

The owner granted checkout access: `sakuraCTO` can now write `/opt/chat` and read
its environment. The live checkout and stash listing were clean; current revision
was `03c8f6bfe442dc00e7983488feec1ea100d2da67`. Fetch succeeded and no Prisma
path differences were found against the candidate. Disk capacity was sufficient.

**BLOCKED:** a subsequent Compose invocation failed because required
`INITIAL_CEO_PASSWORD` was absent from its effective configuration. No password
value was displayed, generated, or changed. Database migration inventory and
backup checks did not execute past that failure; no restart/deployment occurred.
An operator must reconcile the existing environment securely before continuing.

1. Obtain legitimate deployment authority. Privately inspect the existing checkout, environment, deployment-script modifications and running services. Preserve local changes; do not reset the checkout or overwrite live TLS configuration.
2. Verify recoverable database and uploads backups, including upload-owner `.owner` sidecars. Review pending Prisma migrations: this candidate adds none, but container startup applies existing pending migrations.
3. Fetch GitLab main and reconcile the checkout safely to exactly `731d808e2d42856c4c5613ac45f1669848bc926f`; verify the full commit identity before deployment. Keep `ENABLE_E2EE_CALLS=false`.
4. Validate configuration privately with `docker compose -f docker-compose.prod.yml config --quiet` from `/opt/chat`; never publish expanded environment values. After reviewing the live deployment script, use its existing `./deploy/deploy.sh --no-pull` workflow. Do not use `--nginx`: it installs the bare HTTP template over the vhost.
5. Verify health, authenticated uploads and downloads, denied cross-user file access, logout socket closure, CSV/XLSX previews, multi-file sending and image preview/share at the deployment URL. Record commands, commit, results and rollback readiness. Health alone does not validate these features.
6. Follow the separate [TURN setup and encrypted-call gate](../chat/deploy/TURN.md). Provision DNS, certificates, relay and reviewed firewall settings with administrator authority. Enable calling only for controlled tests until separate-network/device checks and independent protocol review pass.
7. If deployment fails, restore the known previous application revision using the reviewed deployment workflow; assess database compatibility before rollback. Preserve volumes and backups. Disable calling if media verification fails.

This handoff is a root-workspace documentation change, not part of the Chat commit. Related: [deployment](../docs/deployment.md), [security](../docs/security.md), [previous handoff](release-handoff-2026-09-14.md).
