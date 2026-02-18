#!/usr/bin/env python3
"""
Query the field for tasks with filtering and sorting.

Lists field nodes ordered by effective potential (base potential boosted
by temperature), with optional filters on node type and state.

Usage:
    python3 field-query.py [--limit N] [--type task|spec|goal|all]
                           [--state open|claimed|resolved|all] [--json]

Options:
    --limit N       Maximum results (default: 10)
    --type TYPE     Filter by node type (default: all)
    --state STATE   Filter by lifecycle state (default: open)
    --json          Output as JSON array instead of table

Environment:
    DATABASE_URL  PostgreSQL connection string (required)

Output:
    Pretty-printed table (default) or JSON array (--json)
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
        print("DATABASE_URL not set", file=sys.stderr)
        sys.exit(1)
    return psycopg2.connect(db_url)


def main():
    parser = argparse.ArgumentParser(description="Query the field for tasks")
    parser.add_argument("--limit", type=int, default=10, help="Max results (default: 10)")
    parser.add_argument(
        "--type",
        choices=["task", "spec", "goal", "all"],
        default="all",
        help="Filter by node type",
    )
    parser.add_argument(
        "--state",
        choices=["open", "claimed", "resolved", "all"],
        default="open",
        help="Filter by state",
    )
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Build dynamic WHERE clause
        conditions = []
        params = []

        if args.type != "all":
            conditions.append("node_type = %s")
            params.append(args.type)

        if args.state != "all":
            conditions.append("state = %s")
            params.append(args.state)

        where_clause = " AND ".join(conditions) if conditions else "TRUE"
        params.append(args.limit)

        # effective_potential = potential + (temperature * 0.2), clamped to 1.0
        cursor.execute(
            f"""
            SELECT
                id,
                node_type,
                title,
                state,
                potential,
                LEAST(potential + (temperature * 0.2), 1.0) AS effective_potential,
                affinity,
                claimed_by,
                created_at
            FROM field_nodes
            WHERE {where_clause}
            ORDER BY LEAST(potential + (temperature * 0.2), 1.0) DESC, potential DESC
            LIMIT %s
            """,
            params,
        )

        rows = cursor.fetchall()
        conn.close()

        if args.json:
            results = []
            for row in rows:
                results.append(
                    {
                        "id": str(row[0]),
                        "node_type": row[1],
                        "title": row[2],
                        "state": row[3],
                        "potential": float(row[4]),
                        "effective_potential": float(row[5]),
                        "affinity": row[6] or [],
                        "claimed_by": row[7],
                        "created_at": str(row[8]),
                    }
                )
            print(json.dumps(results, indent=2))
        else:
            # Pretty-print table
            print(f"\n{'ID':<8} {'Type':<6} {'State':<8} {'Pot':<5} {'Title':<40}")
            print("-" * 75)
            for row in rows:
                node_id = str(row[0])[:7]
                node_type = row[1][:5]
                state = row[3][:7]
                eff_potential = f"{row[5]:.2f}"
                title = row[2][:39]
                print(f"{node_id:<8} {node_type:<6} {state:<8} {eff_potential:<5} {title}")

            print(f"\nTotal: {len(rows)} nodes")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
