from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.models.learning import LearningPath, Quiz
from app.schemas.learning import LearningPathCreate, LearningPathResponse, LearningTopicResponse, QuizResponse, FlashcardResponse, QuizSubmission
from app.api.v1.endpoints.auth import get_current_user
from app.services.learning_service import learning_service

router = APIRouter()

@router.get("/paths", response_model=list[LearningPathResponse])
async def list_learning_paths(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LearningPath).where(LearningPath.user_id == user.id).order_by(LearningPath.created_at.desc())
    res = await db.execute(stmt)
    paths = res.scalars().all()
    
    out = []
    for p in paths:
        topics_out = []
        for t in p.topics:
            quizzes_out = [
                QuizResponse(
                    id=q.id,
                    question=q.question,
                    options=q.options,
                    correct_option_index=q.correct_option_index,
                    explanation=q.explanation,
                    user_answered_index=q.user_answered_index,
                    is_correct=q.is_correct
                ) for q in t.quizzes
            ]
            flashcards_out = [
                FlashcardResponse(
                    id=fc.id,
                    front_prompt=fc.front_prompt,
                    back_solution=fc.back_solution,
                    reviews_count=fc.reviews_count
                ) for fc in t.flashcards
            ]
            topics_out.append(LearningTopicResponse(
                id=t.id,
                title=t.title,
                content_markdown=t.content_markdown,
                order_index=t.order_index,
                is_completed=t.is_completed,
                quizzes=quizzes_out,
                flashcards=flashcards_out
            ))
        out.append(LearningPathResponse(
            id=p.id,
            title=p.title,
            description=p.description,
            target_skill=p.target_skill,
            difficulty_level=p.difficulty_level,
            progress_percentage=p.progress_percentage,
            topics=topics_out
        ))
    return out

@router.post("/paths", response_model=LearningPathResponse)
async def create_learning_path(
    req: LearningPathCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    path = await learning_service.create_path(db, user.id, req.target_skill, req.difficulty_level)
    return LearningPathResponse(
        id=path.id,
        title=path.title,
        description=path.description,
        target_skill=path.target_skill,
        difficulty_level=path.difficulty_level,
        progress_percentage=path.progress_percentage,
        topics=[]
    )

@router.post("/quiz/submit")
async def submit_quiz(
    sub: QuizSubmission,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Quiz).where(Quiz.id == sub.quiz_id)
    res = await db.execute(stmt)
    quiz = res.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quiz.user_answered_index = sub.selected_option_index
    quiz.is_correct = (sub.selected_option_index == quiz.correct_option_index)
    await db.commit()

    return {
        "is_correct": quiz.is_correct,
        "correct_option_index": quiz.correct_option_index,
        "explanation": quiz.explanation
    }
