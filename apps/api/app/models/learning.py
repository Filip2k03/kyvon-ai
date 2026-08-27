from sqlalchemy import String, ForeignKey, Text, Integer, Float, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base, TimestampMixin

class LearningPath(Base, TimestampMixin):
    __tablename__ = "learning_paths"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    target_skill: Mapped[str] = mapped_column(String(100), nullable=False)
    difficulty_level: Mapped[str] = mapped_column(String(50), default="intermediate") # beginner, intermediate, expert
    progress_percentage: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationships
    user = relationship("User", back_populates="learning_paths")
    topics = relationship("LearningTopic", back_populates="path", cascade="all, delete-orphan", order_by="LearningTopic.order_index")

class LearningTopic(Base, TimestampMixin):
    __tablename__ = "learning_topics"

    path_id: Mapped[str] = mapped_column(String(36), ForeignKey("learning_paths.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content_markdown: Mapped[str] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    prerequisites: Mapped[list] = mapped_column(JSON, default=list) # List of topic IDs or skill keys

    # Relationships
    path = relationship("LearningPath", back_populates="topics")
    quizzes = relationship("Quiz", back_populates="topic", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="topic", cascade="all, delete-orphan")

class Quiz(Base, TimestampMixin):
    __tablename__ = "quizzes"

    topic_id: Mapped[str] = mapped_column(String(36), ForeignKey("learning_topics.id", ondelete="CASCADE"), index=True)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list] = mapped_column(JSON, nullable=False) # ["Option A", "Option B", ...]
    correct_option_index: Mapped[int] = mapped_column(Integer, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    user_answered_index: Mapped[int] = mapped_column(Integer, nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=True)

    # Relationships
    topic = relationship("LearningTopic", back_populates="quizzes")

class Flashcard(Base, TimestampMixin):
    __tablename__ = "flashcards"

    topic_id: Mapped[str] = mapped_column(String(36), ForeignKey("learning_topics.id", ondelete="CASCADE"), index=True)
    front_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    back_solution: Mapped[str] = mapped_column(Text, nullable=False)
    repetition_interval_days: Mapped[int] = mapped_column(Integer, default=1)
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    topic = relationship("LearningTopic", back_populates="flashcards")
