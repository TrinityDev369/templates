"""Text chunking service for document processing."""

from dataclasses import dataclass
from typing import Optional

import tiktoken
import structlog

log = structlog.get_logger()

# Default encoding for OpenAI models
DEFAULT_ENCODING = "cl100k_base"


@dataclass
class Chunk:
    """A chunk of text with metadata."""
    content: str
    index: int
    token_count: int
    start_char: int
    end_char: int


class ChunkingService:
    """Service for splitting documents into chunks."""

    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        encoding_name: str = DEFAULT_ENCODING,
    ):
        """
        Initialize the chunking service.

        Args:
            chunk_size: Target number of tokens per chunk
            chunk_overlap: Number of overlapping tokens between chunks
            encoding_name: tiktoken encoding name
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.encoding = tiktoken.get_encoding(encoding_name)

    def count_tokens(self, text: str) -> int:
        """Count tokens in a text string."""
        return len(self.encoding.encode(text))

    def chunk_text(self, text: str, metadata: Optional[dict] = None) -> list[Chunk]:
        """
        Split text into overlapping chunks.

        Uses a sentence-aware splitting strategy:
        1. Split by paragraphs first
        2. If paragraph is too long, split by sentences
        3. Merge small chunks to reach target size
        4. Add overlap between chunks

        Args:
            text: The text to chunk
            metadata: Optional metadata to include

        Returns:
            List of Chunk objects
        """
        if not text or not text.strip():
            return []

        # Normalize whitespace
        text = text.strip()

        # Split into paragraphs
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

        if not paragraphs:
            return []

        chunks: list[Chunk] = []
        current_chunk = ""
        current_start = 0
        chunk_index = 0

        for para in paragraphs:
            para_tokens = self.count_tokens(para)

            # If paragraph fits in current chunk
            if self.count_tokens(current_chunk + "\n\n" + para if current_chunk else para) <= self.chunk_size:
                if current_chunk:
                    current_chunk += "\n\n" + para
                else:
                    current_chunk = para
                    current_start = text.find(para)
            else:
                # Save current chunk if not empty
                if current_chunk:
                    chunks.append(Chunk(
                        content=current_chunk,
                        index=chunk_index,
                        token_count=self.count_tokens(current_chunk),
                        start_char=current_start,
                        end_char=current_start + len(current_chunk),
                    ))
                    chunk_index += 1

                # If paragraph itself is too long, split it
                if para_tokens > self.chunk_size:
                    para_chunks = self._split_long_paragraph(para, text, chunk_index)
                    for pc in para_chunks:
                        chunks.append(pc)
                        chunk_index += 1
                    current_chunk = ""
                else:
                    current_chunk = para
                    current_start = text.find(para)

        # Don't forget the last chunk
        if current_chunk:
            chunks.append(Chunk(
                content=current_chunk,
                index=chunk_index,
                token_count=self.count_tokens(current_chunk),
                start_char=current_start,
                end_char=current_start + len(current_chunk),
            ))

        # Add overlap between chunks
        chunks = self._add_overlap(chunks, text)

        log.info(
            "Text chunked",
            total_tokens=self.count_tokens(text),
            num_chunks=len(chunks),
            avg_chunk_size=sum(c.token_count for c in chunks) / len(chunks) if chunks else 0,
        )

        return chunks

    def _split_long_paragraph(self, para: str, full_text: str, start_index: int) -> list[Chunk]:
        """Split a paragraph that exceeds chunk_size into smaller pieces."""
        chunks = []

        # Try to split by sentences first
        sentences = self._split_sentences(para)

        current = ""
        current_start = full_text.find(para)
        idx = start_index

        for sentence in sentences:
            if self.count_tokens(current + " " + sentence if current else sentence) <= self.chunk_size:
                if current:
                    current += " " + sentence
                else:
                    current = sentence
            else:
                if current:
                    chunks.append(Chunk(
                        content=current,
                        index=idx,
                        token_count=self.count_tokens(current),
                        start_char=current_start,
                        end_char=current_start + len(current),
                    ))
                    idx += 1
                    current_start += len(current) + 1

                # If single sentence is still too long, force split by tokens
                if self.count_tokens(sentence) > self.chunk_size:
                    forced = self._force_split(sentence, current_start, idx)
                    for fc in forced:
                        chunks.append(fc)
                        idx += 1
                        current_start += len(fc.content)
                    current = ""
                else:
                    current = sentence

        if current:
            chunks.append(Chunk(
                content=current,
                index=idx,
                token_count=self.count_tokens(current),
                start_char=current_start,
                end_char=current_start + len(current),
            ))

        return chunks

    def _split_sentences(self, text: str) -> list[str]:
        """Split text into sentences (simple heuristic)."""
        import re
        # Split on sentence endings, keeping the punctuation
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]

    def _force_split(self, text: str, start_char: int, start_index: int) -> list[Chunk]:
        """Force split text by token count when sentences are too long."""
        chunks = []
        tokens = self.encoding.encode(text)
        idx = start_index
        char_pos = start_char

        for i in range(0, len(tokens), self.chunk_size - self.chunk_overlap):
            chunk_tokens = tokens[i:i + self.chunk_size]
            chunk_text = self.encoding.decode(chunk_tokens)

            chunks.append(Chunk(
                content=chunk_text,
                index=idx,
                token_count=len(chunk_tokens),
                start_char=char_pos,
                end_char=char_pos + len(chunk_text),
            ))
            idx += 1
            char_pos += len(chunk_text)

        return chunks

    def _add_overlap(self, chunks: list[Chunk], full_text: str) -> list[Chunk]:
        """Add overlap context to chunks (prepend context from previous chunk)."""
        if len(chunks) <= 1 or self.chunk_overlap == 0:
            return chunks

        result = [chunks[0]]  # First chunk stays as-is

        for i in range(1, len(chunks)):
            prev_chunk = chunks[i - 1]
            curr_chunk = chunks[i]

            # Get overlap tokens from end of previous chunk
            prev_tokens = self.encoding.encode(prev_chunk.content)
            overlap_tokens = prev_tokens[-self.chunk_overlap:] if len(prev_tokens) > self.chunk_overlap else prev_tokens
            overlap_text = self.encoding.decode(overlap_tokens)

            # Prepend overlap to current chunk
            new_content = overlap_text + " " + curr_chunk.content

            result.append(Chunk(
                content=new_content,
                index=curr_chunk.index,
                token_count=self.count_tokens(new_content),
                start_char=curr_chunk.start_char - len(overlap_text) - 1,
                end_char=curr_chunk.end_char,
            ))

        return result


# Singleton instance with default settings
default_chunker = ChunkingService()
