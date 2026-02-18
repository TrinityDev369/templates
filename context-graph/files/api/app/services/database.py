"""Database connection service"""

import json
import re
from typing import Optional, Any
from contextlib import asynccontextmanager

import psycopg
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool
import structlog

from app.config import Settings

log = structlog.get_logger()


class Database:
    """PostgreSQL + AGE database service."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.pool: Optional[AsyncConnectionPool] = None
        self._dsn = f"host={settings.postgres_host} port={settings.postgres_port} dbname={settings.postgres_db} user={settings.postgres_user} password={settings.postgres_password}"

    async def connect(self):
        """Initialize connection pool."""
        self.pool = AsyncConnectionPool(
            conninfo=self._dsn,
            min_size=2,
            max_size=10,
            open=False,
        )
        await self.pool.open()
        log.info("Database pool opened", host=self.settings.postgres_host)

    async def disconnect(self):
        """Close connection pool."""
        if self.pool:
            await self.pool.close()
            log.info("Database pool closed")

    @asynccontextmanager
    async def connection(self):
        """Get a connection from the pool."""
        async with self.pool.connection() as conn:
            yield conn

    @asynccontextmanager
    async def cursor(self, row_factory=dict_row):
        """Get a cursor with optional row factory."""
        async with self.pool.connection() as conn:
            async with conn.cursor(row_factory=row_factory) as cur:
                yield cur

    async def execute(self, query: str, params: tuple = None) -> None:
        """Execute a query without returning results."""
        async with self.cursor() as cur:
            await cur.execute(query, params)

    async def fetch_one(self, query: str, params: tuple = None) -> Optional[dict]:
        """Fetch a single row."""
        async with self.cursor() as cur:
            await cur.execute(query, params)
            return await cur.fetchone()

    async def fetch_all(self, query: str, params: tuple = None) -> list[dict]:
        """Fetch all rows."""
        async with self.cursor() as cur:
            await cur.execute(query, params)
            return await cur.fetchall()

    async def execute_cypher(self, graph_name: str, cypher: str) -> list[dict]:
        """Execute a Cypher query on an AGE graph.

        Note: AGE requires explicit column definitions in the result.
        This method auto-detects return columns from the RETURN clause.
        """
        # AGE requires loading extension and setting search path
        setup_sql = "LOAD 'age'; SET search_path = ag_catalog, public;"

        # Parse the RETURN clause to get column names
        # Simple parser - looks for "RETURN x as a, y as b" pattern
        return_match = re.search(r'RETURN\s+(.+?)(?:ORDER|LIMIT|SKIP|$)', cypher, re.IGNORECASE | re.DOTALL)

        if return_match:
            return_clause = return_match.group(1).strip()
            # Split on top-level commas only (respect parens, braces, brackets)
            items: list[str] = []
            depth = 0
            current: list[str] = []
            for ch in return_clause:
                if ch in ('(', '{', '['):
                    depth += 1
                elif ch in (')', '}', ']'):
                    depth -= 1
                if ch == ',' and depth == 0:
                    items.append(''.join(current).strip())
                    current = []
                else:
                    current.append(ch)
            if current:
                items.append(''.join(current).strip())

            # Extract column aliases or names
            columns = []
            for item in items:
                # Check for "expr as alias" pattern
                as_match = re.search(r'\s+as\s+(\w+)\s*$', item, re.IGNORECASE)
                if as_match:
                    columns.append(as_match.group(1))
                else:
                    # Use the expression itself (cleaned up)
                    col_name = re.sub(r'[^a-zA-Z0-9_]', '_', item.split('.')[-1])
                    columns.append(col_name)

            # Build column definition for AGE
            col_def = ", ".join(f"{col} agtype" for col in columns)
        else:
            col_def = "data agtype"
            columns = ["data"]

        cypher_sql = f"""
        SELECT * FROM cypher('{graph_name}', $cypher$
            {cypher}
        $cypher$) as result({col_def});
        """

        async with self.connection() as conn:
            async with conn.cursor(row_factory=dict_row) as cur:
                await cur.execute(setup_sql)
                try:
                    await cur.execute(cypher_sql)
                except Exception as e:
                    log.error("Cypher execution failed", query=cypher[:200], error=str(e))
                    raise

                rows = await cur.fetchall()

                # Parse agtype results
                results = []
                for row in rows:
                    if row:
                        parsed_row = {}
                        for col in columns:
                            if col in row:
                                parsed_row[col] = self._parse_agtype(row[col])
                        results.append(parsed_row)
                return results

    def _parse_agtype(self, value: Any) -> Any:
        """Parse AGE agtype values to Python types."""
        if value is None:
            return None
        if isinstance(value, str):
            # AGE returns JSON-like strings, try to parse
            try:
                # Remove ::vertex or ::edge suffixes
                clean = value.split("::")[0] if "::" in value else value
                return json.loads(clean)
            except (json.JSONDecodeError, TypeError):
                return value
        return value
