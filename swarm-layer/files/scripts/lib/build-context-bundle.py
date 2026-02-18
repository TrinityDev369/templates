#!/usr/bin/env python3
"""
Build a context bundle for agent spawning.

Assembles everything an agent needs to understand and execute a task:
task description, parent context, matched context bundles, skill knowledge,
and workflow instructions. Identity emerges from context, not configuration.

Modes:
    --spec <path>   Read a markdown spec file (YAML frontmatter + body)
    --task <id>     Build from a specific field node by UUID
    (no args)       Auto-select the highest-potential open task from the field

Usage:
    python3 build-context-bundle.py --spec specs/my-feature.md
    python3 build-context-bundle.py --task 550e8400-e29b-41d4-a716-446655440000
    python3 build-context-bundle.py

Environment:
    DATABASE_URL  PostgreSQL connection string (required for --task / auto mode)

Output:
    JSON to stdout: {title, node_id, prompt, model}
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Optional

# Database driver -- optional for spec-only mode
try:
    import psycopg2

    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db_connection():
    """Connect to PostgreSQL via DATABASE_URL. Returns None on failure."""
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return None
    try:
        return psycopg2.connect(db_url)
    except Exception as e:
        print(json.dumps({"error": f"Database connection failed: {e}"}))
        return None


def _parse_content(raw) -> dict:
    """Safely coerce a psycopg2 jsonb value into a dict.

    psycopg2 may return dict, list, str, or None depending on stored value.
    """
    if isinstance(raw, dict):
        return raw
    if raw is None:
        return {}
    if isinstance(raw, list):
        return {"items": raw}
    if isinstance(raw, str):
        try:
            parsed = json.loads(raw)
            return parsed if isinstance(parsed, dict) else {"items": parsed}
        except (json.JSONDecodeError, TypeError):
            return {"raw": raw}
    return {}


# ---------------------------------------------------------------------------
# Field node queries
# ---------------------------------------------------------------------------

def query_highest_potential_task(conn) -> Optional[dict]:
    """Select the highest-potential open, unblocked task from the field."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            id,
            node_type,
            title,
            content,
            potential,
            affinity,
            parent_id
        FROM field_nodes
        WHERE state = 'open'
          AND node_type IN ('task', 'spec', 'goal')
          AND (blocked_by IS NULL OR blocked_by = '{}')
        ORDER BY potential DESC
        LIMIT 1
    """)
    row = cursor.fetchone()
    cursor.close()
    if not row:
        return None

    return {
        "id": str(row[0]),
        "node_type": row[1],
        "title": row[2],
        "content": _parse_content(row[3]),
        "potential": float(row[4]),
        "effective_potential": float(row[4]),
        "affinity": row[5] or [],
        "parent_id": str(row[6]) if row[6] else None,
    }


def query_task_by_id(conn, task_id: str) -> Optional[dict]:
    """Fetch a specific field node by UUID."""
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT
            id,
            node_type,
            title,
            content,
            potential,
            affinity,
            parent_id
        FROM field_nodes
        WHERE id = %s
        """,
        (task_id,),
    )
    row = cursor.fetchone()
    cursor.close()
    if not row:
        return None

    return {
        "id": str(row[0]),
        "node_type": row[1],
        "title": row[2],
        "content": _parse_content(row[3]),
        "potential": float(row[4]),
        "effective_potential": float(row[4]),
        "affinity": row[5] or [],
        "parent_id": str(row[6]) if row[6] else None,
    }


def query_parent_context(conn, parent_id: str) -> Optional[dict]:
    """Fetch the parent node for hierarchical context."""
    if not parent_id:
        return None
    return query_task_by_id(conn, parent_id)


# ---------------------------------------------------------------------------
# Context bundle matching
# ---------------------------------------------------------------------------

