from pydantic import BaseModel
from typing import List, Optional

class QuizSubmission(BaseModel):
    quiz_id: str
    selected_option_index: int

class QuizResponse(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_option_index: Optional[int] = None
    explanation: Optional[str] = None
    user_answered_index: Optional[int] = None
    is_correct: Optional[bool] = None

class FlashcardResponse(BaseModel):
    id: str
    front_prompt: str
    back_solution: str
    reviews_count: int

class LearningTopicResponse(BaseModel):
    id: str
    title: str
    content_markdown: Optional[str] = None
    order_index: int
    is_completed: bool
    quizzes: List[QuizResponse] = []
    flashcards: List[FlashcardResponse] = []

class LearningPathCreate(BaseModel):
    target_skill: str
    difficulty_level: str = "intermediate"

class LearningPathResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    target_skill: str
    difficulty_level: str
    progress_percentage: float
    topics: List[LearningTopicResponse] = []
