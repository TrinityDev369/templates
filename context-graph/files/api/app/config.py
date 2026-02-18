"""Knowledge Graph - Configuration"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Knowledge Graph"
    debug: bool = False

    # PostgreSQL + AGE
    postgres_host: str = "kg-postgres"
    postgres_port: int = 5432
    postgres_user: str = "knowledge"
    postgres_password: str = ""
    postgres_db: str = "knowledge"

    # Qdrant
    qdrant_host: str = "kg-qdrant"
    qdrant_port: int = 6333

    # Redis
    redis_host: str = "kg-redis"
    redis_port: int = 6379
    redis_password: str = ""

    # LLM
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    extraction_model: str = "claude-sonnet-4-20250514"
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536

    # Auth
    jwt_secret: str = ""

    # Chunking
    chunk_size: int = 500
    chunk_overlap: int = 50

    @property
    def postgres_dsn(self) -> str:
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    @property
    def async_postgres_dsn(self) -> str:
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
