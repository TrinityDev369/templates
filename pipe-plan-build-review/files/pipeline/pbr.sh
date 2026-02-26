#!/bin/bash
# pbr.sh — Plan, Build, Review, Fix Pipeline Orchestrator
#
# A project-agnostic pipeline that drives Claude through structured phases:
#   Plan -> Build -> Review -> Fix (if needed, max N rounds)
#
# Usage:
#   ./pipeline/pbr.sh "Add user authentication"                # Full pipeline
#   ./pipeline/pbr.sh --from build --spec specs/auth.md        # Start from build
#   ./pipeline/pbr.sh --from review                            # Review only
#   ./pipeline/pbr.sh "Quick fix" --model opus --no-review     # Custom model, skip review
#   ./pipeline/pbr.sh --dry-run "Test feature"                 # Show prompts, no execution
#   ./pipeline/pbr.sh --max-fixes 3 "Tricky refactor"          # Up to 3 fix rounds
#
# Phases:
#   1. Plan   — Generate a spec from a feature description
#   2. Build  — Implement the spec (commits to a worktree branch)
#   3. Review — Diff-based code review producing a verdict
#   4. Fix    — Address review findings (loops back to review)
#
# Requirements:
#   - git (for worktree isolation)
#   - claude CLI (Claude Code)
#   - python3 (for prompt template rendering)
#
# Directory layout (expected at project root):
#   pipeline/
#     pbr.sh              <- this file
#     lib/focus.sh         <- .claudeignore generation
#     lib/spawn-phase.sh   <- Claude CLI spawner
#     lib/gates.sh         <- quality gates between phases
#     phases/*.json        <- phase configuration files
#     prompts/*.md         <- prompt templates

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/lib/focus.sh"
source "$SCRIPT_DIR/lib/spawn-phase.sh"
source "$SCRIPT_DIR/lib/gates.sh"

# =============================================================================
# Helpers
# =============================================================================

# Resolve spec file: check worktree first, fall back to project root
# Usage: resolve_spec_path -> sets local_spec
resolve_spec_path() {
  local_spec="$WORKTREE_DIR/$SPEC_PATH"
  if [ ! -f "$local_spec" ]; then
    local_spec="$PROJECT_ROOT/$SPEC_PATH"
  fi
}

# Read spec content from resolved path
# Usage: read_spec_content -> sets spec_content
read_spec_content() {
  resolve_spec_path
  spec_content=""
  [ -f "$local_spec" ] && spec_content=$(cat "$local_spec")
}

# Find review file: check expected path, fall back to find
# Usage: find_review_file -> sets review_file
find_review_file() {
  review_file="$WORKTREE_DIR/$REVIEW_PATH"
  if [ ! -f "$review_file" ]; then
    review_file=$(find "$WORKTREE_DIR/docs/reviews" -name "*${SLUG}*" -type f 2>/dev/null | sort | tail -1)
  fi
}

# =============================================================================
# Argument Parsing
# =============================================================================

DESCRIPTION=""
FROM_PHASE="plan"
SPEC_PATH=""
MODEL_OVERRIDE=""
NO_REVIEW=""
DRY_RUN=""
MAX_FIX_ROUNDS=2

while [[ $# -gt 0 ]]; do
  case $1 in
    --from)       FROM_PHASE="$2"; shift 2 ;;
    --spec)       SPEC_PATH="$2"; shift 2 ;;
    --model)      MODEL_OVERRIDE="$2"; shift 2 ;;
    --no-review)  NO_REVIEW="true"; shift ;;
    --dry-run)    DRY_RUN="true"; shift ;;
    --max-fixes)  MAX_FIX_ROUNDS="$2"; shift 2 ;;
    --help|-h)
      head -18 "$0" | tail -16
      exit 0
      ;;
    -*)           echo "Unknown option: $1"; exit 1 ;;
    *)            DESCRIPTION="$1"; shift ;;
  esac
done

if [ -z "$DESCRIPTION" ] && [ "$FROM_PHASE" = "plan" ]; then
  echo "Usage: pbr \"Feature description\" [options]"
  echo "Run with --help for full usage."
  exit 1
fi

# =============================================================================
# Setup
# =============================================================================

