#!/usr/bin/env python3
"""
Hook Router — Routes to interactive or swarm handler based on mode.

Usage: python hooks.py <hook_type>
Hook types: session_start, pre_tool_use, post_tool_use, user_prompt_submit, stop
"""

import json
import os
import sys

IS_SWARM = os.environ.get("SWARM_AGENT") == "true"


def main():
    if len(sys.argv) < 2:
        print("Usage: python hooks.py <hook_type>", file=sys.stderr)
        sys.exit(1)

    hook_type = sys.argv[1].lower()

    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        data = {}

    if IS_SWARM:
        from swarm import main as swarm_main
        swarm_main(hook_type, data)
    else:
        # Fall back to interactive hooks (from agentic-layer template)
        try:
            from interactive import main as interactive_main
            interactive_main(hook_type, data)
        except ImportError:
            # interactive.py is provided by the agentic-layer template.
            # If not installed, pass through silently (no hooks applied).
            print(json.dumps({}))


if __name__ == "__main__":
    main()
