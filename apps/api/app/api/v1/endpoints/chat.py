from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.schemas.chat import ConversationCreate, ConversationResponse, MessageCreate, MessageResponse
from app.api.v1.endpoints.auth import get_current_user
from app.services.ai_provider import get_ai_provider
from app.services.rag_service import rag_service
from app.services.memory_service import memory_service

router = APIRouter()

@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Conversation).where(Conversation.user_id == user.id).order_by(Conversation.updated_at.desc())
    res = await db.execute(stmt)
    convs = res.scalars().all()
    
    out = []
    for c in convs:
        out.append(ConversationResponse(
            id=c.id,
            title=c.title,
            model=c.model,
            created_at=str(c.created_at),
            messages=[]
        ))
    return out

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    req: ConversationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    conv = Conversation(
        user_id=user.id,
        title=req.title or "New Workspace Session",
        model=req.model or "ctoai-core",
        system_prompt=req.system_prompt
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        model=conv.model,
        created_at=str(conv.created_at),
        messages=[]
    )

@router.get("/conversations/{conv_id}", response_model=ConversationResponse)
async def get_conversation(
    conv_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Conversation).where(Conversation.id == conv_id, Conversation.user_id == user.id)
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    stmt_msgs = select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at)
    res_msgs = await db.execute(stmt_msgs)
    msgs = res_msgs.scalars().all()

    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        model=conv.model,
        created_at=str(conv.created_at),
        messages=[
            MessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                thinking=m.thinking,
                created_at=str(m.created_at),
                meta_info=m.meta_info or {}
            ) for m in msgs
        ]
    )

@router.post("/conversations/{conv_id}/messages")
async def send_message(
    conv_id: str,
    req: MessageCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Conversation).where(Conversation.id == conv_id, Conversation.user_id == user.id)
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Save User message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=req.content
    )
    db.add(user_msg)
    await db.commit()

    # Context enrichment: RAG + Memory
    system_context = "You are KYVON AI, an autonomous CTO, senior engineer, and personal second brain."
    if req.use_memory:
        mem_ctx = await memory_service.construct_memory_context(db, user.id)
        if mem_ctx:
            system_context += f"\n{mem_ctx}"
            
    if req.use_rag:
        rag_hits = await rag_service.search_similar_chunks(db, user.id, req.content, top_k=3)
        if rag_hits:
            system_context += "\n\n### 📁 Retrieved Knowledge Base Context:\n"
            for hit in rag_hits:
                system_context += f"- [{hit['filename']}] {hit['content'][:400]}...\n"

    # Assemble messages payload
    messages_payload = [
        {"role": "system", "content": system_context},
        {"role": "user", "content": req.content}
    ]

    ai_provider = get_ai_provider()
    ai_result = await ai_provider.generate_response(messages_payload, model=req.model or conv.model)

    # Save Assistant message
    assistant_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=ai_result["content"],
        thinking=ai_result.get("thinking"),
        meta_info={"token_usage": ai_result.get("token_usage", 0)}
    )
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(assistant_msg)

    return MessageResponse(
        id=assistant_msg.id,
        conversation_id=assistant_msg.conversation_id,
        role=assistant_msg.role,
        content=assistant_msg.content,
        thinking=assistant_msg.thinking,
        created_at=str(assistant_msg.created_at),
        meta_info=assistant_msg.meta_info or {}
    )
