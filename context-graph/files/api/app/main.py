"""Knowledge Graph - FastAPI Application"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.services.database import Database
from app.services.vector import VectorService
from app.services.embedding import EmbeddingService
from app.services.extraction import ExtractionService
from app.services.graph import GraphService
from app.auth import router as auth_router
from app.routers import projects, documents, knowledge, search, visualization, snapshots
from app.services.snapshot import SnapshotService

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)

log = structlog.get_logger()
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    log.info("Starting Knowledge Graph API")
    app.state.db = Database(settings)
    await app.state.db.connect()
    app.state.vector = VectorService(settings)
    app.state.embedding = EmbeddingService(settings)
    app.state.extraction = ExtractionService(settings)
    app.state.graph = GraphService(app.state.db)
    app.state.snapshot = SnapshotService(app.state.db, app.state.graph)
    await app.state.snapshot.ensure_table()
    log.info("Services initialized", postgres=settings.postgres_host, qdrant=settings.qdrant_host)
    yield
    log.info("Shutting down")
    await app.state.db.disconnect()


app = FastAPI(
    title=settings.app_name,
    description="Knowledge Graph API - Hybrid graph + vector search with RAG",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(documents.router, prefix="/api/v1/projects/{slug}/documents", tags=["documents"])
app.include_router(knowledge.router, prefix="/api/v1/projects/{slug}", tags=["knowledge"])
app.include_router(search.router, prefix="/api/v1/projects/{slug}/search", tags=["search"])
app.include_router(search.fanout_router, prefix="/api/v1/search", tags=["search"])
app.include_router(visualization.router, prefix="/api/v1/projects/{slug}/visualization", tags=["visualization"])
app.include_router(snapshots.router, prefix="/api/v1/projects/{slug}", tags=["snapshots"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.app_name, "version": "1.0.0"}


@app.get("/")
async def root():
    return {"name": settings.app_name, "version": "1.0.0", "docs": "/docs", "health": "/health"}
