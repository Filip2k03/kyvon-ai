from sqlalchemy import String, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base, TimestampMixin

class MemoryItem(Base, TimestampMixin):
    __tablename__ = "memories"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    category: Mapped[str] = mapped_column(String(50), index=True) # preferences, tech_stack, projects, goals, decisions, past_problems
    layer: Mapped[str] = mapped_column(String(50), default="long_term") # working, long_term, knowledge
    key: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    confidence: Mapped[float] = mapped_column(default=1.0)
    meta_info: Mapped[dict] = mapped_column(JSON, default=dict)

    # Relationships
    user = relationship("User", back_populates="memories")
