---
name: security-audit
description: Run a comprehensive security audit on the codebase. Scans dependencies
  for vulnerabilities, checks for OWASP Top 10 patterns, detects hardcoded secrets,
  reviews HTTP security headers, and generates a markdown report with severity-rated
  findings and remediation advice. Supports --fix mode for suggested patches.
version: "1.0"
---

# Security Audit Skill

Comprehensive security audit for any codebase. Produces a structured report with findings rated by severity, file locations, evidence, and actionable remediation steps.

## When to Use

- Before deploying to production
- As part of a pull request review
- After adding new dependencies
- When onboarding a new codebase
- During periodic security reviews
- When the user asks to "audit", "scan", or "check security"

## When NOT to Use

- For runtime/dynamic security testing (this is static analysis only)
- For penetration testing against live endpoints
- For compliance certification (this is a technical audit, not a legal one)

## Instructions

When this skill is activated, execute the following audit pipeline in order. Produce a single markdown report at `reports/security/audit-YYYY-MM-DD.md` with all findings.

### Phase 1: Dependency Vulnerability Scan

Scan project dependencies for known vulnerabilities.

**For Node.js projects** (package.json exists):
1. Run `npm audit --json` (or `pnpm audit --json` if pnpm-lock.yaml exists)
2. Parse the JSON output for vulnerabilities
3. Record each vulnerability with: package name, severity, CVE ID, fixed version, upgrade path

**For Python projects** (requirements.txt or pyproject.toml exists):
1. Run `pip audit --format=json` if available, otherwise parse `pip audit` text output
2. Record each vulnerability with: package name, severity, CVE ID, fixed version

**For other ecosystems**: Note that dependency scanning is not available and recommend the user install the appropriate audit tool.

Record findings in this format:
```markdown
### [SEVERITY] Vulnerable dependency: PACKAGE_NAME

- **File**: package.json (or requirements.txt)
- **Category**: Dependency Vulnerability
- **CVE**: CVE-XXXX-XXXXX
- **Current Version**: X.Y.Z
- **Fixed Version**: A.B.C
- **Description**: Brief description of the vulnerability
- **Remediation**: Run `npm update PACKAGE_NAME` or pin to version >= A.B.C
```

### Phase 2: OWASP Top 10 Pattern Scan

Search the codebase for patterns that indicate OWASP Top 10 vulnerabilities. Use Grep to scan all source files (excluding node_modules, dist, build, vendor, .git).

#### 2.1 SQL Injection

Search for string concatenation in SQL queries:
- Pattern: `query\s*\(\s*[`'"].*\$\{` or `` `SELECT.*\+.*` `` or `"SELECT.*" \+`
- Pattern: `raw\(.*\+` or `.query\(.*\+`
- Pattern: `execute\(.*%s` or `execute\(.*format\(`
- Severity: **Critical** if user input flows into the query, **High** otherwise

#### 2.2 Cross-Site Scripting (XSS)

Search for unsafe HTML rendering:
- Pattern: `dangerouslySetInnerHTML`
- Pattern: `innerHTML\s*=`
- Pattern: `v-html=`
- Pattern: `\|safe` (Django/Jinja2 templates)
- Pattern: `document\.write\(`
- Severity: **High** if rendering user-controlled content, **Medium** otherwise

#### 2.3 Broken Authentication

Search for authentication weaknesses:
- Pattern: Hardcoded JWT secrets: `secret\s*[:=]\s*['"][^'"]{8,}['"]` near JWT/token code
- Pattern: Missing token expiration: `sign\(` without `expiresIn` option
- Pattern: Weak algorithms: `algorithm\s*[:=]\s*['"]none['"]` or `HS256` where RS256 expected
- Pattern: `localStorage\.setItem\(.*token` (tokens in localStorage)
- Severity: **High**

#### 2.4 Sensitive Data Exposure

Search for secrets and sensitive data handling issues:
- Pattern: `password\s*[:=]\s*['"][^'"]+['"]` (hardcoded passwords)
- Pattern: `(api[_-]?key|apikey|api[_-]?secret)\s*[:=]\s*['"][^'"]+['"]`
- Pattern: `(AWS_SECRET|PRIVATE_KEY|client_secret)\s*[:=]\s*['"][^'"]+['"]`
- Pattern: `console\.(log|debug|info)\(.*password` or `console\.(log|debug|info)\(.*secret`
- Pattern: `console\.(log|debug|info)\(.*token` (logging sensitive data)
- Severity: **Critical** for hardcoded secrets, **High** for logged secrets

#### 2.5 Security Misconfiguration

Search for misconfigurations:
- Pattern: `cors\(\)` with no options (allows all origins)
- Pattern: `Access-Control-Allow-Origin.*\*`
- Pattern: `debug\s*[:=]\s*true` or `DEBUG\s*=\s*True` (debug mode)
- Pattern: `NODE_ENV.*development` in production configs
- Pattern: `allowJs.*true` with no strict mode (TypeScript)
- Severity: **Medium** to **High** depending on context

