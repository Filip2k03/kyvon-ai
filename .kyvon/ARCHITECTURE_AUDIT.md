# KYVON AI: Architecture Specification & Invariant Audit

## 1. System Topology
```text
                 [ CLIENT TIER ]
   Next.js 14 AI OS | Care UI PWA | Meet Web | Chrome Extension
                         │ (HTTPS / WSS / TLS 1.3)
                         ▼
                  [ EDGE TIER ]
         Nginx Reverse Proxy @ 187.127.110.32
         ├── TLS 1.3 Perfect Forward Secrecy
         └── Rate Limiter: 30r/s (burst=50)
                         │
      ┌──────────────────┼──────────────────┐
      ▼                  ▼                  ▼
[ REAL-TIME CHAT ]  [ MEET SFU ]     [ AI GATEWAY ]
  uWebSockets.js      Mediasoup         FastAPI Core
     (:3000)           (:3001)            (:8000)
      │                  │                  │
      ▼                  ▼                  ▼
PostgreSQL + Redis  WebRTC UDP     vLLM Core + QLoRA
```

## 2. Asymptotic Bounds & Hot-Path Guarantees
- **uWebSockets.js Socket Lookup**: $\mathcal{O}(1)$ via native C++ handle table.
- **Mediasoup Room Registry**: $\mathcal{O}(1)$ Map lookup with zero Node.js heap crossing for RTP packets.
- **Go RAG Engine**: $\mathcal{O}(K \log N)$ top-K heap retrieval over inverted index ($< 850\mu\text{s}$).
- **Database Indexing**: B-tree indexing on `user_id`, `conversation_id`, and `created_at`.
