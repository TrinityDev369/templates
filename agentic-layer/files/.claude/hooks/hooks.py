#!/usr/bin/env python3
"""
Hook Router — Routes hook events to the interactive handler.

Usage: python hooks.py <hook_type>
Hook types: session_start, pre_tool_use, post_tool_use
"""

import json
import os
import sys


def main():
    if len(sys.argv) < 2:
        print("Usage: python hooks.py <hook_type>", file=sys.stderr)
        sys.exit(1)

    hook_type = sys.argv[1].lower()

    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        data = {}

    from interactive import main as interactive_main
    interactive_main(hook_type, data)


if __name__ == "__main__":
    main()
