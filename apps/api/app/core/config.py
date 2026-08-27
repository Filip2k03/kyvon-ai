import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "KYVON AI Platform"
    VERSION: str = "2.2.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Security
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "kyvon_super_secret_jwt_key_for_development_purposes_only_2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ctoai.reiwasakura.tech",
        "https://thuyakyaw.com"
    ]
    
    # Database & Cache
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./kyvon_ai.db"  # Fallback to async SQLite for portable zero-setup execution
    )
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL", None)
    
    # AI Engine & Providers
    DEFAULT_AI_PROVIDER: str = os.getenv("DEFAULT_AI_PROVIDER", "local")  # local, openai, anthropic, mock
    LOCAL_VLLM_URL: str = os.getenv("LOCAL_VLLM_URL", "http://127.0.0.1:8000/v1")
    LOCAL_MODEL_NAME: str = os.getenv("LOCAL_MODEL_NAME", "ctoai-core")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY", None)
    
    # RAG & Memory
    EMBEDDING_DIM: int = 384  # Default MiniLM / local fast vector size
    DEFAULT_CHUNK_SIZE: int = 500
    DEFAULT_CHUNK_OVERLAP: int = 50

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
