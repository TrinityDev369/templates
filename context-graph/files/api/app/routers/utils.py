"""Shared utilities for API routers."""

import re

from fastapi import HTTPException, status


async def get_graph_name(db, slug: str) -> str:
    """Get graph name from project slug."""
    row = await db.fetch_one(
        "SELECT graph_name FROM public.projects WHERE slug = %s",
        (slug,)
    )
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{slug}' not found"
        )
    return row["graph_name"]


from app.utils import normalize_label  # noqa: F401 — re-exported for router consumers


# -- Cypher safety helpers ---------------------------------------------------

DANGEROUS_KEYWORDS = {"DELETE", "CREATE", "DROP", "SET", "REMOVE", "MERGE", "DETACH", "CALL"}


def has_dangerous_keywords(query: str) -> bool:
    """Check for write/destructive Cypher keywords using word-boundary matching.

    Strips comments first so that keyword checks cannot be bypassed via
    ``// DELETE`` or ``/* DROP */`` style comments.  Uses word boundaries so
    that benign identifiers like ``dataset`` or ``create_date`` are not
    flagged.
    """
    # Remove single-line comments
    cleaned = re.sub(r'//.*$', '', query, flags=re.MULTILINE)
    # Remove block comments
    cleaned = re.sub(r'/\*.*?\*/', '', cleaned, flags=re.DOTALL)
    words = set(re.findall(r'\b[A-Z]+\b', cleaned.upper()))
    return bool(words & DANGEROUS_KEYWORDS)
