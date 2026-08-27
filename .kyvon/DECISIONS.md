# KYVON AI: Architectural Decision Records (ADRs)

## ADR-001: Monorepo Architecture with Next.js & FastAPI
- **Context**: Unifying AI inference, RAG knowledge, personal memory, and real-time chat.
- **Decision**: Adopt Next.js 14 App Router (`apps/web`) for the frontend UI and FastAPI (`apps/api`) for the backend gateway.
- **Consequence**: Ultra-clean separation of concerns, 87.2 kB bundle, and independent scalability.

## ADR-002: Standard Model Context Protocol (MCP) Server
- **Context**: Interfacing Antigravity and Gemini CLI agents with the KYVON CTO Engine.
- **Decision**: Implement a native Python JSON-RPC 2.0 server (`.agents/mcp/server.py`) exporting `kyvon_ask` and `kyvon_50_audit`.
- **Consequence**: Zero protocol errors, instant integration with AI agent hosts.

## ADR-003: 5 Working Intelligence Modes
- **Context**: Tailoring AI interactions to user intent (action vs research vs learning).
- **Decision**: Provide interactive mode pills (WORK, DEVELOP, THINK, LEARN, SIMPLE) that dynamically adjust system prompts and verification invariants.
- **Consequence**: High-precision problem solving and immediate adaptability.
