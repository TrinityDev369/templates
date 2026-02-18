"""Entity extraction service using Claude (Anthropic API).

This service extracts entities and relationships from text chunks using
Claude's language understanding capabilities. It supports different content
types with tailored extraction prompts for optimal results.
"""

from typing import Optional
from dataclasses import dataclass, field
import json
import re
from uuid import uuid4

import structlog
from anthropic import AsyncAnthropic

from app.config import Settings
from app.models.document import ContentType
from app.models.entity import EntityType, RelationshipType

log = structlog.get_logger()


# ---------------------------------------------------------------------------
# Data Classes for Extraction Results
# ---------------------------------------------------------------------------


@dataclass
class ExtractedEntity:
    """An entity extracted from text."""

    temp_id: str
    name: str
    type: EntityType
    properties: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "temp_id": self.temp_id,
            "name": self.name,
            "type": self.type,
            "properties": self.properties,
        }


@dataclass
class ExtractedRelationship:
    """A relationship extracted from text."""

    source: str  # temp_id of source entity
    target: str  # temp_id of target entity
    type: RelationshipType
    properties: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "source": self.source,
            "target": self.target,
            "type": self.type,
            "properties": self.properties,
        }


@dataclass
class ExtractionResult:
    """Result of entity extraction from a single chunk."""

    entities: list[ExtractedEntity]
    relationships: list[ExtractedRelationship]
    tokens_used: int = 0
    model: str = ""

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "entities": [e.to_dict() for e in self.entities],
            "relationships": [r.to_dict() for r in self.relationships],
            "tokens_used": self.tokens_used,
            "model": self.model,
        }


@dataclass
class DocumentExtractionResult:
    """Result of entity extraction from an entire document."""

    entities: list[ExtractedEntity]
    relationships: list[ExtractedRelationship]
    total_tokens_used: int
    chunks_processed: int
    deduplicated_count: int  # Number of entities removed by deduplication

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "entities": [e.to_dict() for e in self.entities],
            "relationships": [r.to_dict() for r in self.relationships],
            "total_tokens_used": self.total_tokens_used,
            "chunks_processed": self.chunks_processed,
            "deduplicated_count": self.deduplicated_count,
        }


# ---------------------------------------------------------------------------
# Content Type Extraction Prompts
# ---------------------------------------------------------------------------


EXTRACTION_PROMPTS: dict[ContentType, str] = {
    "spec": """You are an expert at extracting structured knowledge from technical specifications and requirements documents.

Extract entities and relationships from the following text.

## Entity Types to Extract:
- **Requirement**: Named requirements with priority, status, acceptance criteria
- **Feature**: Product features with descriptions and status
- **Component**: Technical components referenced in requirements
- **Person**: Stakeholders, owners, or team members mentioned

## Relationship Types:
- REQUIRES: One item requires another (Feature REQUIRES Requirement)
- IMPLEMENTS: Component implements a feature
- DEPENDS_ON: Dependency between items
- CREATED_BY: Authorship/ownership
- RELATED_TO: General association

## Guidelines:
- Extract specific, named entities (not generic concepts)
- Capture acceptance criteria as properties of Requirements
- Note priorities (P0, P1, high, medium, low) in properties
- Link features to their requirements
- Identify stakeholders and their ownership""",

    "component": """You are an expert at extracting structured knowledge from UI component code and documentation.

Extract entities and relationships from the following text.

## Entity Types to Extract:
- **Component**: UI components (name, type, description, file_path)
- **API**: Props, hooks, functions, methods exposed by components
- **DesignToken**: Design tokens used (colors, spacing, typography)

## Relationship Types:
- USES: Component uses another component or token
- EXTENDS: Component extends/inherits from another
- IMPLEMENTS: Component implements an interface/pattern
- DEPENDS_ON: Technical dependency

## Guidelines:
- Extract component names from imports, exports, and function definitions
- Capture props as API entities with their types
- Identify design tokens from style definitions
- Note file paths when available
- Track component composition (parent-child relationships)""",

    "contract": """You are an expert at extracting structured knowledge from legal contracts and agreements.

Extract entities and relationships from the following text.

## Entity Types to Extract:
- **Contract**: Named agreements with parties, dates, status
- **Person**: Parties, signatories, representatives (with organization)
- **Concept**: Legal terms, definitions, clauses worth capturing

## Relationship Types:
- REFERENCES: Contract references a person or concept
- DEFINES: Contract defines a concept/term
- REQUIRES: Obligation or requirement relationship

## Guidelines:
- Extract party names with their roles (e.g., "Licensor", "Licensee")
- Capture effective dates, termination dates in properties
- Extract defined terms as Concept entities
- Note monetary values and percentages in properties
- Identify obligations and link them to responsible parties""",

    "design_token": """You are an expert at extracting structured knowledge from design system documentation.

Extract entities and relationships from the following text.

## Entity Types to Extract:
- **DesignToken**: Design tokens (name, value, category, css_var)
- **Component**: Components that use or define tokens

## Relationship Types:
- USES: Component uses a token
- DEFINES: Document/component defines a token
- EXTENDS: Token extends/derives from another
- RELATED_TO: Semantic relationship between tokens

## Guidelines:
- Extract token names with their values (colors, spacing, typography)
- Identify CSS variable names (--token-name)
- Group tokens by category (color, spacing, typography, shadow)
- Link components to the tokens they use
- Note semantic relationships (primary-color relates to brand)""",

    "note": """You are an expert at extracting structured knowledge from general notes and documentation.

Extract entities and relationships from the following text.

## Entity Types to Extract:
- **Concept**: Key ideas, terms, or patterns mentioned
- **Component**: Technical components referenced
- **Person**: People mentioned
- **Feature**: Features or capabilities discussed

## Relationship Types:
- RELATED_TO: General association
- REFERENCES: One item references another
- DEPENDS_ON: Dependencies

## Guidelines:
- Extract named concepts that would be valuable to search for later
- Be selective - only extract entities that are significant
- Capture context in properties where useful
- Link related concepts together""",

    "general": """You are an expert at extracting structured knowledge from documents.

Extract entities and relationships from the following text.

## Entity Types to Extract:
- **Concept**: Key ideas or terms
- **Component**: Technical components
- **Person**: People mentioned
- **Document**: Referenced documents

## Relationship Types:
- RELATED_TO: General association
- REFERENCES: Citation or mention
- DEPENDS_ON: Dependencies

## Guidelines:
- Be selective about what you extract
- Focus on named entities that would be useful to search
- Capture relevant context in properties""",
}


