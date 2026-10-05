# Database and state

Audience: persistence engineers/operators. Last inspected: 2026-09-13.
Source: [schema](../chat/prisma/schema.prisma), [ChatStore](../chat/src/db.ts), [migrations](../chat/prisma/migrations), [broker](../chat/src/broker.ts), [sessions](../chat/src/auth.ts).

FACT: Chat production Compose uses PostgreSQL 16 and Redis 7. Prisma 7 uses the PostgreSQL adapter. Connection strings come from environment configuration.

| Model | Keys / relationships |
|---|---|
| User | UUID id; unique email; role; password hash; memberships/push subscriptions |
| Channel | UUID id; unique slug; GROUP or DIRECT; messages/members |
| Membership | composite userId/channelId key; cascade user/channel relations |
| Message | UUID id; channel relation; channelId/createdAt index; soft deletion; reactions |
| Reaction | composite messageId/userId/emoji; cascade message relation |
| PushSubscription | endpoint primary key; indexed userId; cascade user relation |
| FeedPost | UUID id; createdAt index; likes |
| FeedLike | composite postId/userId; cascade post relation |

Message author identity and some user IDs are denormalized scalar fields, not User foreign keys. Feed models existing in schema do not prove complete API functionality. Confirm source use before expanding them.

Prisma migrations are timestamped SQL under migrations. New generated client output is produced from schema. Chat's Docker startup executes prisma migrate deploy before starting the server. Do not run migrate reset or db push against production. Schema edits require a reviewed migration; additive nullable fields usually permit staged rollout, while renames, required fields, constraint tightening and deletes can break old code/data.

ChatStore uses nested writes for DM membership and handles uniqueness races. Not all multi-step operations are transactional. Review atomicity when changing delete/reaction operations. Prisma disconnect runs during shutdown.

Redis stores sliding seven-day bearer sessions, a bounded approximate 1,000-entry event stream, and presence hashes. It is not the durable message ledger. Production Compose does not mount a Redis persistence volume. Meet keeps its own sessions/rooms/support state in process memory and has no Prisma schema.

UNKNOWN: backup schedule, encryption, retention, RPO/RTO and restore-test evidence. Back up PostgreSQL and uploads as one recoverable application state; separately record schema revision. A database rollback is not implied by a code rollback.

Attachment authorization update (2026-10-01): new uploads include a `<stored-name>.owner` sidecar containing the uploader's user ID. Back up and restore these files alongside upload bytes; they are not Prisma migrations or public download resources. Existing uploads fall back to visible, non-deleted Message references for access. No schema change is required. An uploader can retain file access after deleting its message; file retention/deletion policy remains a human decision.

Related: [migration runbook](../.agent/runbooks/database-migration.md), [deployment](deployment.md), [security](security.md).
