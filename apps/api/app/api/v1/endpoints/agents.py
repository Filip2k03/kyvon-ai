from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.models.agent import AgentRun
from app.schemas.agent import AgentRunRequest, AgentRunResponse, ToolRunResponse
from app.api.v1.endpoints.auth import get_current_user
from app.services.agent_orchestrator import agent_orchestrator

router = APIRouter()

@router.post("/run", response_model=AgentRunResponse)
async def run_agent_pipeline(
    req: AgentRunRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    run = await agent_orchestrator.run_pipeline(db, user.id, req.task, req.max_steps)
    return AgentRunResponse(
        id=run.id,
        task_prompt=run.task_prompt,
        status=run.status,
        plan_steps=run.plan_steps,
        final_output=run.final_output,
        token_usage=run.token_usage,
        execution_time_seconds=run.execution_time_seconds,
        tool_runs=[
            ToolRunResponse(
                id=tr.id,
                tool_name=tr.tool_name,
                status=tr.status,
                duration_ms=tr.duration_ms,
                output_result=tr.output_result
            ) for tr in run.tool_runs
        ]
    )

@router.get("/runs/{run_id}", response_model=AgentRunResponse)
async def get_agent_run(
    run_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AgentRun).where(AgentRun.id == run_id, AgentRun.user_id == user.id)
    res = await db.execute(stmt)
    run = res.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Agent run not found")
    
    return AgentRunResponse(
        id=run.id,
        task_prompt=run.task_prompt,
        status=run.status,
        plan_steps=run.plan_steps,
        final_output=run.final_output,
        token_usage=run.token_usage,
        execution_time_seconds=run.execution_time_seconds,
        tool_runs=[
            ToolRunResponse(
                id=tr.id,
                tool_name=tr.tool_name,
                status=tr.status,
                duration_ms=tr.duration_ms,
                output_result=tr.output_result
            ) for tr in run.tool_runs
        ]
    )
