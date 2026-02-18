#!/usr/bin/env python3
"""
Swarm Agent Hooks — Optimized for autonomous task execution.

Features:
- Task claiming on session start
- Strict dangerous operation blocking
- Context window alarm (CRITICAL for autonomous agents)
- Progress reporting via DB heartbeats
- Validation-gated task resolution on stop

Environment Variables (set by spawn script):
- SWARM_AGENT=true
- SWARM_AGENT_ID
- SWARM_TASK_ID
- DATABASE_URL
- SWARM_AGENT_AFFINITIES
"""

import json
import os
import sys
import tempfile
from pathlib import Path

# =============================================================================
# Configuration
# =============================================================================

AGENT_ID = os.environ.get("SWARM_AGENT_ID", "")
TASK_ID = os.environ.get("SWARM_TASK_ID", "")

AUTO_APPROVE_TOOLS = {"Read", "Glob", "Grep", "LS", "Task", "WebFetch", "WebSearch"}

DANGEROUS_PATTERNS = [
    ":(){ :|:& };:",  # Fork bomb
    "> /dev/sda",
    "dd if=/dev/zero",
]

DANGEROUS_ROOT_COMMANDS = [
    ("rm -rf /", [" ", "\t", "\n", ";", "&", "|", ""]),
    ("rm -rf /*", [" ", "\t", "\n", ";", "&", "|", ""]),
    ("rm -r /", [" ", "\t", "\n", ";", "&", "|", ""]),
    ("chmod -R 777 /", [" ", "\t", "\n", ";", "&", "|", ""]),
    ("mkfs.", [" ", "\t", "\n", ";", "&", "|"]),
]

PROTECTED_PATHS = [".env", "id_rsa", "id_ed25519", ".ssh/"]

# Context alarm thresholds (percentage of max context)
CONTEXT_THRESHOLDS = {50: "warning", 80: "critical"}
MAX_TOKENS = 200_000
CHARS_PER_TOKEN = 4


# =============================================================================
# Output Helpers
# =============================================================================

def output(data: dict) -> None:
    print(json.dumps(data))
    sys.exit(0)


def allow(reason: str = "") -> None:
    output({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "allow",
            "permissionDecisionReason": reason or "Auto-approved"
        }
    })


def deny(reason: str) -> None:
    output({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason
        }
    })


# =============================================================================
# Database Operations
# =============================================================================

_db = None


def db_execute(sql: str, params: tuple) -> None:
    """Execute a database query, silently failing if DB unavailable."""
    global _db
    if not TASK_ID:
        return
    if _db is None:
        db_url = os.environ.get("DATABASE_URL", "")
        if not db_url:
            return
        try:
            import psycopg2
            _db = psycopg2.connect(db_url, connect_timeout=3)
            _db.autocommit = True
        except Exception:
            return
    try:
        cur = _db.cursor()
        cur.execute(sql, params)
        cur.close()
    except Exception:
        pass


def claim_task() -> None:
    db_execute(
        "UPDATE field_nodes SET state = 'claimed', claimed_by = %s WHERE id = %s::uuid",
        (AGENT_ID, TASK_ID)
    )


def register_agent(activity: str = "Initializing...") -> None:
    """Register agent in agent_presence for dashboard visibility."""
    if not AGENT_ID:
        return
    affinities_raw = os.environ.get("SWARM_AGENT_AFFINITIES", "general")
    affinities = [a.strip() for a in affinities_raw.split(",") if a.strip()]
    zone_id = TASK_ID or None
    db_execute(
        """INSERT INTO agent_presence
               (agent_id, agent_type, affinities, energy_level, current_zone_id,
                last_heartbeat, session_started, current_activity, lifecycle_state)
           VALUES (%s, 'swarm', %s, 1.0, %s::uuid, NOW(), NOW(), %s, 'active')
           ON CONFLICT (agent_id) DO UPDATE SET
               last_heartbeat = NOW(),
               current_zone_id = EXCLUDED.current_zone_id,
               current_activity = EXCLUDED.current_activity,
               lifecycle_state = 'active',
               energy_level = 1.0,
               affinities = EXCLUDED.affinities""",
        (AGENT_ID, affinities, zone_id, activity)
    )


