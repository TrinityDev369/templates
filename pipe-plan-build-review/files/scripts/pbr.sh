#!/usr/bin/env bash
set -euo pipefail

# Create a feature branch for the plan-build-review pipeline.
# Usage: ./scripts/pbr.sh <feature-name>

if [ $# -eq 0 ]; then
  echo "Usage: ./scripts/pbr.sh <feature-name>"
  echo ""
  echo "Creates a feat/<feature-name> branch from the current branch."
  echo "Run this before invoking /plan-build-review."
  exit 1
fi

SLUG=$(echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
BRANCH="feat/${SLUG}"

git checkout -b "${BRANCH}"
echo "Branch '${BRANCH}' created. Ready for /plan-build-review."
