from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size_bytes: int
    summary: Optional[str] = None
    created_at: str
    chunks_count: int = 0

    class Config:
        from_attributes = True

class KnowledgeSearchRequest(BaseModel):
    query: str
    top_k: int = 4
    document_ids: Optional[List[str]] = None

class KnowledgeSearchResult(BaseModel):
    document_id: str
    filename: str
    content: str
    similarity_score: float
