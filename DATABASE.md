# Database Architecture & Migration Standard

## 1. Schema & Engine
- **Engine**: PostgreSQL 16
- **Cache & Pub/Sub**: Redis 7
- **ORM / Query Layer**: Prisma ORM with `@prisma/adapter-pg`

## 2. Models
- `User`: Identity, email, password hash, role-based authorization (ADMIN, USER).
- `Channel`: Public and private communication channels.
- `Message`: Chat messages with foreign-key indexed channels, user authors, timestamps, and soft deletion flags.
- `SupportRequest`: Cryptographically authorized WebRTC remote support access sessions.

## 3. Performance & Indexing
- Foreign keys (`channelId`, `authorId`) indexed for $O(\log N)$ b-tree lookup.
- Connection pooling with bounded minimum and maximum active connections.
