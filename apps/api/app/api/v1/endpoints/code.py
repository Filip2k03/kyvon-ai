from fastapi import APIRouter
from app.schemas.code import CodeAnalysisRequest, CodeAnalysisResponse, ErrorSolveRequest, ErrorSolveResponse
from app.services.code_service import code_service

router = APIRouter()

@router.post("/analyze", response_model=CodeAnalysisResponse)
async def analyze_code(req: CodeAnalysisRequest):
    return code_service.audit_code(req.code, req.language, req.filename or "main.py")

@router.post("/solve-error", response_model=ErrorSolveResponse)
async def solve_error(req: ErrorSolveRequest):
    return code_service.solve_error(
        req.error_message, 
        req.stack_trace or "", 
        req.code_context or "", 
        req.language
    )
