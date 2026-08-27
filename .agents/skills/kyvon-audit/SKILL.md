---
name: kyvon-audit
description: Audits git diffs or code blocks against the KYVON 50-Condition CTO Rubric and gatekeeper API.
---

# KYVON 50-Condition CTO Audit Skill

Use this skill whenever auditing uncommitted code, evaluating architecture, or running CI gatekeeper verification.

## Capabilities & Commands

1. **CLI Diff Audit**:
   ```bash
   kyvon diff
   ```
   Audits the current `git diff` against the 50-condition rubric and prints score, latency, and drop-in fixes.

2. **Remote Gatekeeper API**:
   ```bash
   curl -s -X POST https://ctoai.reiwasakura.tech/api/ci/gatekeeper \
     -H "Content-Type: application/json" \
     -d "{\"project\": \"gitlabserver\", \"diff\": \"$(git diff | base64)\"}"
   ```

3. **50-Condition Vector Rubric**:
   - Time complexity: $O(1)$ hot paths.
   - Concurrency: Context cancellation, bounded workers, race-free.
   - Security: Zero hardcoded secrets, parameterized queries, TLSv1.3 PFS.
   - Safe areas: `h-[100dvh]` and $\ge 44\text{px}$ touch targets.
