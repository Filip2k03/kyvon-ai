from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.models.memory import MemoryItem
from app.schemas.memory import MemoryCreate, MemoryResponse
from app.api.v1.endpoints.auth import get_current_user
from app.services.memory_service import memory_service

router = APIRouter()

@router.get("/", response_model=list[MemoryResponse])
async def list_memories(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    memories = await memory_service.get_active_memories(db, user.id)
    return [
        MemoryResponse(
            id=m.id,
            category=m.category,
            layer=m.layer,
            key=m.key,
            value=m.value,
            is_active=m.is_active,
            confidence=m.confidence,
            created_at=str(m.created_at)
        ) for m in memories
    ]

@router.post("/", response_model=MemoryResponse)
async def create_memory(
    req: MemoryCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    memory = await memory_service.add_memory(
        db, user.id, req.category, req.key, req.value, req.layer
    )
    return MemoryResponse(
        id=memory.id,
        category=memory.category,
        layer=memory.layer,
        key=memory.key,
        value=memory.value,
        is_active=memory.is_active,
        confidence=memory.confidence,
        created_at=str(memory.created_at)
    )

@router.delete("/{memory_id}")
async def delete_memory(
    memory_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(MemoryItem).where(MemoryItem.id == memory_id, MemoryItem.user_id == user.id)
    res = await db.execute(stmt)
    m = res.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Memory item not found")
    
    await db.delete(m)
    await db.commit()
    return {"success": True, "message": f"Deleted memory: {m.key}"}
