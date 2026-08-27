import math
import hashlib
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.document import Document, DocumentChunk
from app.core.config import settings

class RAGService:
    @staticmethod
    def chunk_text(text: str, chunk_size: int = settings.DEFAULT_CHUNK_SIZE, overlap: int = settings.DEFAULT_CHUNK_OVERLAP) -> List[str]:
        words = text.split()
        if len(words) <= chunk_size:
            return [text] if text.strip() else []
        
        chunks = []
        start = 0
        while start < len(words):
            end = start + chunk_size
            chunk_str = " ".join(words[start:end])
            if chunk_str.strip():
                chunks.append(chunk_str)
            start += (chunk_size - overlap)
        return chunks

    @staticmethod
    def generate_embedding(text: str, dim: int = settings.EMBEDDING_DIM) -> List[float]:
        """Generates deterministic unit vector embedding for text using token-hash projection."""
        vec = [0.0] * dim
        tokens = text.lower().split()
        if not tokens:
            return vec
        
        for tok in tokens:
            h = int(hashlib.md5(tok.encode("utf-8")).hexdigest(), 16)
            idx = h % dim
            val = ((h >> 4) % 1000) / 500.0 - 1.0
            vec[idx] += val
            
        # L2 Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        return float(dot)

    async def index_document(self, db: AsyncSession, doc: Document, text_content: str) -> int:
        chunks = self.chunk_text(text_content)
        for i, chunk_text in enumerate(chunks):
            embedding = self.generate_embedding(chunk_text)
            chunk = DocumentChunk(
                document_id=doc.id,
                chunk_index=i,
                content=chunk_text,
                embedding=embedding,
                token_count=len(chunk_text.split())
            )
            db.add(chunk)
        await db.commit()
        return len(chunks)

    async def search_similar_chunks(
        self, 
        db: AsyncSession, 
        user_id: str, 
        query: str, 
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        query_vec = self.generate_embedding(query)
        
        # Query all chunks belonging to user's documents
        stmt = (
            select(DocumentChunk, Document.filename)
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(Document.user_id == user_id)
        )
        res = await db.execute(stmt)
        rows = res.all()
        
        scored_chunks = []
        for chunk, filename in rows:
            if chunk.embedding:
                score = self.cosine_similarity(query_vec, chunk.embedding)
                scored_chunks.append({
                    "document_id": chunk.document_id,
                    "filename": filename,
                    "content": chunk.content,
                    "similarity_score": round(score, 4)
                })
        
        scored_chunks.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_chunks[:top_k]

rag_service = RAGService()
