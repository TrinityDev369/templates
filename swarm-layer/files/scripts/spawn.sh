#!/bin/bash
# Swarm Spawn — Context-Bundle Based Agent Spawning
# Usage: bash scripts/spawn.sh [options]
#
# Options:
#   --task <id>        Spawn for specific task ID
#   --spec <path>      Spawn with specific spec file (no field query)
#   --model <model>    Model: opus, sonnet, haiku (overrides auto-detection)
#   --dry-run          Print prompt without spawning
#   --background       Run in background
#   --resume <id>      Resume previous session
#
# Philosophy: Identity emerges from context, not configuration.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load env
[ -f "$PROJECT_ROOT/.env" ] && { set -a; source "$PROJECT_ROOT/.env"; set +a; }
[ -f "$PROJECT_ROOT/.env.local" ] && { set -a; source "$PROJECT_ROOT/.env.local"; set +a; }

# Defaults
MODEL=""
MODEL_EXPLICIT=""
DRY_RUN=""
BACKGROUND=""
TASK_ID=""
SPEC_PATH=""
RESUME_ID=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --task) TASK_ID="$2"; shift 2 ;;
    --spec) SPEC_PATH="$2"; shift 2 ;;
    --model) MODEL="$2"; MODEL_EXPLICIT="true"; shift 2 ;;
    --dry-run) DRY_RUN="true"; shift ;;
    --background) BACKGROUND="true"; shift ;;
    --resume) RESUME_ID="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# Generate worker ID
WORKER_ID="worker-$(date +%s | tail -c 6)-$(head /dev/urandom | tr -dc 'a-z0-9' | head -c 4)"

echo "Swarm Spawn (Context-Bundle)"
echo "============================="

# Resume mode
if [ -n "$RESUME_ID" ]; then
  echo "Resuming session: $RESUME_ID"
  exec claude --resume "$RESUME_ID"
fi

# Build context bundle
CONTEXT_JSON=$(python3 "$SCRIPT_DIR/lib/build-context-bundle.py" \
  ${TASK_ID:+--task "$TASK_ID"} \
  ${SPEC_PATH:+--spec "$SPEC_PATH"} \
  2>&1)

if echo "$CONTEXT_JSON" | grep -q '"error"'; then
  echo "Failed to build context bundle:"
  echo "$CONTEXT_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error', 'Unknown error'))"
  exit 1
fi

# Extract fields
TASK_TITLE=$(echo "$CONTEXT_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('title', 'Unknown Task'))")
TASK_NODE_ID=$(echo "$CONTEXT_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('node_id', ''))")
PROMPT=$(echo "$CONTEXT_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('prompt', ''))")
SUGGESTED_MODEL=$(echo "$CONTEXT_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('model', 'haiku'))")

# Model selection
if [ -z "$MODEL_EXPLICIT" ]; then
  MODEL="${SUGGESTED_MODEL:-haiku}"
fi
[ -z "$MODEL" ] && MODEL="haiku"

echo "Worker ID: $WORKER_ID"
echo "Task: $TASK_TITLE"
[ -n "$TASK_NODE_ID" ] && echo "Node ID: $TASK_NODE_ID"
echo "Model: $MODEL"
echo ""

if [ "$DRY_RUN" = "true" ]; then
  echo "Context Bundle (dry-run):"
  echo "----------------------------"
  echo "$PROMPT"
  exit 0
fi

# Set up git worktree for isolated work
WORKTREE_DIR="$PROJECT_ROOT/.worktrees/$WORKER_ID"
BRANCH_NAME="agent/$WORKER_ID"

if [ -n "$TASK_NODE_ID" ]; then
  echo "Creating worktree: $WORKTREE_DIR"
  git -C "$PROJECT_ROOT" worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" HEAD 2>/dev/null || {
    echo "Worktree creation failed, using main tree"
    WORKTREE_DIR="$PROJECT_ROOT"
    BRANCH_NAME=""
  }
  if [ "$WORKTREE_DIR" != "$PROJECT_ROOT" ]; then
    # Link MCP config and copy hooks
    [ -f "$PROJECT_ROOT/.mcp.json" ] && ln -sf "$PROJECT_ROOT/.mcp.json" "$WORKTREE_DIR/.mcp.json"
    cp -f "$PROJECT_ROOT/.claude/hooks/"*.py "$WORKTREE_DIR/.claude/hooks/" 2>/dev/null || true
  fi