def query_context_bundles(conn, node_id: str) -> list:
    """Load pre-attached context bundles for a field node."""
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT
            cb.slug,
            cb.domain,
            cb.title,
            cb.file_refs,
            cb.conventions,
            cb.kg_queries,
            fnb.match_score
        FROM field_node_bundles fnb
        JOIN context_bundles cb ON cb.id = fnb.bundle_id
        WHERE fnb.node_id = %s
        ORDER BY fnb.match_score DESC
        """,
        (node_id,),
    )

    bundles = []
    for row in cursor.fetchall():
        bundles.append({
            "slug": row[0],
            "domain": row[1],
            "title": row[2],
            "file_refs": row[3] if isinstance(row[3], list) else json.loads(row[3] or "[]"),
            "conventions": row[4] or "",
            "kg_queries": row[5] if isinstance(row[5], list) else json.loads(row[5] or "[]"),
            "match_score": float(row[6]),
        })
    cursor.close()
    return bundles


# Domain keyword map for lazy bundle scoring
DOMAIN_KEYWORDS = {
    "auth": ["auth", "login", "logout", "session", "jwt", "token", "mfa", "password", "user"],
    "crm": ["client", "contract", "contact", "milestone", "deliverable", "revenue"],
    "documents": ["document", "note", "prd", "file", "upload", "attachment"],
    "knowledge": ["knowledge", "graph", "entity", "relationship", "kg"],
    "swarm": ["swarm", "field", "agent", "worker", "spawn", "claim"],
    "blog": ["blog", "post", "article", "publish", "draft"],
    "legal": ["template", "rule", "clause", "legal", "terms"],
    "frontend": ["component", "page", "scaffold", "react", "next", "tailwind", "css", "layout", "responsive"],
    "projects": ["project", "task", "cycle", "sprint", "tracking", "timeline"],
    "billing": ["billing", "stripe", "payment", "invoice", "subscription", "pricing"],
}
MATCH_THRESHOLD = 1.0
MAX_BUNDLES = 4


def match_and_attach_bundles(conn, node_id: str, task: dict) -> list:
    """Lazy bundle matching when no bundles are pre-attached.

    Scoring formula:
        (domain_match * 3) + (min(keyword_hits, 3) * 2) + (min(affinity_overlap, 2) * 1.5)
    Threshold: 1.0 minimum score. Max 4 bundles attached.
    """
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, slug, domain, title, description, affinities, keywords,
               file_refs, conventions, kg_queries, priority
        FROM context_bundles WHERE is_active = true
    """)
    bundles = cursor.fetchall()
    cursor.close()

    # Build search text from task title + content
    task_text = f"{task.get('title', '')} {json.dumps(task.get('content', {}))}".lower()
    task_affinities = set(a.lower() for a in (task.get("affinity") or []))

    # Detect which domains appear in the task text
    detected_domains = set()
    for domain, keywords in DOMAIN_KEYWORDS.items():
        if any(kw in task_text for kw in keywords):
            detected_domains.add(domain)

    scored = []
    for row in bundles:
        (bid, slug, domain, title, desc, affinities, keywords,
         file_refs, conventions, kg_queries, priority) = row
        affinities = affinities or []
        keywords = keywords or []

        # Domain score: 3 points if bundle domain matches detected domains
        domain_score = 3.0 if domain in detected_domains else 0.0

        # Keyword score: 2 points per keyword hit, capped at 3 hits
        kw_hits = sum(1 for kw in keywords if kw.lower() in task_text)
        keyword_score = min(kw_hits, 3) * 2.0

        # Affinity score: 1.5 points per overlap, capped at 2
        bundle_affs = set(a.lower() for a in affinities)
        aff_overlap = len(bundle_affs & task_affinities)
        affinity_score = min(aff_overlap, 2) * 1.5

        total = domain_score + keyword_score + affinity_score
        if total >= MATCH_THRESHOLD:
            scored.append((
                total, priority or 0, bid, slug, domain, title,
                file_refs, conventions, kg_queries,
            ))

    # Sort by score descending, then priority descending
    scored.sort(key=lambda x: (-x[0], -x[1]))
    top = scored[:MAX_BUNDLES]

    if not top:
        return []

    # Persist attachment in field_node_bundles
    cursor = conn.cursor()
    for total, _, bid, *_ in top:
        cursor.execute(
            """
            INSERT INTO field_node_bundles (node_id, bundle_id, match_score, attached_by)
            VALUES (%s::uuid, %s::uuid, %s, 'system:spawn-lazy')
            ON CONFLICT (node_id, bundle_id) DO UPDATE SET match_score = EXCLUDED.match_score
            """,
            (node_id, bid, total),
        )
    conn.commit()
    cursor.close()

    # Return in the same shape as query_context_bundles
    result = []
    for total, _, bid, slug, domain, title, file_refs, conventions, kg_queries in top:
        result.append({
            "slug": slug,
            "domain": domain,
            "title": title,
            "file_refs": file_refs if isinstance(file_refs, list) else json.loads(file_refs or "[]"),
            "conventions": conventions or "",
            "kg_queries": kg_queries if isinstance(kg_queries, list) else json.loads(kg_queries or "[]"),
            "match_score": total,
        })
    return result


