#!/usr/bin/env python3
"""
Interactive Session Hooks

Features:
- Git context injection on session start
- Auto-approve read-only tools
- Block dangerous operations
- Protect sensitive files
"""

import json
import os
import subprocess
import sys

# =============================================================================
# Configuration
# =============================================================================

AUTO_APPROVE_TOOLS = {"Read", "Glob", "Grep", "LS", "Task", "WebFetch", "WebSearch"}

DANGEROUS_PATTERNS = [
    ":(){ :|:& };:",  # Fork bomb
    "> /dev/sda",
    "mkfs.",
    "dd if=/dev/zero",
]

DANGEROUS_ROOT_COMMANDS = [
    ("rm -rf /", [" ", "\t", "\n", ";", "&", "|", ""]),
    ("rm -rf /*", [" ", "\t", "\n", ";", "&", "|", ""]),
    ("chmod -R 777 /", [" ", "\t", "\n", ";", "&", "|", ""]),
]

PROTECTED_PATHS = [".env", ".env.local", ".env.production", "id_rsa", "id_ed25519", ".ssh/"]


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
# Handlers
# =============================================================================

def handle_session_start(data: dict) -> None:
    """Inject git context on session start."""
    cwd = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

    try:
        branch = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, cwd=cwd, timeout=5
        ).stdout.strip()

        commits = subprocess.run(
            ["git", "log", "--oneline", "-3"],
            capture_output=True, text=True, cwd=cwd, timeout=5
        ).stdout.strip()

        context = f"""# Session Context

## Git State
**Branch:** `{branch}`
**Recent Commits:**
```
{commits}
```"""

        output({
            "hookSpecificOutput": {
                "hookEventName": "SessionStart",
                "additionalContext": context
            }
        })
    except Exception:
        print("Success")
        sys.exit(0)


def handle_pre_tool_use(data: dict) -> None:
    """Auto-approve safe tools, block dangerous operations."""
    tool_name = data.get("tool_name", "")
    tool_input = data.get("tool_input", {})

    # Auto-approve read-only tools
    if tool_name in AUTO_APPROVE_TOOLS:
        allow(f"Read-only: {tool_name}")
        return

    # Check Bash for dangerous patterns
    if tool_name == "Bash":
        command = tool_input.get("command", "")

        for pattern in DANGEROUS_PATTERNS:
            if pattern in command:
                deny(f"Blocked dangerous pattern: {pattern}")
                return

        for pattern, terminators in DANGEROUS_ROOT_COMMANDS:
            if pattern in command:
                idx = command.find(pattern)
                after = command[idx + len(pattern):idx + len(pattern) + 1] if idx + len(pattern) < len(command) else ""
                if after in terminators:
                    deny(f"Blocked dangerous root command: {pattern}")
                    return

        if ("curl " in command or "wget " in command) and ("| sh" in command or "| bash" in command):
            deny("Blocked: piping download to shell")
            return

    # Check Write/Edit for protected files
    if tool_name in {"Write", "Edit", "MultiEdit"}:
        file_path = tool_input.get("file_path", "")
        for protected in PROTECTED_PATHS:
            if protected in file_path:
                deny(f"Protected file: {protected}")
                return

    # Default: proceed normally
    output({})


def handle_post_tool_use(data: dict) -> None:
    """Post-tool hook — extend with your own checks."""
    output({})


def noop(data: dict) -> None:
    """No-op handler for unregistered hooks."""
    output({})


# =============================================================================
# Main
# =============================================================================

HANDLERS = {
    "session_start": handle_session_start,
    "pre_tool_use": handle_pre_tool_use,
    "post_tool_use": handle_post_tool_use,
}


def main(hook_type: str, data: dict) -> None:
    handler = HANDLERS.get(hook_type, noop)
    handler(data)
