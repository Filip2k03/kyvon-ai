from fastapi import APIRouter
from app.api.v1.endpoints import auth, chat, documents, knowledge, memory, learning, code, agents

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat & Inference"])
api_router.include_router(documents.router, prefix="/documents", tags=["Knowledge Documents"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["RAG Knowledge Search"])
api_router.include_router(memory.router, prefix="/memory", tags=["AI Memory"])
api_router.include_router(learning.router, prefix="/learning", tags=["Learning AI & Quizzes"])
api_router.include_router(code.router, prefix="/code", tags=["Code Studio & Error Solver"])
api_router.include_router(agents.router, prefix="/agents", tags=["Autonomous AI Agents"])