# ---------------------------------------------------------------------------
# Skill loading
# ---------------------------------------------------------------------------

def load_skill_for_task(task: dict, project_root: str) -> str:
    """Match task affinities to skills via routing.json and load SKILL.md content.

    Reads .claude/routing.json (or shared/skills/routing.json as fallback),
    finds the first route whose affinities overlap with the task, then loads
    the corresponding SKILL.md file.
    """
    task_affinities = set(a.lower() for a in (task.get("affinity") or []))
    if not task_affinities:
        return ""

    root = Path(project_root)

    # Try multiple routing.json locations
    routing_paths = [
        root / ".claude" / "routing.json",
        root / "shared" / "skills" / "routing.json",
    ]
    routing = None
    for rp in routing_paths:
        if rp.exists():
            try:
                routing = json.loads(rp.read_text())
                break
            except (json.JSONDecodeError, OSError):
                continue

    if not routing:
        return ""

    routes = routing.get("routes", [])
    matched_skills = []

    for route in routes:
        route_affs = set(a.lower() for a in route.get("affinities", []))
        if route_affs & task_affinities:
            matched_skills.append(route.get("skill", ""))

    if not matched_skills:
        return ""

    # Also check explicit skills listed in task content
    content = task.get("content", {})
    explicit_skills = content.get("skills", [])
    if isinstance(explicit_skills, str):
        explicit_skills = [explicit_skills]
    all_skills = list(dict.fromkeys(explicit_skills + matched_skills))  # dedupe, preserve order

    return _load_skill_content(all_skills, project_root)


def _load_skill_content(skill_names: list, project_root: str) -> str:
    """Load SKILL.md files for a list of skill names/paths."""
    if not skill_names:
        return ""

    root = Path(project_root)
    lines = ["## Skill Knowledge\n"]

    for skill in skill_names:
        # Try multiple resolution paths
        candidates = [
            root / skill,                                          # direct path
            root / "shared" / "skills" / skill / "SKILL.md",      # cold skills
            root / ".claude" / "skills" / skill / "SKILL.md",     # hot skills
        ]
        content = None
        for path in candidates:
            if path.exists() and path.is_file():
                try:
                    content = path.read_text()
                except OSError:
                    continue
                break

        if not content:
            continue

        # Strip YAML frontmatter if present
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                content = parts[2].strip()

        lines.append(content)
        lines.append("")

    return "\n".join(lines) if len(lines) > 1 else ""


# ---------------------------------------------------------------------------
# Rendering
# ---------------------------------------------------------------------------

PURPOSE_ICONS = {"reference": ".", "modify": "M", "create": "+", "read": "R"}


