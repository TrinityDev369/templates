#!/bin/bash
# Knowledge Graph MCP Server runner
# Loads environment and starts the MCP server

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment from root .env if exists
if [ -f "../../.env" ]; then
  set -a
  source "../../.env"
  set +a
fi

# Default API URL if not set
export KNOWLEDGE_API_URL="${KNOWLEDGE_API_URL:-http://localhost:8100}"
export KG_PROJECT="${KG_PROJECT:-my-project}"

exec node dist/server.js
