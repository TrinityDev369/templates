#!/usr/bin/env bash
# security-scan.sh -- Dependency audit, secret detection, .env tracking check
# Usage: bash scripts/security-scan.sh [--verbose]
set -euo pipefail

REPORT_DIR="reports/security"; DATE="$(date +%Y-%m-%d)"; ISSUES=0
SUMMARY="${REPORT_DIR}/summary-${DATE}.md"; VERBOSE="${1:-}"
mkdir -p "$REPORT_DIR"
log() { printf "[scan] %s\n" "$1"; }
warn() { printf "[!] %s\n" "$1"; ISSUES=$((ISSUES + 1)); }
dbg() { [ "$VERBOSE" = "--verbose" ] && printf "    %s\n" "$1" || true; }
out() { echo "$1" >> "$SUMMARY"; }

echo "# Security Scan Summary -- ${DATE}" > "$SUMMARY"; out ""

# -- Phase 1: Dependency Audit --
log "Phase 1: Dependency vulnerabilities"
out "## Dependencies"
if [ -f "package.json" ] && command -v npm &>/dev/null; then
  set +e; npm_out="$(npm audit --json 2>/dev/null)"; rc=$?; set -e
  if [ $rc -ne 0 ] && [ -n "$npm_out" ]; then
    cnt="$(echo "$npm_out" | grep -c '"severity"' || echo 0)"
    warn "npm audit: ${cnt} vulnerability entries"
    echo "$npm_out" > "${REPORT_DIR}/dependencies-${DATE}.json"
    out "- npm audit: **${cnt} vulnerability entries**"
  else log "  npm audit: clean"; out "- npm audit: clean"; fi
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
  if command -v pip-audit &>/dev/null; then
    set +e; pip_out="$(pip-audit 2>&1)"; rc=$?; set -e
    if [ $rc -ne 0 ]; then warn "pip-audit: vulnerabilities found"
      out '```'; out "$pip_out"; out '```'
    else log "  pip-audit: clean"; out "- pip-audit: clean"; fi
  else log "  pip-audit not installed (pip install pip-audit)"; fi
else log "  No package manager found, skipping"; out "- Skipped (no package manager)"; fi
out ""

# -- Phase 2: Secret Detection --
log "Phase 2: Scanning for hardcoded secrets"
EX="--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build"
EX="$EX --exclude-dir=vendor --exclude-dir=.venv --exclude-dir=.next --exclude-dir=out"
EX="$EX --exclude=*.lock --exclude=*.map --exclude=security-scan.sh"
PATTERNS=(
  'api[_-]?key\s*[:=]\s*["\x27][A-Za-z0-9_\-]{16,}'
  'password\s*[:=]\s*["\x27][^\x27"]{8,}["\x27]'
  'AKIA[0-9A-Z]{16}'
  '-----BEGIN (RSA |EC )?PRIVATE KEY-----'
  '(mongodb|postgres|mysql|redis)://[^:]+:[^@]+@'
  'client_secret\s*[:=]\s*["\x27][^\x27"]{8,}'
)
out "## Hardcoded Secrets"; sfound=0
for p in "${PATTERNS[@]}"; do
  set +e; hits="$(grep -rniE "$p" . $EX 2>/dev/null | head -10)"; set -e
  if [ -n "$hits" ]; then
    sfound=$((sfound + 1)); warn "Secret pattern: ${p:0:40}..."
    out "- \`${p:0:50}\`:"
    echo "$hits" | while IFS= read -r l; do
      out "  - \`$(echo "$l" | cut -d: -f1-2)\`"; done
  fi
done
[ $sfound -eq 0 ] && out "- No hardcoded secrets detected"; out ""

# -- Phase 3: .env in Git --
log "Phase 3: Checking .env files in version control"
out "## Tracked .env Files"
if command -v git &>/dev/null && [ -d ".git" ]; then
  set +e; tracked="$(git ls-files '.env' '.env.*' '**/.env' 2>/dev/null)"; set -e
  if [ -n "$tracked" ]; then
    warn ".env files tracked in git!"
    out "- **CRITICAL**: Tracked .env files:"
    echo "$tracked" | while IFS= read -r f; do out "  - \`${f}\`"; done
  else out "- No .env files tracked in git"; fi
else out "- Not a git repo, skipped"; fi
out ""

# -- Summary --
out "---"; out ""; out "**Total issues: ${ISSUES}**"
out ""; out "Run \`/security-audit\` Claude skill for full OWASP analysis."
log "Done. Issues: ${ISSUES}. Report: ${SUMMARY}"
[ "$ISSUES" -gt 0 ] && exit 1; exit 0
