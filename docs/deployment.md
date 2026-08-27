# KYVON AI: Production Deployment Guide

## GitHub Free-Tier Ecosystem
1. **GitHub Actions**: Automated CI matrix on every push.
2. **GitHub Container Registry (GHCR)**: Zero-cost versioned Docker image registry (`ghcr.io/filip2k03/kyvon-cto-engine`).
3. **Cloudflare Pages / Vercel**: Global edge CDN for Next.js frontend with zero bandwidth cost.
4. **Debian VPS (187.127.110.32)**: FastAPI Core + vLLM inference backend.
