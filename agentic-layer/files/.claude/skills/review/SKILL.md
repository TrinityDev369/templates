---
name: review
description: Review completed work by analyzing git diffs and produce risk-tiered validation reports. Use after implementing a feature, fix, or refactor.
---

# Code Review Skill

Analyze completed work and produce structured review reports.

## Workflow

1. **Parse scope** — Identify what was changed (git diff, specific files, or module)
2. **Analyze changes** — Read all modified files, check for anti-patterns
3. **Categorize issues** — Sort findings into risk tiers
4. **Write report** — Save to `docs/reviews/review_<date>_<scope>.md`

## Risk Tiers

**BLOCKER** — Security vulnerabilities, breaking changes, data loss risks, crashes, hardcoded credentials

**HIGH RISK** — Performance regressions, missing error handling, race conditions, incomplete features

**MEDIUM RISK** — Code duplication, style inconsistencies, missing tests, technical debt

**LOW RISK** — Minor style issues, refactoring opportunities, cosmetic improvements

## Anti-Pattern Checks

- Hardcoded credentials or secrets
- TODO/FIXME without tracking issues
- Commented-out code blocks
- Missing error handling on async operations
- Debug statements (console.log in production code)
- Unused imports or variables

## Report Format

```markdown
# Code Review Report

**Generated**: <timestamp>
**Reviewed Work**: <summary>
**Verdict**: PASS | FAIL

---

## Quick Reference

| # | Description | Risk Level | Recommended Solution |
|---|-------------|------------|---------------------|

---

## Issues by Risk Tier

### BLOCKERS (Must Fix Before Merge)
### HIGH RISK (Should Fix Before Merge)
### MEDIUM RISK (Fix Soon)
### LOW RISK (Nice to Have)

---

## Final Verdict

**Status**: PASS | FAIL
**Next Steps**: <action items>
```

## Guidelines

- Always use `git diff` to understand what actually changed
- Read modified files in full context, not just the diff
- Check for regressions in related code
- Verify test coverage for new code paths
- Flag any security concerns, no matter how minor
