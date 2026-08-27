from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.schemas.document import KnowledgeSearchRequest, KnowledgeSearchResult
from app.api.v1.endpoints.auth import get_current_user
from app.services.rag_service import rag_service

router = APIRouter()

@router.post("/search", response_model=list[KnowledgeSearchResult])
async def search_knowledge(
    req: KnowledgeSearchRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    hits = await rag_service.search_similar_chunks(db, user.id, req.query, top_k=req.top_k)
    return [
        KnowledgeSearchResult(
            document_id=h["document_id"],
            filename=h["filename"],
            content=h["content"],
            similarity_score=h["similarity_score"]
        ) for h in hits
    ]
