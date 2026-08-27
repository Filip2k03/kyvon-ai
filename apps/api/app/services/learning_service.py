from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.learning import LearningPath, LearningTopic, Quiz, Flashcard

class LearningService:
    async def create_path(
        self, 
        db: AsyncSession, 
        user_id: str, 
        target_skill: str, 
        difficulty: str = "intermediate"
    ) -> LearningPath:
        path = LearningPath(
            user_id=user_id,
            title=f"Mastery Roadmap: {target_skill}",
            description=f"Structured {difficulty}-level mastery path for {target_skill} with quizzes, flashcards, and AST code examples.",
            target_skill=target_skill,
            difficulty_level=difficulty,
            progress_percentage=0.0
        )
        db.add(path)
        await db.flush()

        # Seed initial 3 core topics
        topics_data = [
            {
                "title": f"1. Foundations & Architecture of {target_skill}",
                "content": f"### Foundations of {target_skill}\n\nKey principles, execution model, memory layout, and runtime mechanics.",
                "order": 0,
                "quiz": {
                    "question": f"What is the primary architectural invariant in {target_skill}?",
                    "options": ["Deterministic memory management", "Global lock contention", "Unbounded heap allocations", "Single-threaded blocking IO"],
                    "correct": 0,
                    "explanation": "Deterministic memory management guarantees asymptotic latency bounds and prevents garbage collection pauses."
                },
                "flashcard": {
                    "front": f"What is the hot-path complexity bound in {target_skill}?",
                    "back": "O(1) lookups and lock-free atomic channels."
                }
            },
            {
                "title": f"2. Production Patterns & Error Handling in {target_skill}",
                "content": f"### Production Patterns\n\nDesigning resilient services, graceful degradation, and structured exception handling.",
                "order": 1,
                "quiz": {
                    "question": "How should unexpected runtime failures be handled in production services?",
                    "options": ["Silent swallow", "Structured logging with error codes and graceful drain", "Immediate process abort without cleanup", "Infinite retry loop"],
                    "correct": 1,
                    "explanation": "Graceful draining allows active requests to complete while logging structured telemetry for diagnostics."
                },
                "flashcard": {
                    "front": "What prevents cascading failures in distributed backends?",
                    "back": "Circuit breakers and exponential backoff with jitter."
                }
            },
            {
                "title": f"3. Advanced Optimization & Performance Tuning in {target_skill}",
                "content": f"### High-Throughput Optimization\n\nCache-line alignment, zero-copy streams, and SIMD/vectorized computation.",
                "order": 2,
                "quiz": {
                    "question": "Why is 64-byte padding added to concurrent ring buffer pointers?",
                    "options": ["To increase payload size", "To prevent CPU cache-line false sharing", "To enforce Big-Endian byte order", "To satisfy JSON parsers"],
                    "correct": 1,
                    "explanation": "64-byte padding isolates variables to separate CPU L1 cache lines, eliminating multi-core false sharing contention."
                },
                "flashcard": {
                    "front": "What causes CPU cache false sharing?",
                    "back": "Independent threads modifying distinct variables located on the same 64-byte cache line."
                }
            }
        ]

        for t_info in topics_data:
            topic = LearningTopic(
                path_id=path.id,
                title=t_info["title"],
                content_markdown=t_info["content"],
                order_index=t_info["order"]
            )
            db.add(topic)
            await db.flush()

            q_data = t_info["quiz"]
            quiz = Quiz(
                topic_id=topic.id,
                question=q_data["question"],
                options=q_data["options"],
                correct_option_index=q_data["correct"],
                explanation=q_data["explanation"]
            )
            db.add(quiz)

            fc_data = t_info["flashcard"]
            fc = Flashcard(
                topic_id=topic.id,
                front_prompt=fc_data["front"],
                back_solution=fc_data["back"]
            )
            db.add(fc)

        await db.commit()
        await db.refresh(path)
        return path

learning_service = LearningService()
