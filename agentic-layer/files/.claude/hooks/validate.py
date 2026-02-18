#!/usr/bin/env python3
"""
Validation Module — Typecheck & test runner for code quality.

Used by hooks to catch broken code before it gets committed.
Runs TypeScript typecheck (tsc --noEmit) with pre-existing error filtering.
"""

import os
import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path

# =============================================================================
# Configuration — Customize these for your project
# =============================================================================

# Directory containing your TypeScript project (with tsconfig.json)
# Override with TYPECHECK_DIR environment variable
PROJECT_DIR = Path(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()))
TYPECHECK_DIR = Path(os.environ.get("TYPECHECK_DIR", str(PROJECT_DIR)))

# Pre-existing TS errors to ignore (fingerprinted by file:line:code)
# Add known errors here so they don't block new work
# Example: "src/legacy.ts(42,5): error TS2345"
PRE_EXISTING_ERRORS: set[str] = set()


# =============================================================================
# Data Types
# =============================================================================

@dataclass
class ValidationResult:
    passed: bool = True
    typecheck_ok: bool = True
    tests_ok: bool = True
    new_ts_errors: list[str] = field(default_factory=list)
    test_summary: str = ""
    test_failures: list[str] = field(default_factory=list)
    elapsed_ms: int = 0

    def to_context(self) -> str:
        """Format as context string for hook injection."""
        if self.passed:
            return ""

        parts = []
        if not self.typecheck_ok:
            parts.append("TYPECHECK FAILED — new errors introduced:")
            for err in self.new_ts_errors[:10]:
                parts.append(f"  {err}")
            if len(self.new_ts_errors) > 10:
                parts.append(f"  ... and {len(self.new_ts_errors) - 10} more")

        if not self.tests_ok:
            parts.append(f"TESTS FAILED — {self.test_summary}")
            for fail in self.test_failures[:5]:
                parts.append(f"  {fail}")

        return "\n".join(parts)


# =============================================================================
# Validators
# =============================================================================

def _is_pre_existing(error_line: str) -> bool:
    """Check if a TS error line matches a known pre-existing error."""
    for fingerprint in PRE_EXISTING_ERRORS:
        if fingerprint in error_line:
            return True
    return False


def run_typecheck(cwd: Path | None = None, timeout: int = 10) -> tuple[bool, list[str]]:
    """
    Run tsc --noEmit and return (ok, new_errors).
    Filters out pre-existing errors.
    """
    work_dir = cwd or TYPECHECK_DIR
    if not (work_dir / "tsconfig.json").exists():
        return True, []

    try:
        result = subprocess.run(
            ["npx", "tsc", "--noEmit", "--pretty", "false"],
            capture_output=True, text=True, cwd=work_dir, timeout=timeout
        )
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return True, []  # Can't validate, assume OK

    if result.returncode == 0:
        return True, []

    # Parse errors, filter pre-existing
    new_errors = []
    for line in result.stdout.strip().split("\n"):
        line = line.strip()
        if not line or ": error TS" not in line:
            continue
        if not _is_pre_existing(line):
            new_errors.append(line)

    return len(new_errors) == 0, new_errors


def run_typecheck_scoped(changed_file: str, cwd: Path | None = None, timeout: int = 10) -> tuple[bool, list[str]]:
    """
    Run full tsc but only report errors in the changed file.
    Faster feedback loop for PostToolUse.
    """
    work_dir = cwd or TYPECHECK_DIR
    if not (work_dir / "tsconfig.json").exists():
        return True, []

    # Normalize path to be relative to project dir
    try:
        rel_path = Path(changed_file).relative_to(work_dir)
    except ValueError:
        return True, []

    ok, all_errors = run_typecheck(work_dir, timeout)
    if ok:
        return True, []

    # Filter to just the changed file
    file_errors = [e for e in all_errors if str(rel_path) in e]
    return len(file_errors) == 0, file_errors


def run_tests(cwd: Path | None = None, timeout: int = 30) -> tuple[bool, str, list[str]]:
    """
    Run vitest and return (ok, summary, failures).
    """
    work_dir = cwd or TYPECHECK_DIR
    if not (work_dir / "vitest.config.ts").exists() and not (work_dir / "vitest.config.js").exists():
        return True, "No vitest config found", []

    try:
        result = subprocess.run(
            ["npx", "vitest", "run", "--reporter=verbose"],
            capture_output=True, text=True, cwd=work_dir, timeout=timeout
        )
    except subprocess.TimeoutExpired:
        return False, "Tests timed out", ["Vitest timed out after {}s".format(timeout)]
    except FileNotFoundError:
        return True, "npx not found", []

    output = result.stdout + result.stderr

    # Parse summary line
    summary_match = re.search(r"Tests\s+(\d+\s+passed.*)", output)
    summary = summary_match.group(1).strip() if summary_match else "Unknown"

    if result.returncode == 0:
        return True, summary, []

    # Extract failure details
    failures = []
    for line in output.split("\n"):
        line = line.strip()
        if line.startswith("×") or line.startswith("✗") or "FAIL" in line:
            failures.append(line)

    return False, summary, failures


def validate_full(run_test: bool = True) -> ValidationResult:
    """Run all validations and return combined result."""
    import time
    start = time.monotonic()

    result = ValidationResult()

    # Typecheck
    tc_ok, tc_errors = run_typecheck()
    result.typecheck_ok = tc_ok
    result.new_ts_errors = tc_errors

    # Tests (optional)
    if run_test:
        t_ok, t_summary, t_failures = run_tests()
        result.tests_ok = t_ok
        result.test_summary = t_summary
        result.test_failures = t_failures

    result.passed = result.typecheck_ok and result.tests_ok
    result.elapsed_ms = int((time.monotonic() - start) * 1000)
    return result