else
  WORKTREE_DIR="$PROJECT_ROOT"
fi

# Prepare claude command
CLAUDE_ARGS=(--model "$MODEL" --dangerously-skip-permissions)

# Log setup
LOG_DIR="$PROJECT_ROOT/logs/workers"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/${WORKER_ID}.log"
PROMPT_FILE="$LOG_DIR/${WORKER_ID}.prompt.md"

echo "$PROMPT" > "$PROMPT_FILE"
echo "Prompt: $PROMPT_FILE"
echo "Logs: $LOG_FILE"
[ -n "$BRANCH_NAME" ] && echo "Branch: $BRANCH_NAME"
echo ""

# Set swarm environment variables
export SWARM_AGENT=true
export SWARM_AGENT_ID="$WORKER_ID"
export SWARM_TASK_ID="$TASK_NODE_ID"

# Claim task
if [ -n "$TASK_NODE_ID" ]; then
  python3 "$SCRIPT_DIR/lib/claim-task.py" "$TASK_NODE_ID" "$WORKER_ID" 2>/dev/null || true
fi

# Background heartbeat
HEARTBEAT_PID=""
if [ -n "$TASK_NODE_ID" ] && [ -n "$DATABASE_URL" ]; then
  (
    while true; do
      sleep 30
      psql "$DATABASE_URL" -q -c \
        "UPDATE agent_presence SET last_heartbeat = NOW() WHERE agent_id = '${WORKER_ID}';" 2>/dev/null || true
    done
  ) &
  HEARTBEAT_PID=$!
fi

# Spawn
echo "Spawning worker..."
echo ""

cd "$WORKTREE_DIR"
claude "${CLAUDE_ARGS[@]}" -p < "$PROMPT_FILE" 2>&1 | tee "$LOG_FILE"
EXIT_CODE=${PIPESTATUS[0]}

# Cleanup
[ -n "$HEARTBEAT_PID" ] && kill "$HEARTBEAT_PID" 2>/dev/null

if [ -n "$TASK_NODE_ID" ] && [ -n "$DATABASE_URL" ]; then
  psql "$DATABASE_URL" -q -c \
    "UPDATE agent_presence SET lifecycle_state = 'terminated', last_heartbeat = NOW() - INTERVAL '1 hour' WHERE agent_id = '${WORKER_ID}';" 2>/dev/null || true
fi

if [ $EXIT_CODE -eq 0 ] && [ -n "$TASK_NODE_ID" ]; then
  echo ""
  echo "Worker completed successfully"
fi

# Merge agent branch back to main
if [ "$WORKTREE_DIR" != "$PROJECT_ROOT" ] && [ -d "$WORKTREE_DIR" ]; then
  AGENT_COMMITS=$(git -C "$PROJECT_ROOT" log main.."$BRANCH_NAME" --oneline 2>/dev/null | wc -l)

  if [ "$AGENT_COMMITS" -gt 0 ]; then
    echo "Merging $AGENT_COMMITS commit(s) from $BRANCH_NAME into main"
    git -C "$PROJECT_ROOT" merge "$BRANCH_NAME" --no-edit 2>/dev/null || {
      echo "Merge conflict — keeping branch $BRANCH_NAME for manual resolution"
      git -C "$PROJECT_ROOT" merge --abort 2>/dev/null || true
      git -C "$PROJECT_ROOT" worktree remove "$WORKTREE_DIR" --force 2>/dev/null || true
      exit $EXIT_CODE
    }
  fi

  echo "Cleaning worktree and branch"
  git -C "$PROJECT_ROOT" worktree remove "$WORKTREE_DIR" --force 2>/dev/null || true
  git -C "$PROJECT_ROOT" branch -D "$BRANCH_NAME" 2>/dev/null || true
fi

echo "Full log: $LOG_FILE"
exit $EXIT_CODE
