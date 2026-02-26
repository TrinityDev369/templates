---
name: review
description: Automated code review with risk-tiered analysis, structured checklists, and actionable feedback. Use when reviewing PRs, diffs, or completed work.
---

# Code Review Skill

Perform structured code reviews with risk-tiered analysis, category checklists, and actionable recommendations. Works on PRs, branches, commit ranges, or local changes.

## When to Use

- Reviewing a pull request before merge
- Auditing changes on a feature branch
- Checking staged/unstaged work before committing
- Post-implementation quality gate

## Invocation

```
/review                          # Review staged + unstaged changes
/review 42                       # Review PR #42
/review feature/auth             # Review branch diff against main
/review abc123..def456           # Review a commit range
/review --post                   # Review and post comments on the PR
```

The argument `$ARGS` determines scope. Parse it as:
- **Empty** -- review current staged and unstaged changes (`git diff HEAD`)
- **Integer** -- treat as a PR number, fetch with `gh pr diff $ARGS`
- **Contains `/`** -- treat as a branch name, diff against the default branch
- **Contains `..`** -- treat as a commit range, use `git diff $ARGS`
- **`--post` flag** -- after review, post findings as PR comments via `gh`

## Workflow

### Step 1: Gather the Diff

Determine the diff source from `$ARGS`:

```bash
# No args -- local changes
git diff HEAD

# PR number
gh pr diff $PR_NUMBER

# Branch
git diff main...$BRANCH

# Commit range
git diff $RANGE
```

If the diff is empty, report "No changes to review" and stop.

For PR reviews, also gather metadata:

```bash
gh pr view $PR_NUMBER --json title,body,files,additions,deletions
```

### Step 2: Identify Changed Files

List all files in the diff. For each file, note:
- File path and language
- Lines added / removed
- Whether it is new, modified, or deleted

Sort files by risk relevance (security-sensitive files first, then logic, then config/style).

### Step 3: Risk-Tiered Analysis

Scan every changed line and classify findings into four tiers:

#### Critical (must fix before merge)
- Hardcoded secrets, API keys, tokens, or credentials
- SQL injection, XSS, or command injection vulnerabilities
- Authentication or authorization bypasses
- Data loss or corruption risks (destructive DB migrations, unsafe deletes)
- Exposed sensitive data in logs, errors, or responses
- Missing input validation on security boundaries

#### High (should fix before merge)
- Logic errors, off-by-one, or incorrect conditionals
- Race conditions or concurrency issues
- Unhandled error paths that could crash the process
- Missing null/undefined checks on external data
- Broken error handling (swallowed exceptions, generic catches)
- Resource leaks (unclosed connections, missing cleanup)

#### Medium (improve when possible)
- Poor naming (ambiguous variables, misleading function names)
- Functions exceeding ~50 lines or doing too many things
- Code duplication that should be extracted
- Missing or incorrect type annotations
- Inconsistent patterns compared to the rest of the codebase
- TODO/FIXME/HACK comments without tracked issues

#### Low (optional polish)
- Formatting inconsistencies (spacing, indentation, line length)
- Import ordering or grouping
- Minor style preferences (ternary vs if/else, const vs let)
- Missing trailing commas or semicolons
- Comment typos or grammar

### Step 4: Category Checklists

Evaluate the changes against five categories. Mark each as PASS, FAIL, or N/A:

**Security**
- [ ] No hardcoded secrets or credentials
- [ ] User input validated before use
- [ ] No SQL/NoSQL injection vectors
- [ ] Authentication checks present where required
- [ ] Authorization verified for protected operations
- [ ] Sensitive data not exposed in logs or error messages

**Performance**
- [ ] No N+1 queries or unbounded loops
- [ ] Database queries use indexes (no full table scans on large tables)
- [ ] No blocking operations on the main thread / hot path
- [ ] Large lists are paginated or virtualized
- [ ] Expensive computations are memoized or cached where appropriate
- [ ] No unnecessary re-renders (frontend) or redundant fetches

**Correctness**
- [ ] Edge cases handled (empty input, null, boundary values)
- [ ] Error paths return appropriate status codes / messages
- [ ] Async operations have proper error handling (try/catch, .catch)
- [ ] State mutations are intentional and controlled
- [ ] Types match runtime behavior (no unsafe casts hiding bugs)
- [ ] Business logic matches the stated requirements