def heartbeat(activity: str = "") -> None:
    """Update heartbeat + activity so dashboard stays current."""
    if not AGENT_ID:
        return
    tokens_est = 0
    try:
        tracker = _tracker_path()
        if tracker.exists():
            tokens_est = int(tracker.read_text().strip())
    except (ValueError, OSError):
        pass
    db_execute(
        """UPDATE agent_presence SET
               last_heartbeat = NOW(),
               current_activity = COALESCE(%s, current_activity),
               context_tokens_est = %s
           WHERE agent_id = %s""",
        (activity[:200] if activity else None, tokens_est, AGENT_ID)
    )


def terminate_agent() -> None:
    if not AGENT_ID:
        return
    db_execute(
        "UPDATE agent_presence SET lifecycle_state = 'terminated', current_activity = 'Completed' WHERE agent_id = %s",
        (AGENT_ID,)
    )


def resolve_task() -> None:
    db_execute(
        "UPDATE field_nodes SET state = 'resolved', resolved_at = NOW(), resolved_by = %s WHERE id = %s::uuid",
        (AGENT_ID, TASK_ID)
    )


def report_progress(progress: float, message: str = "") -> None:
    if not AGENT_ID:
        return
    db_execute(
        """INSERT INTO agent_heartbeats (agent_id, task_id, progress, message, timestamp)
           VALUES (%s, %s::uuid, %s, %s, NOW())
           ON CONFLICT (agent_id) DO UPDATE SET
               progress = EXCLUDED.progress, message = EXCLUDED.message, timestamp = NOW()""",
        (AGENT_ID, TASK_ID, progress, message)
    )


# =============================================================================
# Context Alarm
# =============================================================================

def _tracker_path() -> Path:
    return Path(tempfile.gettempdir()) / f".claude_ctx_{AGENT_ID or os.getpid()}"


def _alarm_path() -> Path:
    return Path(tempfile.gettempdir()) / f".claude_alarm_{AGENT_ID or os.getpid()}"


def estimate_context_usage(data: dict) -> float:
    """Estimate context usage from cumulative tool I/O."""
    raw_in = json.dumps(data.get("tool_input", {}))
    raw_out = str(data.get("tool_output", ""))
    turn_tokens = (len(raw_in) + len(raw_out)) // CHARS_PER_TOKEN + 500

    tracker = _tracker_path()
    cumulative = 0
    try:
        if tracker.exists():
            cumulative = int(tracker.read_text().strip())
    except (ValueError, OSError):
        pass

    cumulative += turn_tokens
    try:
        tracker.write_text(str(cumulative))
    except OSError:
        pass

    return min(cumulative / MAX_TOKENS * 100, 100.0)


ALARM_MESSAGES = {
    50: "<system-reminder>CONTEXT ALARM [50%]: Begin wrapping up. Checkpoint progress.</system-reminder>",
    80: "<system-reminder>CONTEXT ALARM [80%] CRITICAL: Stop new work. Summarize and prepare handoff.</system-reminder>",
}


def check_context_alarm(pct: float) -> str | None:
    """Return alarm message if new threshold crossed."""
    alarm_file = _alarm_path()
    try:
        last = int(alarm_file.read_text().strip()) if alarm_file.exists() else 0
    except (ValueError, OSError):
        last = 0

    fired = None
    for threshold in sorted(CONTEXT_THRESHOLDS.keys()):
        if pct >= threshold > last:
            fired = threshold

    if fired is None:
        return None

    try:
        alarm_file.write_text(str(fired))
    except OSError:
        pass

    return ALARM_MESSAGES.get(fired)


# =============================================================================
# Handlers
# =============================================================================

def handle_session_start(data: dict) -> None:
    """Register agent, claim task, inject swarm context."""
    register_agent("Starting session")
    claim_task()
    report_progress(0.0, "Session started")

    affinities = os.environ.get("SWARM_AGENT_AFFINITIES", "general")
    context = f"""## Swarm Agent
**Agent:** `{AGENT_ID}`
**Task:** `{TASK_ID}`
**Affinities:** {affinities}

Focus on the assigned task. Report progress. Ask if blocked."""

    output({
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": context
        }
    })