# JSON schema for extraction response
EXTRACTION_RESPONSE_SCHEMA = """
## Response Format

You must respond with valid JSON in exactly this format:

```json
{
  "entities": [
    {
      "temp_id": "e1",
      "name": "Entity Name",
      "type": "EntityType",
      "properties": {
        "description": "Optional description",
        "key": "value"
      }
    }
  ],
  "relationships": [
    {
      "source": "e1",
      "target": "e2",
      "type": "RELATIONSHIP_TYPE",
      "properties": {
        "context": "optional context"
      }
    }
  ]
}
```

## Important:
- temp_id must be unique within the response (e1, e2, e3...)
- Relationships use temp_ids to reference entities
- Only use the entity and relationship types specified above
- If no entities found, return empty arrays
- Return ONLY the JSON, no other text
"""


# ---------------------------------------------------------------------------
# Extraction Service
# ---------------------------------------------------------------------------


class ExtractionService:
    """Service for extracting entities and relationships from text using Claude."""

    def __init__(self, settings: Settings):
        """Initialize the extraction service.

        Args:
            settings: Application settings containing API keys and model config
        """
        self.settings = settings
        self.client: Optional[AsyncAnthropic] = None
        self.model = settings.extraction_model

        if settings.anthropic_api_key:
            self.client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        else:
            log.warning("Anthropic API key not configured, extraction will be disabled")

    async def extract_from_chunk(
        self,
        text: str,
        content_type: ContentType,
        context: Optional[dict] = None,
    ) -> ExtractionResult:
        """Extract entities and relationships from a text chunk.

        Args:
            text: The text content to extract from
            content_type: Type of content (spec, component, contract, etc.)
            context: Optional context (e.g., document filename, project info)

        Returns:
            ExtractionResult with entities and relationships
        """
        if not self.client:
            log.warning("Extraction skipped: Anthropic client not configured")
            return ExtractionResult(entities=[], relationships=[], tokens_used=0)

        if not text or not text.strip():
            return ExtractionResult(entities=[], relationships=[], tokens_used=0)

        # Build the prompt
        system_prompt = EXTRACTION_PROMPTS.get(content_type, EXTRACTION_PROMPTS["general"])
        system_prompt += "\n\n" + EXTRACTION_RESPONSE_SCHEMA

        # Add context if provided
        user_message = f"## Text to Extract From:\n\n{text}"
        if context:
            context_str = "\n".join(f"- {k}: {v}" for k, v in context.items())
            user_message = f"## Context:\n{context_str}\n\n{user_message}"

        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[
                    {"role": "user", "content": user_message}
                ],
                system=system_prompt,
            )

            # Extract the response text
            response_text = response.content[0].text if response.content else ""

            # Calculate tokens used
            tokens_used = (response.usage.input_tokens or 0) + (response.usage.output_tokens or 0)

            # Parse the JSON response
            result = self._parse_extraction_response(response_text)
            result.tokens_used = tokens_used
            result.model = self.model

            log.info(
                "Extraction completed",
                content_type=content_type,
                entities_count=len(result.entities),
                relationships_count=len(result.relationships),
                tokens_used=tokens_used,
            )

            return result

        except Exception as e:
            log.error(
                "Extraction failed",
                error=str(e),
                content_type=content_type,
            )
            raise

    def _parse_extraction_response(self, response_text: str) -> ExtractionResult:
        """Parse the JSON response from Claude into ExtractionResult.

        Args:
            response_text: Raw text response from Claude

        Returns:
            ExtractionResult parsed from the response
        """
        # Try to extract JSON from the response
        # Handle case where response might have markdown code blocks
        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", response_text)
        if json_match:
            json_str = json_match.group(1).strip()
        else:
            # Assume the entire response is JSON
            json_str = response_text.strip()

        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            log.warning(
                "Failed to parse extraction response as JSON",
                error=str(e),
                response_preview=response_text[:200],
            )
            return ExtractionResult(entities=[], relationships=[])

        # Parse entities
        entities = []
        raw_entities = data.get("entities", [])
        for raw in raw_entities:
            if not isinstance(raw, dict):
                continue
            try:
                entity = ExtractedEntity(
                    temp_id=raw.get("temp_id", f"e{len(entities)+1}"),
                    name=str(raw.get("name", "")).strip(),
                    type=raw.get("type", "Concept"),
                    properties=raw.get("properties", {}),
                )
                if entity.name:  # Only add entities with names
                    entities.append(entity)
            except Exception as e:
                log.warning("Failed to parse entity", error=str(e), raw=raw)

        # Parse relationships
        relationships = []
        raw_relationships = data.get("relationships", [])
        for raw in raw_relationships:
            if not isinstance(raw, dict):
                continue
            try:
                rel = ExtractedRelationship(
                    source=str(raw.get("source", "")),
                    target=str(raw.get("target", "")),
                    type=raw.get("type", "RELATED_TO"),
                    properties=raw.get("properties", {}),
                )
                if rel.source and rel.target:  # Only add valid relationships
                    relationships.append(rel)
            except Exception as e:
                log.warning("Failed to parse relationship", error=str(e), raw=raw)

        return ExtractionResult(entities=entities, relationships=relationships)

    async def extract_from_document(
        self,
        chunks: list[str],
        content_type: ContentType,
        context: Optional[dict] = None,
    ) -> DocumentExtractionResult:
        """Extract entities from all chunks of a document and deduplicate.

        This method processes all chunks in a document, then deduplicates
        entities with the same name and type, merging their properties
        and updating relationship references.

        Args:
            chunks: List of text chunks from the document
            content_type: Type of content (spec, component, contract, etc.)
            context: Optional context (e.g., document filename, project info)

        Returns:
            DocumentExtractionResult with deduplicated entities and relationships
        """
        all_entities: list[ExtractedEntity] = []
        all_relationships: list[ExtractedRelationship] = []
        total_tokens = 0
        chunks_processed = 0

        # Process each chunk
        for i, chunk_text in enumerate(chunks):
            chunk_context = {**(context or {}), "chunk_index": i, "total_chunks": len(chunks)}

            result = await self.extract_from_chunk(
                text=chunk_text,
                content_type=content_type,
                context=chunk_context,
            )

            # Prefix temp_ids with chunk index to make them unique across chunks
            for entity in result.entities:
                entity.temp_id = f"c{i}_{entity.temp_id}"
            for rel in result.relationships:
                rel.source = f"c{i}_{rel.source}"
                rel.target = f"c{i}_{rel.target}"

            all_entities.extend(result.entities)
            all_relationships.extend(result.relationships)
            total_tokens += result.tokens_used
            chunks_processed += 1

        # Deduplicate entities
        deduped_entities, id_mapping, deduped_count = self._deduplicate_entities(all_entities)

        # Update relationship references to use deduplicated IDs
        deduped_relationships = self._update_relationship_references(
            all_relationships, id_mapping
        )

        # Remove duplicate relationships
        deduped_relationships = self._deduplicate_relationships(deduped_relationships)

        log.info(
            "Document extraction completed",
            chunks_processed=chunks_processed,
            raw_entities=len(all_entities),
            deduped_entities=len(deduped_entities),
            deduped_count=deduped_count,
            relationships=len(deduped_relationships),
            total_tokens=total_tokens,
        )

        return DocumentExtractionResult(
            entities=deduped_entities,
            relationships=deduped_relationships,
            total_tokens_used=total_tokens,
            chunks_processed=chunks_processed,
            deduplicated_count=deduped_count,
        )

    def _deduplicate_entities(
        self,
        entities: list[ExtractedEntity],
    ) -> tuple[list[ExtractedEntity], dict[str, str], int]:
        """Deduplicate entities by (name, type), merging properties.

        Args:
            entities: List of entities to deduplicate

        Returns:
            Tuple of (deduplicated entities, id mapping, count removed)
        """
        # Group entities by (normalized_name, type)
        entity_groups: dict[tuple[str, str], list[ExtractedEntity]] = {}
        for entity in entities:
            key = (entity.name.lower().strip(), entity.type)
            if key not in entity_groups:
                entity_groups[key] = []
            entity_groups[key].append(entity)

        deduped: list[ExtractedEntity] = []
        id_mapping: dict[str, str] = {}  # old_temp_id -> new_temp_id

        for (name_lower, entity_type), group in entity_groups.items():
            # Use the first entity as the base, but prefer the one with the best name casing
            base_entity = max(group, key=lambda e: sum(1 for c in e.name if c.isupper()))

            # Generate a new unique ID for the deduplicated entity
            new_id = f"d{len(deduped)+1}"

            # Merge properties from all entities in the group
            merged_properties = {}
            for entity in group:
                for key, value in entity.properties.items():
                    if key not in merged_properties:
                        merged_properties[key] = value
                    elif isinstance(merged_properties[key], list) and isinstance(value, list):
                        # Merge lists
                        merged_properties[key] = list(set(merged_properties[key] + value))
                    elif merged_properties[key] != value:
                        # Keep both values in a list if they differ
                        existing = merged_properties[key]
                        if not isinstance(existing, list):
                            existing = [existing]
                        if value not in existing:
                            existing.append(value)
                        merged_properties[key] = existing

                # Map old ID to new ID
                id_mapping[entity.temp_id] = new_id

            deduped.append(ExtractedEntity(
                temp_id=new_id,
                name=base_entity.name,
                type=entity_type,
                properties=merged_properties,
            ))

        deduped_count = len(entities) - len(deduped)
        return deduped, id_mapping, deduped_count

    def _update_relationship_references(
        self,
        relationships: list[ExtractedRelationship],
        id_mapping: dict[str, str],
    ) -> list[ExtractedRelationship]:
        """Update relationship source/target to use deduplicated entity IDs.

        Args:
            relationships: List of relationships to update
            id_mapping: Mapping from old temp_id to new temp_id

        Returns:
            List of relationships with updated references
        """
        updated = []
        for rel in relationships:
            new_source = id_mapping.get(rel.source, rel.source)
            new_target = id_mapping.get(rel.target, rel.target)

            # Skip self-referencing relationships created by deduplication
            if new_source == new_target:
                continue

            updated.append(ExtractedRelationship(
                source=new_source,
                target=new_target,
                type=rel.type,
                properties=rel.properties,
            ))

        return updated

    def _deduplicate_relationships(
        self,
        relationships: list[ExtractedRelationship],
    ) -> list[ExtractedRelationship]:
        """Remove duplicate relationships (same source, target, type).

        Args:
            relationships: List of relationships to deduplicate

        Returns:
            Deduplicated list of relationships
        """
        seen: set[tuple[str, str, str]] = set()
        deduped: list[ExtractedRelationship] = []

        for rel in relationships:
            key = (rel.source, rel.target, rel.type)
            if key not in seen:
                seen.add(key)
                deduped.append(rel)
            else:
                # Merge properties from duplicate relationship
                for existing in deduped:
                    if (existing.source, existing.target, existing.type) == key:
                        for k, v in rel.properties.items():
                            if k not in existing.properties:
                                existing.properties[k] = v
                        break

        return deduped

    async def health_check(self) -> dict:
        """Check if the extraction service is healthy.

        Returns:
            Dict with health status information
        """
        return {
            "service": "extraction",
            "configured": self.client is not None,
            "model": self.model,
        }
