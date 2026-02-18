#!/usr/bin/env python3
"""
Claim a field task for a worker agent.

Atomically transitions a task from 'open' to 'claimed' and registers
the worker in the agent_presence table for swarm visibility.

Usage:
    python3 claim-task.py <node_id> <worker_id>

Environment:
    DATABASE_URL  PostgreSQL connection string (required)

Output:
    JSON to stdout: {claimed, node_id, title, claimed_by} on success
    JSON to stderr on error
"""

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
    if len(sys.argv) < 3:
        print("Usage: claim-task.py <node_id> <worker_id>", file=sys.stderr)
        sys.exit(1)

    node_id = sys.argv[1]
    worker_id = sys.argv[2]

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch task affinities for presence registration
        cursor.execute(
            "SELECT affinity FROM field_nodes WHERE id = %s",
            (node_id,),
        )
        task_row = cursor.fetchone()
        affinities = task_row[0] if task_row else []

        # Atomically claim: only succeeds if task is still 'open'
        cursor.execute(
            """
            UPDATE field_nodes
            SET
                state = 'claimed',
                claimed_by = %s,
                updated_at = NOW()
            WHERE id = %s
              AND state = 'open'
            RETURNING id, title
            """,
            (worker_id, node_id),
        )
        row = cursor.fetchone()

        # Register in agent_presence so the swarm can see this worker
        if row:
            cursor.execute(
                """
                INSERT INTO agent_presence (
                    agent_id, agent_type, affinities, lifecycle_state,
                    current_zone_id, max_turns, checkpoint_at, last_heartbeat
                ) VALUES (%s, 'cli', %s, 'active', %s, 200, 180, NOW())
                ON CONFLICT (agent_id) DO UPDATE SET
                    lifecycle_state = 'active',
                    current_zone_id = %s,
                    turn_count = 0,
                    context_tokens_est = 0,
                    last_heartbeat = NOW()
                """,
                (worker_id, affinities, node_id, node_id),
            )

        conn.commit()

        if row:
            print(
                json.dumps(
                    {
                        "claimed": True,
                        "node_id": str(row[0]),
                        "title": row[1],
                        "claimed_by": worker_id,
                    }
                )
            )
        else:
            # Provide a reason: task may not exist, or already claimed/resolved
            cursor.execute(
                "SELECT state, claimed_by FROM field_nodes WHERE id = %s",
                (node_id,),
            )
            existing = cursor.fetchone()
            if existing:
                print(
                    json.dumps(
                        {
                            "claimed": False,
                            "node_id": node_id,
                            "reason": f"Task in state '{existing[0]}', claimed by '{existing[1]}'",
                        }
                    )
                )
            else:
                print(
                    json.dumps(
                        {
                            "claimed": False,
                            "node_id": node_id,
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
