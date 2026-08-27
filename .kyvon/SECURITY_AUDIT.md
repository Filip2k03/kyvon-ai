# KYVON AI: Security & Cryptography Audit

## 1. Cryptographic Invariants
- **Password Hashing**: Constant-time PBKDF2-HMAC-SHA256 (100,000 rounds) and Scrypt hashing.
- **Timing Attack Resistance**: Constant-time string comparison (`hmac.compare_digest`).
- **Token Security**: HS256 JWT with cryptographically secure random entropy.

## 2. Push Protection & Secret Management
- Zero hardcoded tokens or API keys committed to git.
- Push Protection on `https://github.com/Filip2k03/kyvon-ai` verified 100% clean.
- Environment variable injection for production secrets (`JWT_SECRET_KEY`, `POSTGRES_PASSWORD`).

## 3. Web & Edge Defenses
- Strict CSP headers (zero remote CDNs).
- Rate limiting active on Nginx (`limit_req_zone 30r/s`).
- CORS restricted to verified origins (`https://ctoai.reiwasakura.tech`, `https://thuyakyaw.com`).
