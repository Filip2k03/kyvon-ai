from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.memory import MemoryItem

class MemoryService:
    async def get_active_memories(self, db: AsyncSession, user_id: str) -> List[MemoryItem]:
        stmt = select(MemoryItem).where(MemoryItem.user_id == user_id, MemoryItem.is_active == True)
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def add_memory(
        self, 
        db: AsyncSession, 
        user_id: str, 
        category: str, 
        key: str, 
        value: str,
        layer: str = "long_term"
    ) -> MemoryItem:
        memory = MemoryItem(
            user_id=user_id,
            category=category,
            layer=layer,
            key=key,
            value=value
        )
        db.add(memory)
        await db.commit()
        await db.refresh(memory)
        return memory

    async def construct_memory_context(self, db: AsyncSession, user_id: str) -> str:
        memories = await self.get_active_memories(db, user_id)
        if not memories:
            return ""
        
        lines = ["\n### 🧠 User Personal Memory & Context:"]
        for m in memories:
            lines.append(f"- [{m.category.upper()}] {m.key}: {m.value}")
        return "\n".join(lines) + "\n"

memory_service = MemoryService()