#### 2.6 Insecure Deserialization

Search for unsafe deserialization:
- Pattern: `eval\(` (arbitrary code execution)
- Pattern: `Function\(` (dynamic function creation)
- Pattern: `pickle\.loads?\(` or `yaml\.load\(` without SafeLoader
- Pattern: `unserialize\(` (PHP pattern)
- Severity: **Critical** for eval/Function with user input, **High** otherwise

### Phase 3: Secrets Detection

Scan all files for hardcoded secrets and credentials. Check every file except binaries and common exclusions.

**Patterns to detect:**
- API keys: `[A-Za-z0-9_]*(api[_-]?key|apikey)[A-Za-z0-9_]*\s*[:=]\s*['"][A-Za-z0-9_\-\.]{16,}['"]`
- AWS keys: `AKIA[0-9A-Z]{16}`
- Generic secrets: `(secret|password|passwd|pwd|token|auth)\s*[:=]\s*['"][^'"]{8,}['"]`
- Private keys: `-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----`
- Connection strings: `(mongodb|postgres|mysql|redis):\/\/[^:]+:[^@]+@`
- Base64 potential secrets: Long base64 strings (40+ chars) assigned to secret-like variable names

**Additionally check:**
- Is `.env` tracked by git? Run `git ls-files .env .env.*` -- any results are **Critical**
- Are there `.pem`, `.key`, or `.p12` files in the repository?
- Is `.gitignore` missing entries for `.env`, `*.pem`, `*.key`?

Severity: **Critical** for confirmed secrets in tracked files. **High** for patterns that likely contain real secrets. **Medium** for patterns that might be false positives (e.g., example values).

**Important:** Never include actual secret values in the report. Show only the variable name, pattern matched, and file location.

### Phase 4: HTTP Security Headers Review

If the project has server configuration files (nginx.conf, apache configs, next.config.js, Express middleware, etc.), check for:

| Header | Expected Value | Severity if Missing |
|--------|---------------|-------------------|
| `Content-Security-Policy` | Restrictive policy | **High** |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | **High** |
| `X-Content-Type-Options` | `nosniff` | **Medium** |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | **Medium** |
| `X-XSS-Protection` | `0` (disabled, rely on CSP instead) | **Low** |
| `Referrer-Policy` | `strict-origin-when-cross-origin` or stricter | **Low** |
| `Permissions-Policy` | Restrictive policy | **Low** |

Also check:
- Cookie attributes: `HttpOnly`, `Secure`, `SameSite` flags
- CORS configuration: Is it overly permissive?

### Phase 5: Report Generation

Compile all findings into a structured markdown report.

**Report structure:**

```markdown
# Security Audit Report

**Date**: YYYY-MM-DD
**Scope**: [repository name or path]
**Auditor**: Automated Security Pipeline

## Executive Summary

- Critical: N findings
- High: N findings
- Medium: N findings
- Low: N findings
- Info: N findings

## Findings

### Critical

[findings sorted by category]

### High

[findings sorted by category]

### Medium

[findings sorted by category]

### Low

[findings sorted by category]

### Info

[findings sorted by category]

## Recommendations

[Prioritized list of remediation actions]

## Methodology

[Brief description of scans performed]
```

Save the report to `reports/security/audit-YYYY-MM-DD.md`.

### --fix Mode

When the user requests `--fix` or asks for fix suggestions:

1. For each finding, generate a specific code diff or patch showing the recommended fix
2. Present fixes grouped by file to minimize context switching
3. Format as a fenced diff block:

````markdown
**Fix for [Finding Title]** (`path/to/file.ts:42`):

```diff
- const query = `SELECT * FROM users WHERE id = ${userId}`
+ const query = `SELECT * FROM users WHERE id = $1`
+ const result = await db.query(query, [userId])
```
````

4. Never apply fixes automatically. Present them for human review.
5. If a fix requires architectural changes (e.g., switching from localStorage to httpOnly cookies), describe the approach rather than providing a line-level diff.

## File Exclusions

Always exclude these directories from scanning:
- `node_modules/`, `.git/`, `dist/`, `build/`, `out/`, `.next/`
- `vendor/`, `__pycache__/`, `.venv/`, `venv/`
- `coverage/`, `.nyc_output/`
- Binary files, images, fonts

If a `.security-audit.yaml` config exists in the project root, honor its `exclude` list and settings.

## Output Expectations

- Every finding must have: severity, file path with line number, category, description, and remediation
- Findings are deduplicated (same pattern in same file reported once with all line numbers)
- The report must be self-contained and readable without additional context
- No false-positive suppression unless `.security-audit-ignore` entries match

## Safety

- Never expose actual secret values in reports -- redact to `[REDACTED]`
- Never execute or test exploits -- this is static analysis only
- Never modify source code unless explicitly in `--fix` mode, and even then only suggest changes
- Never access external services or URLs during the audit
- Treat all findings as potential issues -- let humans determine true vs. false positives
