#!/usr/bin/env python3
"""
Parse Claude CLI stream-json output into human-readable text.

Reads JSON-lines from stdin and extracts text content, tool usage,
tool results, and final session statistics.

Usage:
    claude -p --output-format stream-json "prompt" | python3 stream-parser.py

Message types handled:
    assistant             Full assistant message with content blocks
    content_block_delta   Streaming text delta (incremental output)
    tool_use              Tool invocation (printed as [Tool: name])
    tool_result           Tool output (printed as [Result: ...])
    result                Final summary with cost, duration, turns

Non-JSON lines are printed verbatim as a fallback.
"""

import json
import sys


def parse_stream():
    """Parse stream-json lines from stdin and print human-readable output."""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            data = json.loads(line)
        except json.JSONDecodeError:
            # Not JSON -- print raw line as fallback
            print(line, flush=True)
            continue

        msg_type = data.get("type")

        if msg_type == "assistant":
            # Full assistant message (CLI wraps API response in .message)
            message = data.get("message", data)
            content = message.get("content", [])
            for block in content:
                if block.get("type") == "text":
                    print(block.get("text", ""), end="", flush=True)
                elif block.get("type") == "tool_use":
                    tool_name = block.get("name", "unknown")
                    print(f"\n[Tool: {tool_name}]", flush=True)

        elif msg_type == "content_block_delta":
            # Incremental text delta during streaming
            delta = data.get("delta", {})
            if delta.get("type") == "text_delta":
                print(delta.get("text", ""), end="", flush=True)

        elif msg_type == "tool_result":
            # Tool execution result
            content = data.get("content", "")
            if isinstance(content, str) and len(content) < 500:
                truncated = content[:200] + "..." if len(content) > 200 else content
                print(f"\n[Result: {truncated}]", flush=True)

        elif msg_type == "result":
            # Final session result with cost and duration
            print("\n\n=== Complete ===", flush=True)

            cost = data.get("total_cost_usd") or data.get("cost")
            if cost:
                print(f"Cost: ${cost:.4f}", flush=True)

            duration = data.get("duration_ms") or data.get("duration")
            if duration:
                print(f"Duration: {duration / 1000:.1f}s", flush=True)

            turns = data.get("num_turns")
            if turns:
                print(f"Turns: {turns}", flush=True)


if __name__ == "__main__":
    parse_stream()
