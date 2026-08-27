# Security Policy & Zero-Trust Architecture

## 1. Secrets & Authentication
- **Zero Secrets in Git**: No API keys, credentials, or private keys in repository source code.
- **Password Hashing**: `scrypt` hashing with 16-byte cryptographically secure random salt and 64-byte derived key.
- **Timing Attack Defense**: All token and signature checks use `crypto.timingSafeEqual`.
- **Session Tokens**: 32-byte cryptographically secure base64url opaque tokens with 7-day sliding Redis TTL.

## 2. Ingress & Injection Defenses
- **SQL Parameterization**: Prisma ORM parameterization on all queries.
- **Manifest V3 CSP**: Chrome Extension adheres to `script-src 'self'` with local vendor packaging.
- **CORS & SSL**: TLS 1.3 enforced on all reverse proxy routes with strict HSTS headers.
