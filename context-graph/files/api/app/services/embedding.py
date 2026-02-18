"""Embedding service using OpenAI"""

from typing import Optional

from openai import AsyncOpenAI
import structlog

from app.config import Settings

log = structlog.get_logger()


class EmbeddingService:
    """Service for generating text embeddings."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.client: Optional[AsyncOpenAI] = None
        self.model = settings.embedding_model
        self.dimension = settings.embedding_dimensions

        if settings.openai_api_key:
            self.client = AsyncOpenAI(api_key=settings.openai_api_key)

    async def embed_text(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        if not self.client:
            log.warning("OpenAI client not configured, returning zero vector")
            return [0.0] * self.dimension

        response = await self.client.embeddings.create(
            model=self.model,
            input=text,
        )

        return response.data[0].embedding

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        if not self.client:
            log.warning("OpenAI client not configured, returning zero vectors")
            return [[0.0] * self.dimension for _ in texts]

        # OpenAI supports batch embedding
        response = await self.client.embeddings.create(
            model=self.model,
            input=texts,
        )

        # Sort by index to maintain order
        sorted_embeddings = sorted(response.data, key=lambda x: x.index)
        return [e.embedding for e in sorted_embeddings]
