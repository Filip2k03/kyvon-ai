from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AgentRunRequest(BaseModel):
    task: str
    max_steps: int = 5
    assigned_agents: Optional[List[str]] = ["planner", "research", "code", "review"]

class ToolRunResponse(BaseModel):
    id: str
    tool_name: str
    status: str
    duration_ms: float
    output_result: Optional[str] = None

class AgentRunResponse(BaseModel):
    id: str
    task_prompt: str
    status: str
    plan_steps: List[Dict[str, Any]] = []
    final_output: Optional[str] = None
    token_usage: int
    execution_time_seconds: float
    tool_runs: List[ToolRunResponse] = []
