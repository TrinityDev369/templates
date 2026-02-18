#!/usr/bin/env python3
"""
Resolve a completed task in the field system.

Transitions a task to 'resolved', merges an optional artifact into its
content JSONB, and unblocks any dependent tasks that were waiting on it.

Usage:
    python3 resolve-task.py <node_id> [--artifact <json>]

Arguments:
    node_id             UUID of the field node to resolve
    --artifact <json>   Optional JSON string to merge into task content

Environment:
    DATABASE_URL  PostgreSQL connection string (required)

Output:
    JSON to stdout: {resolved, node_id, title, unblocked_count}
    JSON to stderr on error
"""

import argparse
import json
import os
import sys

try:
    import psycopg2
except ImportError:
    print(
        json.dumps({"error": "psycopg2 not installed. Run: pip install psycopg2-binary"}),
        file=sys.stderr,
    )
    sys.exit(1)


def get_db_connection():
    """Connect to PostgreSQL via DATABASE_URL."""
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print(
            json.dumps({"error": "DATABASE_URL environment variable not set"}),
            file=sys.stderr,
        )
        sys.exit(1)
    return psycopg2.connect(db_url)


def main():
    parser = argparse.ArgumentParser(description="Resolve a field task")
    parser.add_argument("node_id", help="Task node UUID")
    parser.add_argument(
        "--artifact",
        help="Artifact JSON to merge into task content",
        default="{}",
    )
    args = parser.parse_args()

    # Parse artifact JSON, fall back to empty object on invalid input
    try:
        artifact = json.loads(args.artifact)
    except (json.JSONDecodeError, TypeError):
        artifact = {}

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Mark task as resolved, merging artifact into content
        cursor.execute(
            """
            UPDATE field_nodes
            SET
                state = 'resolved',
                content = content || %s::jsonb,
                resolved_at = NOW(),
                updated_at = NOW()
            WHERE id = %s
            RETURNING id, title
            """,
            (json.dumps({"artifact": artifact}), args.node_id),
        )
        row = cursor.fetchone()
        conn.commit()

        if row:
            # Unblock dependent tasks that list this node in blocked_by
            cursor.execute(
                """
                UPDATE field_nodes
                SET blocked_by = array_remove(blocked_by, %s)
                WHERE %s = ANY(blocked_by)
                RETURNING id
                """,
                (args.node_id, args.node_id),
            )
            unblocked = cursor.fetchall()
            conn.commit()

            print(
                json.dumps(
                    {
                        "resolved": True,
                        "node_id": str(row[0]),
                        "title": row[1],
                        "unblocked_count": len(unblocked),
                    }
                )
            )
        else:
            print(
                json.dumps(
                    {
                        "resolved": False,
                        "node_id": args.node_id,
                        "reason": "Task not found",
                    }
                )
            )

        conn.close()

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
