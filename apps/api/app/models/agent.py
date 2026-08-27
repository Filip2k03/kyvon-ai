from sqlalchemy import String, ForeignKey, Text, Integer, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base, TimestampMixin

class AgentRun(Base, TimestampMixin):
    __tablename__ = "agent_runs"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    task_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="running") # running, completed, failed, timeout
    plan_steps: Mapped[list] = mapped_column(JSON, default=list)
    final_output: Mapped[str] = mapped_column(Text, nullable=True)
    token_usage: Mapped[int] = mapped_column(Integer, default=0)
    execution_time_seconds: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationships
    user = relationship("User", back_populates="agent_runs")
    tool_runs = relationship("ToolRun", back_populates="agent_run", cascade="all, delete-orphan")

class ToolRun(Base, TimestampMixin):
    __tablename__ = "tool_runs"

    agent_run_id: Mapped[str] = mapped_column(String(36), ForeignKey("agent_runs.id", ondelete="CASCADE"), index=True)
    tool_name: Mapped[str] = mapped_column(String(100), nullable=False)
    input_args: Mapped[dict] = mapped_column(JSON, default=dict)
    output_result: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="success") # success, error
    duration_ms: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationships
    agent_run = relationship("AgentRun", back_populates="tool_runs")

class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    user_id: Mapped[str] = mapped_column(String(36), index=True, nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_id: Mapped[str] = mapped_column(String(36), nullable=True)
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    ip_address: Mapped[str] = mapped_column(String(50), nullable=True)