RUN_ID="pbr-$(date +%s | tail -c 6)-$(head /dev/urandom | tr -dc 'a-z0-9' | head -c 4)"
SLUG=$(echo "$DESCRIPTION" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g; s/-\+/-/g; s/^-//; s/-$//' | head -c 60)
BRANCH_NAME="pbr/$SLUG"

# If no slug (e.g., --from review with no description), derive from spec
if [ -z "$SLUG" ] && [ -n "$SPEC_PATH" ]; then
  SLUG=$(basename "$SPEC_PATH" .md)
  DESCRIPTION=$(head -5 "$SPEC_PATH" | grep -m1 "^# \|^## Objective" | sed 's/^#* *//')
  [ -z "$DESCRIPTION" ] && DESCRIPTION="$SLUG"
fi

[ -z "$SPEC_PATH" ] && SPEC_PATH="specs/${SLUG}.md"

LOG_DIR="$PROJECT_ROOT/logs/pipeline"
mkdir -p "$LOG_DIR"

export RUN_ID SLUG DESCRIPTION SPEC_PATH MODEL_OVERRIDE DRY_RUN LOG_DIR PROJECT_ROOT

echo "PBR Pipeline"
echo "======================================="
echo "  Run:         $RUN_ID"
echo "  Feature:     $DESCRIPTION"
echo "  Slug:        $SLUG"
echo "  Spec:        $SPEC_PATH"
echo "  From phase:  $FROM_PHASE"
echo "  Model:       ${MODEL_OVERRIDE:-per-phase defaults}"
echo "  Review:      $([ "$NO_REVIEW" = "true" ] && echo "disabled" || echo "enabled")"
echo "  Dry run:     ${DRY_RUN:-no}"
echo "======================================="
echo ""

# =============================================================================
# Worktree Setup
# =============================================================================

WORKTREE_DIR="$PROJECT_ROOT"
DRY_RUN_TMPDIR=""

if [ "$DRY_RUN" = "true" ]; then
  DRY_RUN_TMPDIR=$(mktemp -d)
  WORKTREE_DIR="$DRY_RUN_TMPDIR"
  cp "$PROJECT_ROOT/CLAUDE.md" "$WORKTREE_DIR/" 2>/dev/null || true
  mkdir -p "$WORKTREE_DIR/specs" "$WORKTREE_DIR/docs/reviews"
else
  WORKTREE_DIR="$PROJECT_ROOT/.worktrees/$RUN_ID"
  echo "Creating worktree: $WORKTREE_DIR"
  git -C "$PROJECT_ROOT" worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" HEAD 2>/dev/null || {
    echo "  Worktree creation failed, using main tree"
    WORKTREE_DIR="$PROJECT_ROOT"
    BRANCH_NAME="$(git -C "$PROJECT_ROOT" branch --show-current)"
  }

  # Link essential config into worktree (lightweight, no env-var copying)
  if [ "$WORKTREE_DIR" != "$PROJECT_ROOT" ]; then
    for f in ".env" ".env.local" "CLAUDE.md"; do
      [ -f "$PROJECT_ROOT/$f" ] && ln -sf "$PROJECT_ROOT/$f" "$WORKTREE_DIR/$f"
    done
  fi
fi

# =============================================================================
# Cleanup trap
# =============================================================================

cleanup() {
  local exit_code=$?

  [ -n "$DRY_RUN_TMPDIR" ] && rm -rf "$DRY_RUN_TMPDIR"

  if [ "$DRY_RUN" = "true" ]; then
    exit $exit_code
  fi

  if [ "$WORKTREE_DIR" != "$PROJECT_ROOT" ] && [ -d "$WORKTREE_DIR" ]; then
    local agent_commits
    agent_commits=$(git -C "$PROJECT_ROOT" log main.."$BRANCH_NAME" --oneline 2>/dev/null | wc -l)

    if [ "$agent_commits" -gt 0 ]; then
      echo ""
      echo "Merging $agent_commits commit(s) from $BRANCH_NAME into main"
      git -C "$PROJECT_ROOT" merge "$BRANCH_NAME" --no-edit 2>/dev/null || {
        echo "  Merge conflict -- keeping branch $BRANCH_NAME for manual resolution"
        git -C "$PROJECT_ROOT" merge --abort 2>/dev/null || true
        git -C "$PROJECT_ROOT" worktree remove "$WORKTREE_DIR" --force 2>/dev/null || true
        exit $exit_code
      }
    fi

    echo "Cleaning worktree"
    git -C "$PROJECT_ROOT" worktree remove "$WORKTREE_DIR" --force 2>/dev/null || true
    git -C "$PROJECT_ROOT" branch -D "$BRANCH_NAME" 2>/dev/null || true
  fi

  exit $exit_code
}
trap cleanup EXIT

# =============================================================================
# Phase Execution
# =============================================================================

# Map phase name to index for --from support
phase_index() {
  case "$1" in
    plan)   echo 0 ;;
    build)  echo 1 ;;
    review) echo 2 ;;
    fix)    echo 3 ;;
    *)      echo 0 ;;
  esac
}

START_INDEX=$(phase_index "$FROM_PHASE")

# Shared state across review/fix phases
review_file=""
REVIEW_PATH="docs/reviews/review_$(date +%Y-%m-%d)_${SLUG}.md"