def render_bundles_markdown(bundles: list) -> str:
    """Render attached context bundles as compact markdown for the agent prompt."""
    if not bundles:
        return ""

    lines = [f"## Context Bundles ({len(bundles)} attached)\n"]

    for b in bundles:
        lines.append(f"### {b['title']} [{b['domain']}] (score: {b['match_score']:.1f})")

        # File references with purpose icons
        if b["file_refs"]:
            lines.append("**Files:**")
            for ref in b["file_refs"]:
                icon = PURPOSE_ICONS.get(ref.get("purpose", "reference"), ".")
                annotation = ref.get("annotation", "")
                ann = f" -- {annotation}" if annotation else ""
                lines.append(f"- [{icon}] `{ref['path']}`{ann}")
            lines.append("")

        # Conventions block
        if b["conventions"]:
            lines.append(b["conventions"])
            lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Spec file parsing
# ---------------------------------------------------------------------------

def read_spec_file(spec_path: str) -> Optional[dict]:
    """Read and parse a spec file with optional YAML frontmatter."""
    path = Path(spec_path)
    if not path.exists():
        # Try relative to project root
        project_root = _find_project_root()
        path = Path(project_root) / spec_path
        if not path.exists():
            return None

    content = path.read_text()

    # Parse YAML frontmatter (--- delimited)
    frontmatter = {}
    body = content

    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            try:
                import yaml
                frontmatter = yaml.safe_load(parts[1]) or {}
            except Exception:
                pass
            body = parts[2].strip()

    return {
        "path": str(path),
        "frontmatter": frontmatter,
        "body": body,
        "title": frontmatter.get("title", path.stem),
    }


# ---------------------------------------------------------------------------
# Model inference
# ---------------------------------------------------------------------------

def infer_model_from_content(content: dict, affinities: list) -> str:
    """Infer the best model based on task complexity.

    - Explicit model in content takes priority
    - Architectural/planning signals -> opus (deep reasoning)
    - Everything else -> haiku (fast, context-bundles compensate)
    """
    # Explicit override in task content
    if content.get("model"):
        return content["model"]

    # Goal/spec nodes and architectural work need deeper reasoning
    arch_signals = ["architect", "design", "planning", "goal", "spec"]
    if any(a in affinities for a in arch_signals):
        return "opus"

    # Default: haiku is fast and effective with good context
    return "haiku"


# ---------------------------------------------------------------------------
# Prompt assembly
# ---------------------------------------------------------------------------

