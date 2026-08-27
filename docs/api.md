# KYVON AI: REST API v1 Specification

- `POST /api/v1/auth/register` — Register a new account
- `POST /api/v1/auth/login` — Authenticate and receive JWT
- `GET /api/v1/chat/conversations` — List user conversations
- `POST /api/v1/chat/conversations/{id}/messages` — Send message with RAG & Memory
- `POST /api/v1/documents/upload` — Ingest document into vector space
- `POST /api/v1/knowledge/search` — Semantic similarity search
- `GET /api/v1/learning/paths` — List learning mastery roadmaps
- `POST /api/v1/code/analyze` — Run 50-condition CTO AST code audit
- `POST /api/v1/code/solve-error` — Structured error root cause analysis
- `POST /api/v1/agents/run` — Launch bounded multi-agent pipeline
