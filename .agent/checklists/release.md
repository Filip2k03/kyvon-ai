# Release and production deployment checklist

Audience: release owner. Last inspected: 2026-09-13.

- [ ] Affected repository, revision, owner and deployment authority established.
- [ ] Dirty root/child changes reviewed; unrelated work preserved.
- [ ] Package-manager/runtime discrepancy resolved or explicitly blocking.
- [ ] Tests/typecheck/build and dependency audit recorded with scope.
- [ ] Environment presence checked privately; secrets absent from docs/artifacts.
- [ ] Schema compatibility and database/upload backup/restore verified.
- [ ] TLS/nginx/firewall changes reviewed against live configuration.
- [ ] Meet Origin-aware WS smoke and two-client media test prepared.
- [ ] Version, tag, notes and immutable artifact identity selected.
- [ ] Exact revision deployed; health/auth/file/media checks completed as applicable.
- [ ] Rollback target and compatibility verified.
- [ ] Post-release errors observed and results recorded.

An unchecked item is not a passed gate. Related: [release procedure](../../docs/release.md), [operations](../runbooks/operations.md).
