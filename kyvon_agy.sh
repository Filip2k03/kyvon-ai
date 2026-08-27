#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo ""
echo "============================================================"
echo "⚡ KYVON 0xPlus + AGY Unified Engineering Pipeline"
echo "============================================================"
echo "Repository: $ROOT"
echo ""

fail() {
    echo ""
    echo "❌ PIPELINE FAILED"
    echo "Stage: $1"
    exit 1
}

run_stage() {
    local name="$1"
    shift

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "▶ $name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    "$@" || fail "$name"
}

# ------------------------------------------------------------
# 1. Environment
# ------------------------------------------------------------

command -v git >/dev/null 2>&1 || fail "git unavailable"
command -v k >/dev/null 2>&1 || fail "k / KYVON CLI unavailable"
command -v agy >/dev/null 2>&1 || fail "agy / Antigravity CLI unavailable"

echo "✓ git found"
echo "✓ k / KYVON found"
echo "✓ agy / Antigravity found"

# ------------------------------------------------------------
# 2. Repository baseline
# ------------------------------------------------------------

run_stage "Repository Status" git status --short --branch

BASELINE="$(mktemp)"

git status --short > "$BASELINE"

# ------------------------------------------------------------
# 3. KYVON pre-audit
# ------------------------------------------------------------

echo ""
echo "⚡ Sending repository context to KYVON..."

k "You are the CTO architecture and security authority.

Repository:
$ROOT

Before implementation, inspect the current repository state and provide
engineering constraints for AGY.

Evaluate:
- architecture
- security
- database
- API
- concurrency
- complexity
- performance
- testing
- deployment

Apply the KYVON 50-condition engineering matrix.

Do not modify files.

Return concrete implementation constraints and risks."

# ------------------------------------------------------------
# 4. AGY execution
# ------------------------------------------------------------

run_stage "AGY Autonomous Implementation" \
agy "
You are the local execution engine for:

$ROOT

Work autonomously.

Inspect the complete repository.

Use the existing project architecture and technology stack.

Your workflow is:

DISCOVER
UNDERSTAND
IMPLEMENT
TEST
FIX
SECURITY REVIEW
PERFORMANCE REVIEW
BUILD
RUNTIME VERIFY
DOCUMENT
FINAL REVIEW

Do not ask for confirmation during normal engineering work.

Do not stop after analysis.

Do not stop after planning.

Do not return TODO instructions instead of implementing them.

Implement the requested work completely.

Fix compile errors.
Fix type errors.
Fix lint errors.
Fix test failures.
Fix runtime failures.
Fix security issues.
Fix obvious performance issues.

Do not fabricate test results.

Do not fabricate benchmarks.

Do not claim completion until verification actually passes.

Use the k / KYVON CLI when architectural verification is needed.

When implementation is complete, inspect git diff and verify all changed files.

Continue until the repository reaches a production-ready state.
"

# ------------------------------------------------------------
# 5. Collect diff
# ------------------------------------------------------------

echo ""
echo "🔍 Collecting implementation diff..."

DIFF_FILE="$(mktemp)"
git diff HEAD > "$DIFF_FILE"

if [[ ! -s "$DIFF_FILE" ]]; then
    echo "⚠️ No Git diff detected."
else
    echo "✓ Diff collected"
fi

# ------------------------------------------------------------
# 6. KYVON post-implementation audit
# ------------------------------------------------------------

echo ""
echo "⚡ Running KYVON final CTO audit..."

AUDIT_FILE="$(mktemp)"

k "Perform the final KYVON 50-condition CTO audit.

Repository:
$ROOT

Review the current Git diff.

Audit:

SECURITY
- secrets
- authentication
- authorization
- injection
- XSS
- CSRF
- SSRF
- path traversal
- unsafe file handling

COMPLEXITY
- O(N²)
- unnecessary nested loops
- N+1 queries
- missing indexes
- inefficient hot paths

MEMORY
- leaks
- unbounded growth
- resource lifetime

CONCURRENCY
- race conditions
- deadlocks
- cancellation
- timeout handling
- unbounded concurrency

DATABASE
- transactions
- indexes
- constraints
- query safety

API
- validation
- authorization
- rate limiting
- error handling

PERFORMANCE
- CPU
- memory
- I/O
- network
- rendering

CODE QUALITY
- typing
- error handling
- maintainability
- architecture

Return:

SCORE: 0-100

CRITICAL:
<critical findings>

HIGH:
<high findings>

MEDIUM:
<medium findings>