# ---------- PLAN ----------
if [ "$START_INDEX" -le 0 ]; then
  echo "--- Phase 1: PLAN ---"
  echo "  [plan] Generating spec for: $DESCRIPTION"

  mkdir -p "$WORKTREE_DIR/specs"
  spawn_phase "plan" "$WORKTREE_DIR" "$DESCRIPTION" "$SLUG" "$PROJECT_ROOT"

  # Resolve spec path (agent may have used a slightly different name)
  local_spec="$WORKTREE_DIR/$SPEC_PATH"
  if [ ! -f "$local_spec" ]; then
    found_spec=$(find "$WORKTREE_DIR/specs" -name "${SLUG}*" -type f 2>/dev/null | head -1)
    [ -n "$found_spec" ] && local_spec="$found_spec"
  fi

  echo ""
  if [ "$DRY_RUN" != "true" ]; then
    gate_plan "$local_spec"
  else
    echo "  Skipping gate (dry-run)"
  fi
  echo ""
fi

# ---------- BUILD ----------
if [ "$START_INDEX" -le 1 ]; then
  echo "--- Phase 2: BUILD ---"
  echo "  [build] Implementing: $DESCRIPTION"

  read_spec_content

  spawn_phase "build" "$WORKTREE_DIR" "$DESCRIPTION" "$SLUG" "$PROJECT_ROOT" \
    "SPEC_CONTENT" "$spec_content"

  echo ""
  if [ "$DRY_RUN" != "true" ]; then
    gate_build "$WORKTREE_DIR" "$BRANCH_NAME"
  fi
  echo ""
fi

# ---------- REVIEW ----------
if [ "$START_INDEX" -le 2 ] && [ "$NO_REVIEW" != "true" ]; then
  echo "--- Phase 3: REVIEW ---"
  echo "  [review] Reviewing changes for: $DESCRIPTION"

  diff_content=""
  if [ "$DRY_RUN" != "true" ]; then
    diff_content=$(git -C "$WORKTREE_DIR" diff main.."$BRANCH_NAME" 2>/dev/null \
      || git -C "$WORKTREE_DIR" diff HEAD~5 2>/dev/null \
      || echo "No diff available")
  fi

  read_spec_content
  mkdir -p "$WORKTREE_DIR/docs/reviews"

  spawn_phase "review" "$WORKTREE_DIR" "$DESCRIPTION" "$SLUG" "$PROJECT_ROOT" \
    "SPEC_CONTENT" "$spec_content" \
    "DIFF" "$diff_content"

  echo ""

  # Check review verdict (gate_review returns 1 for NEEDS FIXES, 0 otherwise)
  review_verdict=0
  if [ "$DRY_RUN" != "true" ]; then
    find_review_file
    gate_review "$review_file" || review_verdict=$?
  else
    echo "  Skipping gate (dry-run)"
  fi

  # ---------- FIX (if needed) ----------
  if [ "$review_verdict" -eq 1 ]; then
    fix_round=0
    while [ $fix_round -lt $MAX_FIX_ROUNDS ] && [ "$review_verdict" -eq 1 ]; do
      fix_round=$((fix_round + 1))
      echo ""
      echo "--- Phase 4: FIX (round $fix_round/$MAX_FIX_ROUNDS) ---"
      echo "  [fix] Applying fixes (round $fix_round): $DESCRIPTION"

      review_content=""
      [ -n "$review_file" ] && [ -f "$review_file" ] && review_content=$(cat "$review_file")

      spawn_phase "fix" "$WORKTREE_DIR" "$DESCRIPTION" "$SLUG" "$PROJECT_ROOT" \
        "REVIEW_CONTENT" "$review_content"

      echo ""

      # Re-review after fixes (skip on last round -- nothing more to fix)
      if [ $fix_round -lt $MAX_FIX_ROUNDS ]; then
        echo "  Re-running review after fixes..."
        diff_content=$(git -C "$WORKTREE_DIR" diff main.."$BRANCH_NAME" 2>/dev/null || echo "No diff")

        spawn_phase "review" "$WORKTREE_DIR" "$DESCRIPTION" "$SLUG" "$PROJECT_ROOT" \
          "SPEC_CONTENT" "$spec_content" \
          "DIFF" "$diff_content"

        find_review_file
        review_verdict=0
        gate_review "$review_file" || review_verdict=$?
      fi
    done

    if [ "$review_verdict" -eq 1 ]; then
      echo ""
      echo "  Max fix rounds reached -- remaining issues need manual attention"
    fi
  fi

  echo ""
fi

# =============================================================================
# Summary
# =============================================================================

echo "======================================="
echo "PBR Pipeline Complete"
echo "======================================="
echo "  Run:      $RUN_ID"
echo "  Feature:  $DESCRIPTION"
echo "  Branch:   $BRANCH_NAME"

if [ "$DRY_RUN" != "true" ]; then
  commit_count=$(git -C "$WORKTREE_DIR" log main.."$BRANCH_NAME" --oneline 2>/dev/null | wc -l)
  echo "  Commits:  $commit_count"
fi

echo "  Spec:     $SPEC_PATH"
echo "  Logs:     $LOG_DIR/pbr-${RUN_ID}-*.log"

if [ -n "$review_file" ] && [ -f "$review_file" ]; then
  echo "  Review:   $review_file"
fi

echo "======================================="
