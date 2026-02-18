#!/usr/bin/env bash
# Context Graph - Quick Setup
# Usage: ./setup.sh

set -euo pipefail

echo "=== Context Graph Setup ==="
echo ""

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Error: docker is required but not installed."; exit 1; }
command -v docker compose >/dev/null 2>&1 || command -v docker-compose >/dev/null 2>&1 || { echo "Error: docker compose is required."; exit 1; }

# Create .env if not exists
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  # Generate random passwords
  POSTGRES_PW=$(openssl rand -base64 24 | tr -d '/+=')
  REDIS_PW=$(openssl rand -base64 24 | tr -d '/+=')
  sed -i "s/change-this-password/$POSTGRES_PW/" .env
  sed -i "s/change-this-redis-password/$REDIS_PW/" .env
  echo "Generated secure passwords in .env"
  echo ""
  echo "IMPORTANT: Add your API keys to .env:"
  echo "  ANTHROPIC_API_KEY=sk-ant-..."
  echo "  OPENAI_API_KEY=sk-..."
  echo ""
fi

# Start services
echo "Starting services..."
docker compose up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 5

# Check health
for i in {1..30}; do
  if curl -sf http://localhost:${API_PORT:-8100}/health > /dev/null 2>&1; then
    echo ""
    echo "=== Context Graph is running! ==="
    echo ""
    echo "  API:     http://localhost:${API_PORT:-8100}"
    echo "  Docs:    http://localhost:${API_PORT:-8100}/docs"
    echo "  Qdrant:  http://localhost:${QDRANT_HTTP_PORT:-6333}/dashboard"
    echo ""
    echo "Next steps:"
    echo "  1. Add API keys to .env (for embeddings & extraction)"
    echo "  2. Configure MCP server in Claude Code (see mcp/ directory)"
    echo "  3. Use the context-graph skill: /context-graph"
    echo ""
    exit 0
  fi
  sleep 2
done

echo "Warning: API didn't become healthy in 60s. Check: docker compose logs knowledge-api"
