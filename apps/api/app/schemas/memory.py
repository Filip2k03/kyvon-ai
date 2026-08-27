from pydantic import BaseModel
from typing import Optional, Dict, Any

class MemoryCreate(BaseModel):
    category: str # preferences, tech_stack, projects, goals, decisions, past_problems
    layer: str = "long_term"
    key: str
    value: str
    confidence: float = 1.0

class MemoryResponse(BaseModel):
    id: str
    category: str
    layer: str
    key: str
    value: str
    is_active: bool
    confidence: float
    created_at: str

    class Config:
        from_attributes = True