def build_prompt_from_task(
    task: dict,
    parent: Optional[dict] = None,
    bundles: Optional[list] = None,
    project_root: str = "",
) -> str:
    """Assemble the full agent prompt from task data, context, and skills."""
    content = task.get("content", {})
    sections = []

    # -- Header --
    sections.append(f"# Task: {task['title']}")
    sections.append(f"**Node ID:** `{task['id']}`")
    sections.append(f"**Type:** {task['node_type']}")
    sections.append(f"**Priority:** {task['effective_potential']:.2f}")
    sections.append("")

    # -- Skill knowledge (injected first for maximum guidance) --
    skill_md = load_skill_for_task(task, project_root)
    if not skill_md:
        # Fall back to explicit skills listed in content
        skill_paths = content.get("skills", [])
        if isinstance(skill_paths, str):
            skill_paths = [skill_paths]
        skill_md = _load_skill_content(skill_paths, project_root)
    if skill_md:
        sections.append(skill_md)

    # -- Context bundles (primary context, injected early) --
    bundle_md = render_bundles_markdown(bundles or [])
    if bundle_md:
        sections.append(bundle_md)

    # -- Parent context for hierarchy --
    if parent:
        sections.append("## Parent Context")
        sections.append(f"**{parent['node_type'].title()}:** {parent['title']}")
        parent_content = parent.get("content", {})
        if parent_content.get("problem_statement"):
            sections.append(f"\n{parent_content['problem_statement']}")
        sections.append("")

    # -- Description / problem statement --
    if content.get("description"):
        sections.append("## Description")
        sections.append(content["description"])
        sections.append("")

    if content.get("problem_statement"):
        sections.append("## Problem Statement")
        sections.append(content["problem_statement"])
        sections.append("")

    # -- Files to work with --
    files_to_modify = content.get("files_to_modify", content.get("file_paths", []))
    if files_to_modify:
        sections.append("## Files to Modify")
        for f in files_to_modify:
            sections.append(f"- `{f}`")
        sections.append("")

    # -- Implementation hints --
    if content.get("implementation_hints"):
        sections.append("## Implementation Hints")
        hints = content["implementation_hints"]
        if isinstance(hints, list):
            for h in hints:
                sections.append(f"- {h}")
        else:
            sections.append(hints)
        sections.append("")

    # -- Acceptance criteria --
    if content.get("acceptance_criteria"):
        sections.append("## Acceptance Criteria")
        criteria = content["acceptance_criteria"]
        if isinstance(criteria, list):
            for c in criteria:
                sections.append(f"- [ ] {c}")
        else:
            sections.append(criteria)
        sections.append("")

    # -- Testing strategy --
    if content.get("testing_strategy"):
        sections.append("## Testing Strategy")
        sections.append(content["testing_strategy"])
        sections.append("")

    # -- Validation commands --
    if content.get("validation_commands"):
        sections.append("## Validation Commands")
        for cmd in content["validation_commands"]:
            sections.append(f"```bash\n{cmd}\n```")
        sections.append("")

    # -- Dependencies --
    if content.get("dependencies"):
        sections.append("## Dependencies")
        for d in content["dependencies"]:
            sections.append(f"- {d}")
        sections.append("")

    # -- Risks --
    if content.get("risks"):
        sections.append("## Risks")
        for r in content["risks"]:
            sections.append(f"- {r}")
        sections.append("")

    # -- Workflow instructions --
    sections.append("## Workflow")
    sections.append("""
1. **Read** the files listed above to understand current state
2. **Implement** the changes following acceptance criteria
3. **Test** using the validation commands
4. **Verify** all acceptance criteria are met
5. When done, summarize what was accomplished
""")

    # -- Emergent follow-up task deposit --
    sections.append("## Emergent Follow-Up Task")
    sections.append(f"""
Before finishing, deposit **at most 1** follow-up task if your work reveals a clear next step.
Insert it directly into the field:

```sql
INSERT INTO field_nodes (node_type, title, content, potential, affinity, parent_id, created_by)
VALUES (
  'task',
  'Short imperative title',
  '{{"description": "What needs to happen and why. Reference specific files."}}',
  0.7,
  ARRAY['implementer','frontend'],
  '{task['id']}'::uuid,
  'agent'
);
```

**Good follow-ups** (deposit these):
- "Add unit tests for the auth middleware added in src/middleware/auth.ts"
- "Implement error boundary for the new dashboard component"
- "Add API rate limiting to the /api/og endpoint"

**Bad follow-ups** (do NOT deposit these):
- Vague tasks: "Improve code quality" or "Add more tests"
- Duplicates of existing open tasks
- Review tasks (these are auto-created by a DB trigger)
- Tasks unrelated to the work you just did

**Rules:**
- Maximum 1 follow-up per agent session
- Must be a direct consequence of your implementation
- Skip this entirely if no clear follow-up exists
- The `--parent-id` links it to the current task for hierarchy tracking
""")

    # -- Field integration note --
    sections.append("## Field Integration")
    sections.append(f"""
This task is tracked in the field system.
- Node ID: `{task['id']}`
- When complete, the task will be marked resolved
- If blocked, describe what's blocking progress
""")

    return "\n".join(sections)