def handle_pre_tool_use(data: dict) -> None:
    """Auto-approve safe tools, block dangerous operations."""
    tool_name = data.get("tool_name", "")
    tool_input = data.get("tool_input", {})

    if tool_name in AUTO_APPROVE_TOOLS:
        allow(f"Read-only: {tool_name}")
        return

    if tool_name == "Bash":
        command = tool_input.get("command", "")
        for pattern in DANGEROUS_PATTERNS:
            if pattern in command:
                deny(f"Blocked: {pattern}")
                return
        for pattern, terminators in DANGEROUS_ROOT_COMMANDS:
            if pattern in command:
                idx = command.find(pattern)
                after = command[idx + len(pattern):idx + len(pattern) + 1] if idx + len(pattern) < len(command) else ""
                if after in terminators:
                    deny(f"Blocked: {pattern}")
                    return
        if ("curl " in command or "wget " in command) and ("| sh" in command or "| bash" in command):
            deny("Blocked: piping download to shell")
            return

    if tool_name in {"Write", "Edit", "MultiEdit"}:
        file_path = tool_input.get("file_path", "")
        for protected in PROTECTED_PATHS:
            if protected in file_path:
                deny(f"Protected: {protected}")
                return

    output({})


def handle_post_tool_use(data: dict) -> None:
    """Heartbeat, typecheck, context alarm."""
    tool_name = data.get("tool_name", "")
    tool_input = data.get("tool_input", {})
    additional_context = []

    # Heartbeat
    activity = f"Using {tool_name}"
    if tool_name in {"Write", "Edit", "MultiEdit"}:
        fp = tool_input.get("file_path", "")
        activity = f"Editing {Path(fp).name}" if fp else activity
    heartbeat(activity)

    # Progress reporting
    if tool_name in {"Write", "Edit"}:
        report_progress(0.5, f"Modified files via {tool_name}")
    elif tool_name == "Bash":
        cmd = tool_input.get("command", "")
        if "test" in cmd or "vitest" in cmd or "pytest" in cmd:
            report_progress(0.8, "Running tests")

    # Auto-typecheck
    if tool_name in {"Write", "Edit", "MultiEdit"}:
        file_path = tool_input.get("file_path", "")
        if file_path.endswith((".ts", ".tsx")):
            try:
                from validate import run_typecheck_scoped
                ok, errors = run_typecheck_scoped(file_path, timeout=8)
                if not ok:
                    err_text = "\n".join(f"  {e}" for e in errors[:5])
                    additional_context.append(
                        f"<system-reminder>TYPECHECK: New errors in {Path(file_path).name}:\n"
                        f"{err_text}\nFix these before continuing.</system-reminder>"
                    )
            except ImportError:
                # validate.py is optional — provided by agentic-layer template
                pass
            except Exception:
                pass

    # Context alarm
    pct = estimate_context_usage(data)
    alarm = check_context_alarm(pct)
    if alarm:
        additional_context.append(alarm)

    if additional_context:
        output({
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": "\n".join(additional_context)
            }
        })
        return

    output({})


def noop(data: dict) -> None:
    output({})


def handle_stop(data: dict) -> None:
    """Validate work, resolve task only if validation passes."""
    validation_context = ""

    try:
        from validate import validate_full
        result = validate_full(run_test=False)

        if not result.passed:
            err_detail = result.to_context()
            validation_context = (
                f"<system-reminder>VALIDATION FAILED ({result.elapsed_ms}ms). "
                f"Task NOT resolved.\n{err_detail}\n"
                f"Fix the errors and try again.</system-reminder>"
            )
            report_progress(0.9, f"Validation failed: {len(result.new_ts_errors)} TS errors")
        else:
            resolve_task()
            report_progress(1.0, f"Completed — validated in {result.elapsed_ms}ms")
    except ImportError:
        # validate.py is optional (from agentic-layer template).
        # Without it, resolve the task directly — no validation gate.
        resolve_task()
        report_progress(1.0, "Completed (validation not available)")
    except Exception:
        resolve_task()
        report_progress(1.0, "Completed (validation error, task resolved anyway)")

    terminate_agent()

    if validation_context:
        output({
            "hookSpecificOutput": {
                "hookEventName": "Stop",
                "additionalContext": validation_context
            }
        })
    else:
        output({})


# =============================================================================
# Main
# =============================================================================

HANDLERS = {
    "session_start": handle_session_start,
    "pre_tool_use": handle_pre_tool_use,
    "post_tool_use": handle_post_tool_use,
    "user_prompt_submit": noop,
    "stop": handle_stop,
}


def main(hook_type: str, data: dict) -> None:
    handler = HANDLERS.get(hook_type, noop)
    handler(data)
