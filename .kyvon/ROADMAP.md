# KYVON AI: Engineering Roadmap

## Phase 1: Vercel Global Edge Deployment (Immediate)
- [ ] Connect `Filip2k03/kyvon-ai` to Vercel (`https://vercel.com/new`).
- [ ] Verify automatic edge caching and SSL.

## Phase 2: PostgreSQL pgvector Integration (Next)
- [ ] Connect production PostgreSQL 16 on VPS `187.127.110.32` with pgvector extension.
- [ ] Index document embeddings with HNSW indexing for $\mathcal{O}(K \cdot D)$ cosine similarity.

## Phase 3: Multi-Agent DAG Visualizer (Upcoming)
- [ ] Render interactive real-time execution graphs for Planner ➔ Research ➔ Code ➔ Review runs.
