# Release engineering

Audience: release owners. Last inspected: 2026-09-13.

FACT: Chat, Meet and Meet desktop manifests currently say 1.0.0. No root package version or enforced version policy exists. Existing download filenames are not proof of artifact provenance or signature verification. No active release pipeline, changelog automation, package publishing or GitHub Releases workflow was found.

## Proposed repeatable procedure

This procedure formalizes safe preparation; it is not invented historical release practice.

1. Identify affected repository and owner. Inspect status, branch and diff; preserve existing user changes. Root Chat/Meet pointers do not include uncommitted child changes.
2. Complete [release checklist](../.agent/checklists/release.md), including migration/backups and deployment-URL smoke plan.
3. Review changes and choose version/tag policy with the owner. Update only affected manifests and release notes. Record compatibility and migration implications.
4. Build and retain artifacts tied to the exact commit. Chat artifact is Docker image plus generated Prisma; Meet image includes generated web/public output. Desktop dist:mac/dist:win are separate scripts; signing/notarization credentials and validation are UNKNOWN. Chat TWA release has its own [mobile guide](../chat/mobile/MOBILE_DEPLOYMENT.md).
5. Commit/tag/push only in the authorized scope. Finish child repository commits before updating root gitlinks; missing .gitmodules prevents assuming normal submodule bootstrap.
6. Deploy the exact reviewed revision via [deployment](deployment.md), execute smoke checks, record result and observe errors.
7. If rollback is required, assess database compatibility first. Redeploy a known prior artifact/revision; do not reset dirty trees or remove persistent volumes.

NEEDS HUMAN DECISION: branching protections, tag naming, release approver, registry retention, signing identities and rollback service objectives. Do not claim “production release” merely because a local build passes.

Related: [operations](../.agent/runbooks/operations.md), [CI/CD](ci-cd.md).