LOW:
<low findings>

REQUIRED FIXES:
<concrete fixes>

FINAL STATUS:
PASS or FAIL

Do not invent measurements.
Distinguish measured results from architectural assessment." \
| tee "$AUDIT_FILE"

# ------------------------------------------------------------
# 7. Detect KYVON failure
# ------------------------------------------------------------

if grep -Eiq 'FINAL STATUS:[[:space:]]*FAIL|CRITICAL:' "$AUDIT_FILE"; then

    echo ""
    echo "⚠️ KYVON detected actionable findings."
    echo "🔧 Returning control to AGY for remediation..."

    agy "
KYVON has identified issues in the current implementation.

Repository:
$ROOT

Read the current Git diff and fix ALL actionable KYVON findings.

Requirements:

1. Inspect the actual code.
2. Fix root causes.
3. Do not weaken security.
4. Do not hide warnings.
5. Add or update regression tests.
6. Run tests.
7. Run typechecks.
8. Run lint.
9. Build.
10. Reinspect the final diff.

Do not stop after explaining the fixes.

Actually implement them.

Continue until the identified issues are resolved.
"

    # Re-audit after remediation
    echo ""
    echo "⚡ Re-running KYVON audit after AGY remediation..."

    k "Perform another final 50-condition audit of the current Git diff.

Focus specifically on verifying that previously identified issues have
actually been fixed.

Return:

FINAL STATUS: PASS or FAIL
SCORE: 0-100
REMAINING ISSUES:
..."

fi

# ------------------------------------------------------------
# 8. Project verification
# ------------------------------------------------------------

echo ""
echo "🧪 Detecting project verification commands..."

if [[ -f package.json ]]; then

    echo "Node.js project detected."

    if command -v npm >/dev/null 2>&1; then
        npm run typecheck --if-present || true
        npm run lint --if-present || true
        npm test --if-present || true
        npm run build --if-present || fail "npm build"
    fi

elif [[ -f go.mod ]]; then

    echo "Go project detected."

    go test ./... || fail "Go tests"
    go vet ./... || fail "Go vet"

elif [[ -f Cargo.toml ]]; then

    echo "Rust project detected."

    cargo check || fail "Cargo check"
    cargo test || fail "Cargo tests"
    cargo clippy -- -D warnings || fail "Cargo clippy"

elif [[ -f pyproject.toml || -f requirements.txt ]]; then

    echo "Python project detected."

    if command -v pytest >/dev/null 2>&1; then
        pytest || fail "pytest"
    fi

elif [[ -f composer.json ]]; then

    echo "PHP project detected."

    if [[ -f vendor/bin/phpunit ]]; then
        vendor/bin/phpunit || fail "PHPUnit"
    fi

else
    echo "⚠️ No standard project manifest detected."
    echo "AGY runtime verification remains authoritative."
fi

# ------------------------------------------------------------
# 9. Final Git review
# ------------------------------------------------------------

echo ""
echo "============================================================"
echo "FINAL GIT REVIEW"
echo "============================================================"

git status
git diff --stat

# ------------------------------------------------------------
# 10. Secret scan
# ------------------------------------------------------------

echo ""
echo "🔐 Checking for obvious committed-secret patterns..."

if git diff HEAD | grep -Eiq \
'AKIA[0-9A-Z]{16}|BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY|password[[:space:]]*=[[:space:]]*["'\''][^"'\'']+["'\'']|api[_-]?key[[:space:]]*=[[:space:]]*["'\''][^"'\'']+["'\'']'; then

    echo "❌ Potential secret detected in Git diff."
    echo "Review the diff before committing."
    exit 1
fi

echo "✓ No obvious secret pattern detected."

# ------------------------------------------------------------
# 11. Final KYVON verification
# ------------------------------------------------------------

echo ""
echo "⚡ FINAL KYVON VERIFICATION"

k "Perform the final release-readiness audit for:

$ROOT

Inspect the current Git state and diff.

Verify:
- implementation completeness
- architecture
- security
- database
- API
- performance
- concurrency
- tests
- build
- runtime readiness
- documentation
- accidental changes
- secrets

Return exactly:

KYVON FINAL STATUS: PASS or FAIL
SCORE: 0-100
CRITICAL:
HIGH:
MEDIUM:
LOW:
RELEASE RECOMMENDATION:

Do not claim PASS unless the repository is actually ready."

echo ""
echo "============================================================"
echo "🏁 KYVON + AGY PIPELINE FINISHED"
echo "============================================================"