def build_prompt_from_spec(spec: dict) -> str:
    """Assemble the agent prompt from a spec file's frontmatter and body."""
    frontmatter = spec.get("frontmatter", {})
    body = spec.get("body", "")

    sections = []

    # Header
    title = frontmatter.get("title", spec.get("title", "Spec Task"))
    sections.append(f"# Spec: {title}")
    sections.append(f"**Source:** `{spec['path']}`")
    if frontmatter.get("status"):
        sections.append(f"**Status:** {frontmatter['status']}")
    sections.append("")

    # Full spec body
    sections.append(body)
    sections.append("")

    # Workflow
    sections.append("## Workflow")
    sections.append("""
1. **Read** the spec thoroughly
2. **Identify** the first actionable step
3. **Implement** following the spec's guidance
4. **Test** as specified in the testing strategy
5. **Iterate** through remaining steps
6. When complete, summarize what was accomplished
""")

    return "\n".join(sections)


# ---------------------------------------------------------------------------
# Project root detection
# ---------------------------------------------------------------------------

def _find_project_root() -> str:
    """Walk up from this script's directory to find the project root.

    Looks for markers like .git, package.json, or scripts/ directory.
    Falls back to three levels up from lib/ (lib -> scripts -> project).
    """
    current = Path(__file__).resolve().parent
    for _ in range(6):
        if (current / ".git").exists() or (current / "package.json").exists():
            return str(current)
        parent = current.parent
        if parent == current:
            break
        current = parent

    # Fallback: lib/ -> scripts/ -> project_root
    return str(Path(__file__).resolve().parent.parent.parent)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Build context bundle for agent spawning"
    )
    parser.add_argument("--task", help="Specific task node UUID")
    parser.add_argument("--spec", help="Spec file path (markdown with optional YAML frontmatter)")
    args = parser.parse_args()

    result = {
        "title": "",
        "node_id": "",
        "prompt": "",
        "model": "haiku",
    }

    # ---- Mode 1: Spec file (no database required) ----
    if args.spec:
        spec = read_spec_file(args.spec)
        if not spec:
            print(json.dumps({"error": f"Spec file not found: {args.spec}"}))
            sys.exit(1)

        result["title"] = spec["title"]
        result["prompt"] = build_prompt_from_spec(spec)
        result["model"] = spec.get("frontmatter", {}).get("model", "haiku")
        print(json.dumps(result))
        return

    # ---- Mode 2 & 3: Database-backed (specific task or auto-select) ----
    if not HAS_PSYCOPG2:
        print(json.dumps({
            "error": "psycopg2 not installed. Use --spec for spec-based spawning, "
                     "or install: pip install psycopg2-binary"
        }))
        sys.exit(1)

    conn = get_db_connection()
    if not conn:
        print(json.dumps({"error": "Could not connect to database. Check DATABASE_URL."}))
        sys.exit(1)

    try:
        if args.task:
            # Mode 2: Specific task by UUID
            task = query_task_by_id(conn, args.task)
            if not task:
                print(json.dumps({"error": f"Task not found: {args.task}"}))
                sys.exit(1)
        else:
            # Mode 3: Auto-select highest-potential open task
            task = query_highest_potential_task(conn)
            if not task:
                print(json.dumps({"error": "No open tasks in field"}))
                sys.exit(1)

        # Fetch parent context for hierarchy
        parent = None
        if task.get("parent_id"):
            parent = query_parent_context(conn, task["parent_id"])

        # Load attached context bundles, or lazy-match if none pre-attached
        bundles = query_context_bundles(conn, task["id"])
        if not bundles:
            bundles = match_and_attach_bundles(conn, task["id"], task)

        # Determine project root for skill/routing file resolution
        project_root = _find_project_root()

        result["title"] = task["title"]
        result["node_id"] = task["id"]
        result["prompt"] = build_prompt_from_task(task, parent, bundles, project_root)
        result["model"] = infer_model_from_content(
            task.get("content", {}),
            task.get("affinity", []),
        )

        print(json.dumps(result))

    finally:
        conn.close()


if __name__ == "__main__":
    main()
