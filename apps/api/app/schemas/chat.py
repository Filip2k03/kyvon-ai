from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class MessageCreate(BaseModel):
    content: str
    role: str = "user"
    model: Optional[str] = "ctoai-core"
    use_rag: bool = False
    use_memory: bool = True

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    thinking: Optional[str] = None
    created_at: str
    meta_info: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    title: Optional[str] = "New AI Workspace Session"
    model: Optional[str] = "ctoai-core"
    system_prompt: Optional[str] = None

class ConversationResponse(BaseModel):
    id: str
    title: str
    model: str
    created_at: str
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