**Maintainability**
- [ ] Code is readable without requiring extra explanation
- [ ] Functions have clear single responsibilities
- [ ] No unnecessary complexity or premature abstraction
- [ ] Consistent with existing codebase patterns and conventions
- [ ] Public APIs and complex logic have documentation
- [ ] Magic numbers and strings are named constants

**Testing**
- [ ] New logic has corresponding test coverage
- [ ] Edge cases and error paths are tested
- [ ] Tests are deterministic (no flaky timing, no shared state)
- [ ] Test names describe the expected behavior
- [ ] Mocks are minimal and do not hide real bugs
- [ ] Integration points have integration tests

### Step 5: Per-File Assessment

For each changed file, write a one-to-three sentence assessment covering:
- What the file change does
- Any risk items found (with line references)
- Whether it looks good or needs changes

Format:
```
### path/to/file.ts (+45 -12)
Added retry logic to the API client. Medium: retry count is a magic number (line 38) --
extract to a named constant. Otherwise clean.
```

### Step 6: Compile the Review Report

Assemble findings into the output format below.

### Step 7: Optionally Post to GitHub

If `--post` was specified and the target is a PR:

```bash
# Post summary as a PR comment
gh pr comment $PR_NUMBER --body "$REVIEW_BODY"

# For critical/high items, post inline comments on specific lines
gh api repos/{owner}/{repo}/pulls/{pr}/comments \
  -f body="$COMMENT" -f path="$FILE" -F line=$LINE -f side=RIGHT \
  -f commit_id="$(gh pr view $PR_NUMBER --json headRefOid -q .headRefOid)"
```

## Output Format

```
## Code Review

**Scope**: <PR #N / branch / commit range / local changes>
**Files changed**: <count>  |  **Additions**: +<n>  |  **Deletions**: -<n>

### Summary

<1-2 sentence summary of what these changes do and overall quality assessment.>

### Risk Items

#### Critical
- [ ] `path/to/file.ts:42` -- Hardcoded API key in header constant
- [ ] `src/db/migrate.ts:18` -- DROP TABLE without backup or confirmation

#### High
- [ ] `src/api/handler.ts:67` -- Missing error handling on database call
- [ ] `lib/auth.ts:23` -- Token expiry not validated before use

#### Medium
- [ ] `utils/format.ts:15` -- Function name `doStuff` is ambiguous
- [ ] `src/api/handler.ts:34` -- Duplicated validation logic (also in line 89)

#### Low
- [ ] `config.ts:7` -- Inconsistent quote style (single vs double)

> If no items in a tier, show: *None found.*

### Checklist

| Category        | Result | Notes                                  |
|-----------------|--------|----------------------------------------|
| Security        | PASS   |                                        |
| Performance     | PASS   | Consider caching for repeated lookup   |
| Correctness     | FAIL   | Missing null check on user input       |
| Maintainability | PASS   |                                        |
| Testing         | FAIL   | No tests for new retry logic           |

### File Assessments

<per-file assessments from Step 5>

### Recommendations

1. <Actionable next step with specific file/line reference>
2. <Actionable next step>
3. <Actionable next step>

---
*Review complete. <N> critical, <N> high, <N> medium, <N> low items found.*
```

## Guidelines

**Do:**
- Read every line of the diff -- do not skim or skip files
- Reference specific file paths and line numbers in findings
- Prioritize findings by actual risk, not just code style
- Acknowledge what is done well -- not just what is wrong
- Consider the broader context (is this a hotfix? a prototype? production code?)
- Group related findings to avoid repetitive noise

**Do not:**
- Rewrite the author's code -- suggest, do not impose
- Flag style issues as critical or high risk
- Assume intent -- ask clarifying questions for ambiguous changes
- Review generated files (lock files, build output, vendored deps)
- Block a review on low-tier items alone

## Handling Large Diffs

If the diff exceeds 2000 lines:
1. Focus first on security-sensitive files (auth, payments, user data)
2. Then review new files (highest chance of missing patterns)
3. Then review modified core logic files
4. Summarize skimmed files and note they need deeper review

## Exit Criteria

The review is complete when:
- Every changed file has been assessed
- All critical and high items are documented with file:line references
- The checklist is filled out for all five categories
- At least one actionable recommendation is provided
- The structured report is output in the format above
