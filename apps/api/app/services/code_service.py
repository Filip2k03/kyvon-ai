import re
from typing import Dict, Any, List
from app.schemas.code import CodeAnalysisResponse, CodeIssue, ErrorSolveResponse

class CodeService:
    @staticmethod
    def audit_code(code: str, language: str = "python", filename: str = "main.py") -> CodeAnalysisResponse:
        issues: List[CodeIssue] = []
        score = 100
        complexity = "O(1)"

        # Check 1: Nested Loops O(N^2)
        if ("for " in code and code.count("for ") >= 2) or ("for (" in code and code.count("for (") >= 2):
            issues.append(CodeIssue(
                line=code.split("\n").index([l for l in code.split("\n") if "for " in l][0]) + 1 if "for " in code else 1,
                severity="HIGH",
                category="Complexity & Latency",
                description="Detected nested loop causing O(N^2) quadratic scaling bottleneck.",
                suggested_fix="// Replace nested loop with hash map / set index for O(N) linear pass\nconst lookup = new Map(items.map(x => [x.id, x]));"
            ))
            score -= 25
            complexity = "O(N^2)"

        # Check 2: N+1 Database Query pattern
        if ("await db." in code or "findMany" in code or "SELECT " in code) and ("for " in code or "forEach" in code):
            issues.append(CodeIssue(
                severity="CRITICAL",
                category="Database Optimization",
                description="N+1 sequential database roundtrip inside iteration loop.",
                suggested_fix="const batchData = await prisma.item.findMany({ where: { id: { in: ids } } });"
            ))
            score -= 30

        # Check 3: Secrets / Hardcoded tokens
        if re.search(r'(?:glpat-|sk-|AIzaSy|ghp_)[A-Za-z0-9_\-]{10,}', code):
            issues.append(CodeIssue(
                severity="CRITICAL",
                category="Security & Hardcoded Secrets",
                description="Hardcoded API credential or secret token detected in source code.",
                suggested_fix="const apiKey = process.env.API_KEY || '';"
            ))
            score -= 40

        # Check 4: Unbounded Slice Growth in Go
        if "append(" in code and "make(" not in code and language == "go":
            issues.append(CodeIssue(
                severity="MEDIUM",
                category="Memory Allocation",
                description="Unbounded dynamic slice reallocation causing heap escapes and GC pressure.",
                suggested_fix="buf := make([]T, 0, expectedCapacity)"
            ))
            score -= 15

        summary = f"Audited {len(code.splitlines())} lines of {language.upper()} code. Identified {len(issues)} architectural findings."
        return CodeAnalysisResponse(
            language=language,
            quality_score=max(score, 10),
            complexity_bound=complexity,
            summary=summary,
            issues=issues
        )

    @staticmethod
    def solve_error(error_message: str, stack_trace: str = "", code_context: str = "", language: str = "python") -> ErrorSolveResponse:
        err_lower = error_message.lower() + " " + stack_trace.lower()

        if "modulenotfounderror" in err_lower or "cannot find module" in err_lower:
            missing_pkg = error_message.split("No module named")[-1].strip().replace("'", "") if "No module named" in error_message else "package"
            return ErrorSolveResponse(
                error_type="ModuleNotFoundError / Import Failure",
                cause=f"The runtime environment cannot locate the module `{missing_pkg}` in sys.path or node_modules.",
                impact="Execution halts immediately during the import phase before application startup.",
                solution=f"Install the missing dependency in your active virtual environment: `pip install {missing_pkg}` or `pnpm add {missing_pkg}`.",
                example=f"# Activate environment and install\nsource .venv/bin/activate\npip install {missing_pkg}",
                confidence=0.98
            )

        if "connection refused" in err_lower or "econnrefused" in err_lower:
            return ErrorSolveResponse(
                error_type="ECONNREFUSED / Network Daemon Unavailable",
                cause="The client attempted a TCP handshake to a host/port where no process is currently listening.",
                impact="Network calls, database queries, or Redis cache lookups fail immediately.",
                solution="Verify that the target daemon (PostgreSQL / Redis / vLLM) is running and bound to the expected interface.",
                example="sudo systemctl status postgresql\nsudo netstat -tuln | grep 5432",
                confidence=0.95
            )

        if "deadlock" in err_lower or "lock wait timeout" in err_lower:
            return ErrorSolveResponse(
                error_type="Database Transaction Deadlock",
                cause="Two concurrent transactions acquired mutual locks in reverse order, creating a circular wait state.",
                impact="One of the conflicting transactions is aborted by the database engine.",
                solution="Enforce deterministic lock acquisition ordering across all queries and keep transaction windows minimal.",
                example="-- Always acquire locks in ascending primary key order\nSELECT * FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;",
                confidence=0.92
            )

        # General error solver fallback
        return ErrorSolveResponse(
            error_type="Runtime Exception / Logic Error",
            cause="Runtime state deviated from expected invariants during operation execution.",
            impact="Request terminated with non-zero exit status.",
            solution="Inspect input parameter validation, null/undefined checks, and boundary limits.",
            example="// Add guard clause\nif (!input || input.length === 0) return defaultValue;",
            confidence=0.85
        )

code_service = CodeService()
