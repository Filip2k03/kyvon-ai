# KYVON AI: Architecture Specification

## 1. High-Level Topology
```text
  [ Next.js 14 Web Workspace ] (apps/web)
               │ (REST / SSE Streaming)
               ▼
   [ FastAPI Core Gateway ] (apps/api)
         ├── Auth & Security (JWT, Scrypt/PBKDF2)
         ├── AI Provider Abstraction (Local vLLM, OpenAI, Anthropic)
         ├── RAG Vector Pipeline (pgvector / MiniLM Embeddings)
         ├── 4-Tier Memory Engine (Short, Working, Long-Term, Knowledge)
         ├── Learning AI (Mastery Roadmaps, Quizzes, Flashcards)
         ├── Code Studio (AST Audit, Error Solver)
         └── Multi-Agent Orchestrator (Planner, Research, Code, Review)
               │
    ┌──────────┴──────────┐
    ▼                     ▼
[ PostgreSQL + pgvector ] [ Redis 7 ]
```

## 2. Asymptotic Bounds & Hot Paths
- **Vector Cosine Search**: $\mathcal{O}(K \cdot D)$ with indexed HNSW / IVF-Flat.
- **Session Lookup**: $\mathcal{O}(1)$ via Redis hash sets.
- **AST Code Audit**: $\mathcal{O}(N)$ single-pass scanner.
