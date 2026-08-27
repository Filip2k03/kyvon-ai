"""
KYVON CTO AI - 50 Conditions Architecture & Code Evaluator
"""

import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("KYVON-EVALUATOR")

KYVON_SYSTEM_PROMPT = """Identity: KYVON Autonomous Engine.
Role: Principal CTO & Elite Systems Architect for Reiwa Sakura Tech.
Mission: Evaluate codebase diffs with extreme precision against 50 CTO Engineering Conditions.

50 CTO ENGINEERING EVALUATION CRITERIA:
1-5: Latency & Time Complexity (O(1) lookups vs O(N) scans, unindexed searches, nested loops, early returns, branch predictability).
6-10: Memory & Allocations (Zero-allocation streaming, sync.Pool reuse, buffer sizing, heap escapes, slice pre-allocation).
11-15: Concurrency & Thread Safety (Goroutine leaks, sync.WaitGroup defer Done(), channel deadlocks, context timeouts, atomic operations).
16-20: Database & Storage Optimization (N+1 query detection, SARGable indexes, transaction isolation levels, connection pooling, pagination cursor).
21-25: Network & IO Efficiency (Keep-Alive, async non-blocking IO, compression, connection limits, circuit breakers).
26-30: Security Vulnerabilities (SQL injection, XSS, SSRF, hardcoded credentials, timing attacks, path traversal).
31-35: Error Handling & Resilience (Explicit error checks, centralized error boundaries, graceful degradation, retry with jitter, non-crashing panic recovery).
36-40: Observability & Telemetry (Structured JSON logging, trace correlation IDs, Prometheus metrics, distributed context propagation).
41-45: Architecture & Modularity (SOLID compliance, dependency inversion, loose coupling, interface segregation, single responsibility).
46-50: Code Idioms & Maintainability (Language idiomatic style in Go/TS/Python/Rust, type safety, testability, config immutability, deterministic outputs).

OUTPUT REQUIREMENT:
You MUST output valid, strict JSON ONLY. No markdown wrapper outside the JSON.
Schema:
{
  "score": <integer 0-100>,
  "verdict": "<APPROVE | REQUEST_CHANGES | NEEDS_OPTIMIZATION>",
  "summary": "<High-level executive CTO summary>",
  "conditions_checked": 50,
  "passed_conditions_count": <integer 0-50>,
  "critical_issues": [
    {
      "category": "<Latency | Concurrency | Memory | Security | Database | Architecture>",
      "severity": "<CRITICAL | HIGH | MEDIUM | LOW>",
      "file": "<filename>",
      "line_hint": "<line or code snippet>",
      "description": "<Detailed explanation>",
      "suggested_fix": "<Optimized code snippet>"
    }
  ],
  "optimizations": [
    {
      "type": "<Algorithm | Allocation | Query | Concurrency>",
      "file": "<filename>",
      "before": "<suboptimal code>",
      "after": "<optimized code>",
      "complexity_delta": "<e.g. O(N) -> O(1) or 100k allocs -> 0 allocs>",
      "explanation": "<rationale>"
    }
  ],
  "security_findings": [
    {
      "vulnerability": "<name>",
      "severity": "<CRITICAL | HIGH | MEDIUM | LOW>",
      "mitigation": "<actionable fix>"
    }
  ],
  "benchmark_estimate": "<Anticipated latency / throughput / memory impact>"
}
"""


def build_evaluation_prompt(mr_title: str, mr_description: str, diff_text: str) -> List[Dict[str, str]]:
    """
    Constructs OpenAI/vLLM chat messages for MR diff evaluation.
    """
    user_content = f"""### GitLab Merge Request for Evaluation
**Title**: {mr_title}
**Description**: {mr_description or 'No description provided.'}

### Aggregated Code Diff:
```diff
{diff_text[:16000]}
```

Analyze the diff across the 50 CTO conditions. Return strict JSON following the requested schema."""

    return [
        {"role": "system", "content": KYVON_SYSTEM_PROMPT},
        {"role": "user", "content": user_content}
    ]


def parse_and_format_report(raw_llm_response: str) -> str:
    """
    Parses LLM JSON response and formats into a rich, executive GitLab Markdown report.
    """
    # Clean potential markdown fences around JSON
    cleaned = raw_llm_response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
    except Exception as e:
        logger.warning(f"Failed to parse strict JSON from LLM: {e}. Raw content length: {len(raw_llm_response)}")
        # Fallback to direct raw output
        return f"""## ⚡ KYVON Autonomous CTO Code Review
> Evaluated against 50 Architecture & Performance Conditions.

{raw_llm_response}
"""

    score = data.get("score", 85)
    verdict = data.get("verdict", "NEEDS_OPTIMIZATION")
    summary = data.get("summary", "Automated CTO Evaluation complete.")
    passed_count = data.get("passed_conditions_count", 42)
    benchmark = data.get("benchmark_estimate", "Optimizations ready for deployment.")

    badge_color = "green" if score >= 80 else "orange" if score >= 60 else "red"
    verdict_emoji = "✅" if verdict == "APPROVE" else "⚠️" if verdict == "NEEDS_OPTIMIZATION" else "🛑"

    md = []
    md.append(f"## {verdict_emoji} KYVON CTO Engine - Code Audit Report")
    md.append(f"**CTO Score**: `{score}/100` | **Verdict**: `{verdict}` | **Conditions Verified**: `{passed_count}/50 Passed`")
    md.append(f"\n> **Executive Summary**: {summary}\n")

    # Critical Issues
    critical_issues = data.get("critical_issues", [])
    if critical_issues:
        md.append("### 🚨 Critical Issues & Vulnerabilities")
        for idx, issue in enumerate(critical_issues, 1):
            sev = issue.get("severity", "MEDIUM")
            cat = issue.get("category", "General")
            file_name = issue.get("file", "Unknown")
            desc = issue.get("description", "")
            fix = issue.get("suggested_fix", "")

            md.append(f"**{idx}. [{sev}] {cat}** in `{file_name}`")
            md.append(f"- {desc}")
            if fix:
                md.append(f"```suggestion\n{fix}\n```")
            md.append("")

    # Code Optimizations
    optimizations = data.get("optimizations", [])
    if optimizations:
        md.append("### 🚀 Algorithmic & Zero-Allocation Optimizations")
        for idx, opt in enumerate(optimizations, 1):
            opt_type = opt.get("type", "Optimization")
            delta = opt.get("complexity_delta", "N/A")
            expl = opt.get("explanation", "")
            before = opt.get("before", "")
            after = opt.get("after", "")

            md.append(f"#### Optimization {idx}: {opt_type} (`{delta}`)")
            md.append(f"*{expl}*")
            if before and after:
                md.append("```diff")
                for line in before.split("\n"):
                    md.append(f"- {line}")
                for line in after.split("\n"):
                    md.append(f"+ {line}")
                md.append("```")
            md.append("")

    # Security Findings
    security = data.get("security_findings", [])
    if security:
        md.append("### 🛡️ Security & Boundary Findings")
        for sec in security:
            md.append(f"- **[{sec.get('severity', 'INFO')}] {sec.get('vulnerability', 'Check')}**: {sec.get('mitigation', '')}")
        md.append("")

    # Benchmark impact
    md.append("### 📊 Benchmark & Telemetry Impact")
    md.append(f"- **Estimated Delta**: {benchmark}")
    md.append("- **Audit Engine**: `kyvon-core (Qwen2.5-Coder DPO Fine-Tuned)`")
    md.append("\n---\n*Trigger new training via `/KyvonCTOtrain` or re-audit via `/KyvonCTOreview`.*")

    return "\n".join(md)
