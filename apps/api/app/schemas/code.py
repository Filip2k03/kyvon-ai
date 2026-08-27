from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class CodeAnalysisRequest(BaseModel):
    code: str
    language: str = "python"
    filename: Optional[str] = "main.py"
    action: str = "audit" # audit, explain, bug_fix, docstring, refactor

class CodeIssue(BaseModel):
    line: Optional[int] = None
    severity: str # CRITICAL, HIGH, MEDIUM, LOW
    category: str # Complexity, Security, Concurrency, Allocation
    description: str
    suggested_fix: str

class CodeAnalysisResponse(BaseModel):
    language: str
    quality_score: int # 0 to 100
    complexity_bound: str # O(1), O(N), etc.
    summary: str
    issues: List[CodeIssue] = []
    refactored_code: Optional[str] = None

class ErrorSolveRequest(BaseModel):
    error_message: str
    stack_trace: Optional[str] = None
    code_context: Optional[str] = None
    language: str = "python"

class ErrorSolveResponse(BaseModel):
    error_type: str
    cause: str
    impact: str
    solution: str
    example: str
    confidence: float
