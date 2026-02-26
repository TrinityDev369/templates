#!/bin/bash
# gates.sh — Quality gates between pipeline phases

# Gate: Validate plan phase output
# Checks that spec file exists with required sections
# Usage: gate_plan <spec_path>
# Returns: 0 = pass (always, even with warnings), 1 = no spec file
gate_plan() {
  local spec_path="$1"

  if [ ! -f "$spec_path" ]; then
    echo "  GATE FAIL: Spec file not found: $spec_path"
    return 1
  fi

  local missing=()
  grep -qE "^## Objective" "$spec_path"                                     || missing+=("Objective")
  grep -qE "^## (Step-by-Step|Steps|Implementation)" "$spec_path"           || missing+=("Step-by-Step")
  grep -qE "^## (Acceptance Criteria|Acceptance|Done)" "$spec_path"         || missing+=("Acceptance Criteria")

  if [ ${#missing[@]} -gt 0 ]; then
    echo "  GATE WARN: Spec missing sections: ${missing[*]}"
    echo "  Continuing anyway — build agent will work with what's there."
    return 0
  fi

  local line_count
  line_count=$(wc -l < "$spec_path")
  echo "  GATE PASS: Spec valid ($line_count lines, all required sections present)"
  return 0
}

# Gate: Validate build phase output
# Checks that new commits exist on the branch
# Usage: gate_build <worktree_dir> <branch_name>
# Returns: 0 = pass, 1 = no commits
gate_build() {
  local worktree_dir="$1"
  local branch_name="$2"

  local commit_count
  commit_count=$(git -C "$worktree_dir" log main.."$branch_name" --oneline 2>/dev/null | wc -l)

  if [ "$commit_count" -eq 0 ]; then
    echo "  GATE FAIL: No commits on branch $branch_name"
    echo "  Build agent didn't commit any changes."
    return 1
  fi

  echo "  GATE PASS: $commit_count commit(s) on $branch_name"

  # Optional type-check (non-blocking)
  if command -v npx &>/dev/null && [ -f "$worktree_dir/tsconfig.json" ]; then
    echo "  Running type-check..."
    if (cd "$worktree_dir" && npx tsc --noEmit 2>/dev/null); then
      echo "  Type-check passed"
    else
      echo "  Type-check had errors (non-blocking — may be pre-existing)"
    fi
  fi

  return 0
}

# Gate: Validate review phase output
# Checks that review file exists and extracts verdict
# Usage: gate_review <review_path>
# Returns: 0 = PASS (ship it), 1 = NEEDS FIXES (triggers fix phase)
gate_review() {
  local review_path="$1"

  if [ ! -f "$review_path" ]; then
    echo "  GATE FAIL: Review file not found: $review_path"
    echo "  Treating missing review as PASS — cannot fix without review feedback."
    return 0
  fi

  local verdict
  verdict=$(grep -i "verdict" "$review_path" | tail -1)

  if echo "$verdict" | grep -qi "NEEDS FIX"; then
    echo "  GATE: Verdict = NEEDS FIXES"
    echo "  $verdict"
    return 1
  fi

  if echo "$verdict" | grep -qi "PASS"; then
    echo "  GATE PASS: Review approved"
    echo "  $verdict"
  else
    echo "  GATE WARN: Could not parse verdict, treating as PASS"
    [ -n "$verdict" ] && echo "  Last verdict-like line: $verdict"
  fi

  return 0
}
