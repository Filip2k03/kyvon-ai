from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.api.v1.endpoints.auth import get_current_user
from app.services.rag_service import rag_service

router = APIRouter()

@router.get("/", response_model=list[DocumentResponse])
async def list_documents(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document).where(Document.user_id == user.id).order_by(Document.created_at.desc())
    res = await db.execute(stmt)
    docs = res.scalars().all()
    return [
        DocumentResponse(
            id=d.id,
            filename=d.filename,
            file_type=d.file_type,
            file_size_bytes=d.file_size_bytes,
            summary=d.summary,
            created_at=str(d.created_at),
            chunks_count=len(d.chunks) if hasattr(d, 'chunks') and d.chunks else 0
        ) for d in docs
    ]

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    content_bytes = await file.read()
    text_content = content_bytes.decode("utf-8", errors="ignore")
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "txt"

    doc = Document(
        user_id=user.id,
        filename=file.filename,
        file_type=ext,
        file_size_bytes=len(content_bytes),
        summary=f"Processed {len(text_content.split())} words."
    )
    db.add(doc)
    await db.flush()

    # Chunk and index into RAG vector space
    chunks_count = await rag_service.index_document(db, doc, text_content)

    return DocumentResponse(
        id=doc.id,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size_bytes=doc.file_size_bytes,
        summary=doc.summary,
        created_at=str(doc.created_at),
        chunks_count=chunks_count
    )

@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document).where(Document.id == doc_id, Document.user_id == user.id)
    res = await db.execute(stmt)
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    await db.delete(doc)
    await db.commit()
    return {"success": True, "message": f"Deleted document {doc.filename}"}
