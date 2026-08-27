from sqlalchemy import String, ForeignKey, Text, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base, TimestampMixin

class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False) # pdf, md, txt, py, ts, json
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    meta_data: Mapped[dict] = mapped_column(JSON, default=dict)

    # Relationships
    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base, TimestampMixin):
    __tablename__ = "document_chunks"

    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list] = mapped_column(JSON, nullable=True) # Stored as JSON float vector for portable DB compatibility
    token_count: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    document = relationship("Document", back_populates="chunks")
