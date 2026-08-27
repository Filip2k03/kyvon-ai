from sqlalchemy import String, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base, TimestampMixin

class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), default="New AI Workspace Session")
    model: Mapped[str] = mapped_column(String(100), default="ctoai-core")
    system_prompt: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base, TimestampMixin):
    __tablename__ = "messages"

    conversation_id: Mapped[str] = mapped_column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False) # user, assistant, system, tool
    content: Mapped[str] = mapped_column(Text, nullable=False)
    thinking: Mapped[str] = mapped_column(Text, nullable=True) # AI chain of thought
    token_count: Mapped[int] = mapped_column(default=0)
    meta_info: Mapped[dict] = mapped_column(JSON, default=dict)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
