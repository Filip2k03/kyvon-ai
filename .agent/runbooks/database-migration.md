# Chat database migration runbook

Audience: persistence engineer and authorized operator. Last inspected: 2026-09-13.

1. Inspect [schema/migrations](../../chat/prisma/schema.prisma), [database rules](../../docs/database.md), target revision and proposed SQL.
2. Classify additive vs breaking changes. Review foreign keys, backfill, nullability, indexes, lock duration and rollback compatibility.
3. Prepare migration with the repository's Prisma toolchain on a disposable development database. Never point development migration commands at production.
4. Validate the schema with `pnpm exec prisma validate` from Chat; supply environment privately. Test migrations against representative non-sensitive data and verify old/new app compatibility.
5. Obtain recoverable database and upload backups with a tested restore path. Record migration IDs without connection secrets.
6. Production Docker startup already runs `pnpm exec prisma migrate deploy`. Treat container recreation as a migration action; review before deployment.
7. Verify applied migrations and application reads/writes with approved test data. A healthy process alone does not prove migration correctness.
8. If migration fails, inspect sanitized error and actual schema state. Do not rerun destructively, edit an already-applied migration, or invent a down migration. Choose a reviewed forward fix or restore.

UNKNOWN: backup automation/restore objectives. Resolve before a risky production migration.
Related: [release](../../docs/release.md).
