---
description: KYVON 0xPlus Architectural and Zero-Trust Directives for Gitlabserver
globs: ["**/*.ts", "**/*.go", "**/*.py", "**/*.html", "**/*.sh"]
always_on: true
---

# KYVON 0xPlus Architecture & Zero-Trust Rules

## 1. Concurrency & Performance Bounds
- Hot-paths MUST be $O(1)$ or $O(N \log N)$ with bounded allocation.
- In Go and Rust, use cache-padded lock-free primitives or bounded worker pools.
- In Python / FastAPI, use asynchronous non-blocking I/O (`async def`) and zero-buffering for SSE streams.

## 2. Mobile-Core UI Standard (320px – 425px)
- Lock root container heights to `h-[100dvh]` to eliminate iOS navigation bar shifting.
- Include safe-area padding: `pb-[max(0.75rem,env(safe-area-inset-bottom))]`.
- Touch targets must satisfy $\ge 44 \times 44\text{px}$.
- No horizontal page scroll. Code and math containers must declare `overflow-x-auto` with `break-words`.

## 3. Zero-Trust Security
- Zero plaintext API keys or private keys in source code.
- Parameterized SQL and sanitized query inputs.
- TLSv1.3 with Perfect Forward Secrecy for external services.
- Never weaken security to bypass a test.
