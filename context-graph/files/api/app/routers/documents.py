"""Documents API router"""

import json
import time
from typing import Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Request, status
from psycopg.types.json import Jsonb
import structlog

from app.models.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentListResponse,
    ProcessDocumentResponse,
)
from app.services.chunking import ChunkingService

log = structlog.get_logger()

router = APIRouter()


async def get_project_id(db, slug: str) -> UUID:
    """Get project ID from slug, raise 404 if not found."""
    row = await db.fetch_one(
        "SELECT id, graph_name FROM public.projects WHERE slug = %s",
        (slug,)
    )
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{slug}' not found"
        )
    return row["id"], row["graph_name"]


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    slug: str,
    request: Request,
    content_type: Optional[str] = None,
    processed: Optional[bool] = None,
    limit: int = 100,
    offset: int = 0,
):
    """List documents in a project."""
    db = request.app.state.db
    project_id, _ = await get_project_id(db, slug)

    # Build query with filters
    query = "SELECT * FROM public.documents WHERE project_id = %s"
    params = [project_id]

    if content_type:
        query += " AND content_type = %s"
        params.append(content_type)

    if processed is not None:
        query += " AND processed = %s"
        params.append(processed)

    query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    rows = await db.fetch_all(query, tuple(params))

    documents = []
    for row in rows:
        # Get chunk count
        chunk_count = await db.fetch_one(
            "SELECT COUNT(*) as count FROM public.chunks WHERE document_id = %s",
            (row["id"],)
        )

        documents.append(
            DocumentResponse(
                id=row["id"],
                filename=row["filename"],
                content_type=row["content_type"],
                source_url=row["source_url"],
                metadata=row["metadata"] or {},
                processed=row["processed"],
                processed_at=row["processed_at"],
                error_message=row["error_message"],
                created_at=row["created_at"],
                chunk_count=chunk_count["count"] if chunk_count else 0,
            )
        )

    # Get total count
    count_row = await db.fetch_one(
        "SELECT COUNT(*) as total FROM public.documents WHERE project_id = %s",
        (project_id,)
    )

    return DocumentListResponse(
        documents=documents,
        total=count_row["total"] if count_row else 0
    )


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(slug: str, document: DocumentCreate, request: Request):
    """Upload a new document."""
    db = request.app.state.db
    project_id, _ = await get_project_id(db, slug)

    row = await db.fetch_one(
        """
        INSERT INTO public.documents (project_id, filename, content_type, source_url, raw_content, metadata)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING *
        """,
        (
            project_id,
            document.filename,
            document.content_type,
            document.source_url,
            document.raw_content,
            Jsonb(document.metadata) if document.metadata else None,
        )
    )

    return DocumentResponse(
        id=row["id"],
        filename=row["filename"],
        content_type=row["content_type"],
        source_url=row["source_url"],
        metadata=row["metadata"] or {},
        processed=row["processed"],
        processed_at=row["processed_at"],
        error_message=row["error_message"],
        created_at=row["created_at"],
    )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(slug: str, document_id: UUID, request: Request):
    """Get a document by ID."""
    db = request.app.state.db
    project_id, _ = await get_project_id(db, slug)

    row = await db.fetch_one(
        "SELECT * FROM public.documents WHERE id = %s AND project_id = %s",
        (document_id, project_id)
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found"
        )

    # Get chunk count
    chunk_count = await db.fetch_one(
        "SELECT COUNT(*) as count FROM public.chunks WHERE document_id = %s",
        (document_id,)
    )

    return DocumentResponse(
        id=row["id"],
        filename=row["filename"],
        content_type=row["content_type"],
        source_url=row["source_url"],
        metadata=row["metadata"] or {},
        processed=row["processed"],
        processed_at=row["processed_at"],
        error_message=row["error_message"],
        created_at=row["created_at"],
        chunk_count=chunk_count["count"] if chunk_count else 0,
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(slug: str, document_id: UUID, request: Request):
    """Delete a document and its chunks."""
    db = request.app.state.db
    vector = request.app.state.vector
    project_id, _ = await get_project_id(db, slug)

    # Verify document exists
    row = await db.fetch_one(
        "SELECT id FROM public.documents WHERE id = %s AND project_id = %s",
        (document_id, project_id)
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found"
        )

    # Delete from Qdrant
    await vector.delete_by_document(slug, document_id)

    # Delete from database (cascades to chunks)
    await db.execute(
        "DELETE FROM public.documents WHERE id = %s",
        (document_id,)
    )

    return None


@router.post("/{document_id}/process", response_model=ProcessDocumentResponse)
async def process_document(slug: str, document_id: UUID, request: Request):
    """
    Trigger extraction pipeline for a document.

    Phase 1 (implemented): Chunking + Embeddings
    - Splits document into chunks
    - Generates embeddings via OpenAI
    - Stores in Qdrant for semantic search

    Phase 2 (TODO): Entity Extraction
    - Extract entities via Claude
    - Store entities/relationships in AGE graph
    """
    start_time = time.time()

    db = request.app.state.db
    vector = request.app.state.vector
    embedding = request.app.state.embedding
    project_id, graph_name = await get_project_id(db, slug)

    # Get document
    row = await db.fetch_one(
        "SELECT * FROM public.documents WHERE id = %s AND project_id = %s",
        (document_id, project_id)
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found"
        )

    raw_content = row["raw_content"]
    content_type = row["content_type"]

    if not raw_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document has no content to process"
        )

    try:
        # Clean up existing chunks for this document (supports re-processing)
        existing_chunks = await db.fetch_all(
            "SELECT qdrant_point_id FROM public.chunks WHERE document_id = %s",
            (document_id,)
        )

        if existing_chunks:
            # Delete from Qdrant
            point_ids = [row["qdrant_point_id"] for row in existing_chunks if row["qdrant_point_id"]]
            if point_ids:
                try:
                    await vector.delete_points(slug, point_ids)
                    log.info("Deleted existing Qdrant points", document_id=str(document_id), count=len(point_ids))
                except Exception as e:
                    log.warning("Failed to delete Qdrant points", error=str(e))

            # Delete from database
            await db.execute(
                "DELETE FROM public.chunks WHERE document_id = %s",
                (document_id,)
            )
            log.info("Deleted existing chunks", document_id=str(document_id), count=len(existing_chunks))

        # Phase 1: Chunking
        chunker = ChunkingService(chunk_size=500, chunk_overlap=50)
        chunks = chunker.chunk_text(raw_content)

        log.info(
            "Document chunked",
            document_id=str(document_id),
            num_chunks=len(chunks),
        )

        if not chunks:
            # Mark as processed with no chunks
            await db.execute(
                """
                UPDATE public.documents
                SET processed = true, processed_at = NOW(), error_message = NULL
                WHERE id = %s
                """,
                (document_id,)
            )
            return ProcessDocumentResponse(
                document_id=document_id,
                chunks_created=0,
                entities_extracted=0,
                relationships_created=0,
                duration_ms=int((time.time() - start_time) * 1000),
            )

        # Phase 1: Generate embeddings
        chunk_texts = [c.content for c in chunks]
        embeddings = await embedding.embed_texts(chunk_texts)

        log.info(
            "Embeddings generated",
            document_id=str(document_id),
            num_embeddings=len(embeddings),
        )

        # Phase 1: Store chunks in database
        chunk_records = []
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            chunk_id = uuid4()

            # Insert into database
            await db.execute(
                """
                INSERT INTO public.chunks (id, document_id, content, chunk_index, token_count, qdrant_point_id, metadata)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    chunk_id,
                    document_id,
                    chunk.content,
                    chunk.index,
                    chunk.token_count,
                    str(chunk_id),  # Use same ID for Qdrant
                    Jsonb({"start_char": chunk.start_char, "end_char": chunk.end_char}),
                )
            )

            chunk_records.append({
                "id": chunk_id,
                "document_id": document_id,
                "content": chunk.content,
                "content_type": content_type,
                "chunk_index": chunk.index,
                "metadata": {"filename": row["filename"]},
            })

        # Phase 1: Store in Qdrant
        await vector.upsert_chunks(slug, chunk_records, embeddings)

        log.info(
            "Chunks stored in Qdrant",
            document_id=str(document_id),
            collection=f"project_{slug}_chunks",
        )

        # Mark document as processed
        await db.execute(
            """
            UPDATE public.documents
            SET processed = true, processed_at = NOW(), error_message = NULL
            WHERE id = %s
            """,
            (document_id,)
        )

        log.info(
            "Phase 1 complete - chunks stored",
            document_id=str(document_id),
            chunks_created=len(chunks),
        )

        # Phase 2: Entity extraction via Claude
        entities_extracted = 0
        relationships_created = 0

        extraction = request.app.state.extraction
        graph = request.app.state.graph

        if extraction.client:  # Only if Anthropic API is configured
            try:
                chunk_texts = [c.content for c in chunks]
                extraction_result = await extraction.extract_from_document(
                    chunks=chunk_texts,
                    content_type=content_type,
                    context={"filename": row["filename"], "document_id": str(document_id)},
                )

                log.info(
                    "Entities extracted",
                    document_id=str(document_id),
                    entities=len(extraction_result.entities),
                    relationships=len(extraction_result.relationships),
                )

                # Store entities in graph
                entity_id_map = {}  # temp_id -> graph_id
                for entity in extraction_result.entities:
                    from app.models.entity import EntityCreate
                    entity_create = EntityCreate(
                        name=entity.name,
                        type=entity.type,
                        properties={
                            **entity.properties,
                            "document_id": str(document_id),
                            "source": row["filename"],
                        },
                    )
                    result = await graph.create_entity(graph_name, entity_create)
                    if result:
                        entity_id_map[entity.temp_id] = result.get("id")
                        entities_extracted += 1

                # Store relationships in graph
                for rel in extraction_result.relationships:
                    source_id = entity_id_map.get(rel.source)
                    target_id = entity_id_map.get(rel.target)
                    if source_id and target_id:
                        from app.models.entity import RelationshipCreate
                        rel_create = RelationshipCreate(
                            source_id=source_id,
                            target_id=target_id,
                            type=rel.type,
                            properties=rel.properties,
                        )
                        result = await graph.create_relationship(graph_name, rel_create)
                        if result:
                            relationships_created += 1

                log.info(
                    "Graph updated",
                    document_id=str(document_id),
                    entities_stored=entities_extracted,
                    relationships_stored=relationships_created,
                )

            except Exception as e:
                log.warning(
                    "Entity extraction failed, continuing without graph",
                    document_id=str(document_id),
                    error=str(e),
                )
        else:
            log.info("Skipping entity extraction - Anthropic API not configured")

        duration_ms = int((time.time() - start_time) * 1000)

        return ProcessDocumentResponse(
            document_id=document_id,
            chunks_created=len(chunks),
            entities_extracted=entities_extracted,
            relationships_created=relationships_created,
            duration_ms=duration_ms,
        )

    except Exception as e:
        log.error(
            "Document processing failed",
            document_id=str(document_id),
            error=str(e),
        )

        # Store error message
        await db.execute(
            """
            UPDATE public.documents
            SET processed = false, error_message = %s
            WHERE id = %s
            """,
            (str(e), document_id)
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing failed: {str(e)}"
        )
