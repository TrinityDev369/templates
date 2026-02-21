# Security Audit Pipeline

Automated security audit pipeline for codebases. Scans dependencies, detects secrets, checks for OWASP Top 10 patterns, reviews security configurations, and generates actionable reports.

## Identity

This project is a **security audit pipeline**. Its sole purpose is to analyze code for vulnerabilities and misconfigurations, then produce structured reports with findings and remediation guidance. It does not modify application source code.

## Audit Scope

The pipeline inspects the following areas:

### 1. Dependency Vulnerabilities
- Known CVEs in npm, pip, and other package manager dependencies
- Outdated packages with available security patches
- Transitive dependency risks

### 2. Code Patterns (OWASP Top 10)
- **Injection** -- SQL injection via string concatenation, raw queries, unsanitized input
- **Broken Authentication** -- Hardcoded credentials, weak JWT configurations, missing token expiration
- **Sensitive Data Exposure** -- Secrets in source, `.env` files tracked in git, sensitive data in logs
- **XML External Entities (XXE)** -- Unsafe XML parser configurations
- **Broken Access Control** -- Missing authorization checks, IDOR patterns, permissive CORS
- **Security Misconfiguration** -- Debug mode enabled, default credentials, overly permissive headers
- **Cross-Site Scripting (XSS)** -- `dangerouslySetInnerHTML`, unescaped template output, `innerHTML`
- **Insecure Deserialization** -- Unsafe `JSON.parse` on untrusted input, `eval()`, `pickle.loads()`
- **Using Components with Known Vulnerabilities** -- Covered by dependency scanning
- **Insufficient Logging & Monitoring** -- Missing audit trails, unlogged auth failures

### 3. Secrets Detection
- API keys, tokens, passwords, and private keys in source files
- `.env` files committed to version control
- Hardcoded connection strings and credentials
- Base64-encoded secrets

### 4. Security Headers & Configuration
- HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- CORS configuration review
- Cookie security attributes (HttpOnly, Secure, SameSite)
- TLS/SSL configuration

## Severity Levels

Findings are classified by severity:

| Level | Description | Response Time |
|-------|-------------|---------------|
| **Critical** | Actively exploitable, immediate risk of data breach or system compromise | Immediate |
| **High** | Significant vulnerability that could be exploited with moderate effort | Within 24 hours |
| **Medium** | Vulnerability requiring specific conditions or chained with other issues | Within 1 week |
| **Low** | Minor issue, defense-in-depth improvement, or best practice deviation | Within 1 month |
| **Info** | Observation, recommendation, or note for future consideration | At discretion |

## Output

All reports are written to `reports/security/`. The pipeline generates:

```
reports/security/
  audit-YYYY-MM-DD.md          -- Full audit report with all findings
  summary-YYYY-MM-DD.md        -- Executive summary with counts by severity
  dependencies-YYYY-MM-DD.json -- Raw dependency audit output
```

### Report Format

Each finding in the audit report follows this structure:

```markdown
### [SEVERITY] Finding Title

- **File**: path/to/file.ts:42
- **Category**: OWASP category or scan type
- **Description**: What the issue is and why it matters
- **Evidence**: Code snippet showing the vulnerability
- **Remediation**: Specific steps to fix the issue
- **References**: Links to relevant documentation
```

## Rules

1. **Never modify source code directly.** The pipeline only reports findings. Use `--fix` mode to generate suggested patches, but never apply them automatically.
2. **Never expose secrets in reports.** Redact actual secret values -- show only the pattern and location.
3. **No false-positive suppression by default.** Every finding is reported. Use a `.security-audit-ignore` file to suppress known false positives with documented justification.
4. **Deterministic output.** Same codebase state produces the same report. No network-dependent checks unless explicitly opted in.
5. **Fail-safe defaults.** When in doubt about severity, classify higher rather than lower.

## Configuration

Create a `.security-audit.yaml` in the project root to customize behavior:

```yaml
# Directories to exclude from scanning
exclude:
  - node_modules/
  - .git/
  - dist/
  - build/
  - vendor/

# Minimum severity to report (critical, high, medium, low, info)
min_severity: low

# Enable or disable specific scan modules
scans:
  dependencies: true
  secrets: true
  owasp: true
  headers: true

# Custom secret patterns to detect (regex)
custom_patterns:
  - name: "Internal API Key"
    pattern: "INTERNAL_[A-Z]+_KEY\\s*=\\s*['\"][^'\"]+['\"]"
    severity: high
```

## Usage

### Automated Scan (bash)

```bash
bash scripts/security-scan.sh
```

### Claude Skill

Use the `/security-audit` skill for an interactive, AI-assisted audit that provides deeper analysis and context-aware remediation advice.

### CI/CD Integration

Add to your pipeline to block merges on critical/high findings:

```yaml
# Example GitHub Actions step
- name: Security Audit
  run: bash scripts/security-scan.sh
  continue-on-error: false
```

## Suppressing False Positives

Create `.security-audit-ignore` in the project root:

```
# Format: file:line -- justification
src/config/defaults.ts:15 -- Not a real secret, placeholder for documentation
tests/fixtures/mock-api.ts:8 -- Test fixture with fake credentials
```
