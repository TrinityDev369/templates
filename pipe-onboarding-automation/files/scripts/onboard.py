#!/usr/bin/env python3
"""
Onboarding Automation Pipeline

Orchestrates employee/user onboarding by reading role-based configuration
from a YAML file and executing each step in sequence with logging and
state tracking.

Usage:
    python onboard.py --employee-name "Jane Doe" --role engineer --team platform
    python onboard.py --employee-name "Jane Doe" --role engineer --team platform --dry-run
"""

import argparse
import json
import logging
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    print(
        "ERROR: PyYAML is required. Install it with: pip install pyyaml",
        file=sys.stderr,
    )
    sys.exit(1)


# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------

logger = logging.getLogger("onboarding")


def setup_logging(verbose: bool = False) -> None:
    """Configure logging with console output."""
    level = logging.DEBUG if verbose else logging.INFO
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter(
            "%(asctime)s [%(levelname)-7s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )
    logger.setLevel(level)
    logger.addHandler(handler)


# ---------------------------------------------------------------------------
# Configuration loader
# ---------------------------------------------------------------------------


def load_config(config_path: str) -> dict[str, Any]:
    """Load and validate the onboarding configuration from a YAML file."""
    path = Path(config_path)
    if not path.exists():
        logger.error("Config file not found: %s", config_path)
        sys.exit(1)

    with open(path, "r", encoding="utf-8") as fh:
        config = yaml.safe_load(fh)

    if not isinstance(config, dict):
        logger.error("Config file must be a YAML mapping (dict at top level)")
        sys.exit(1)

    if "roles" not in config:
        logger.error("Config file must contain a 'roles' section")
        sys.exit(1)

    return config


# ---------------------------------------------------------------------------
# State management
# ---------------------------------------------------------------------------


def slugify(name: str) -> str:
    """Convert a name to a filesystem-safe slug."""
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    return re.sub(r"-+", "-", slug).strip("-")


def get_state_path(employee_name: str, state_dir: str) -> Path:
    """Return the path to the state file for a given employee."""
    return Path(state_dir) / f"{slugify(employee_name)}.json"


def load_state(state_path: Path) -> dict[str, Any]:
    """Load existing onboarding state, or return a fresh state dict."""
    if state_path.exists():
        with open(state_path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    return {"steps": {}, "started_at": None, "completed_at": None}


def save_state(state_path: Path, state: dict[str, Any]) -> None:
    """Persist onboarding state to disk."""
    state_path.parent.mkdir(parents=True, exist_ok=True)
    with open(state_path, "w", encoding="utf-8") as fh:
        json.dump(state, fh, indent=2, default=str)


# ---------------------------------------------------------------------------
# Step handlers
#
# Each handler receives the step definition, employee context, and config.
# In production, replace the stub implementations with real API calls.
# ---------------------------------------------------------------------------


def send_welcome_email(
    step: dict[str, Any],
    context: dict[str, Any],
    config: dict[str, Any],
) -> dict[str, Any]:
    """Send a personalized welcome email to the new hire."""
    employee_email = context["email"]
    employee_name = context["employee_name"]
    role = context["role"]
    team = context["team"]
    template = step.get("template", "default-welcome")

    logger.info(
        "Sending welcome email to %s <%s> (template: %s)",
        employee_name,
        employee_email,
        template,
    )

    # --- STUB: Replace with your email-sending logic ---
    # Example: use smtplib, SendGrid, Postmark, or any transactional email API.
    #
    # import smtplib
    # from email.mime.text import MIMEText
    # msg = MIMEText(f"Welcome to the {team} team, {employee_name}!")
    # msg["Subject"] = f"Welcome aboard, {employee_name}!"
    # msg["From"] = config.get("notifications", {}).get("from_email", "onboarding@example.com")
    # msg["To"] = employee_email
    # with smtplib.SMTP(os.environ.get("SMTP_HOST", "localhost"), int(os.environ.get("SMTP_PORT", 587))) as server:
    #     server.starttls()
    #     server.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"])
    #     server.send_message(msg)

    return {
        "status": "completed",
        "details": f"Welcome email sent to {employee_email} using template '{template}'",
    }


def create_accounts(
    step: dict[str, Any],
    context: dict[str, Any],
    config: dict[str, Any],
) -> dict[str, Any]:
    """Provision accounts in the specified service."""
    service = step.get("service", "unknown")
    employee_name = context["employee_name"]

    logger.info(
        "Creating %s account for %s",
        service,
        employee_name,
    )

    # --- STUB: Replace with real account provisioning ---
    # Examples:
    #   GitHub: POST /orgs/{org}/invitations with GITHUB_TOKEN
    #   Google Workspace: Admin SDK directory.users.insert
    #   Slack: admin.users.invite via Slack Web API

    return {
        "status": "completed",
        "details": f"Account created on {service} for {employee_name}",
    }


def assign_tasks(
    step: dict[str, Any],
    context: dict[str, Any],
    config: dict[str, Any],
) -> dict[str, Any]:
    """Create onboarding tasks in the project management tool."""
    employee_name = context["employee_name"]
    assignee = step.get("assignee", "auto")
    description = step.get("description", "Onboarding task")

    logger.info(
        "Assigning task '%s' for %s (assignee: %s)",
        step.get("name", "unnamed"),
        employee_name,
        assignee,
    )

    # --- STUB: Replace with real task creation ---
    # Examples:
    #   Jira: POST /rest/api/3/issue
    #   Linear: GraphQL mutation issueCreate
    #   Asana: POST /tasks

    return {
        "status": "completed",
        "details": f"Task '{step.get('name')}' assigned to {assignee}",
    }


def grant_access(
    step: dict[str, Any],
    context: dict[str, Any],
    config: dict[str, Any],
) -> dict[str, Any]:
    """Grant access permissions to tools, repos, or systems."""
    service = step.get("service", "unknown")
    employee_name = context["employee_name"]

    logger.info(
        "Granting %s access for %s",
        service,
        employee_name,
    )

    # --- STUB: Replace with real access provisioning ---
    # Examples:
    #   GitHub: PUT /orgs/{org}/teams/{team}/memberships/{username}
    #   AWS IAM: add_user_to_group
    #   Google Workspace: Add to Google Group

    return {
        "status": "completed",
        "details": f"Access granted on {service} for {employee_name}",
    }


def deliver_docs(
    step: dict[str, Any],
    context: dict[str, Any],
    config: dict[str, Any],
) -> dict[str, Any]:
    """Share onboarding documentation with the new hire."""
    employee_name = context["employee_name"]
    template = step.get("template", "general-handbook")

    logger.info(
        "Delivering docs to %s (template: %s)",
        employee_name,
        template,
    )

    # --- STUB: Replace with real document delivery ---
    # Examples:
    #   Email a link to the handbook
    #   Share a Notion/Confluence page
    #   Grant access to a Google Drive folder

    return {
        "status": "completed",
        "details": f"Documentation '{template}' delivered to {employee_name}",
    }


# Map step types to handler functions
STEP_HANDLERS: dict[str, Any] = {
    "email": send_welcome_email,
    "account": create_accounts,
    "task": assign_tasks,
    "access": grant_access,
    "docs": deliver_docs,
}


# ---------------------------------------------------------------------------
# Notification helper
# ---------------------------------------------------------------------------


def send_notification(
    message: str,
    config: dict[str, Any],
    dry_run: bool = False,
) -> None:
    """Send a notification to configured channels."""
    channels = config.get("notifications", {}).get("channels", [])

    for channel in channels:
        channel_type = channel.get("type", "unknown")
        if dry_run:
            logger.info("[DRY RUN] Would notify via %s: %s", channel_type, message)
            continue

        # --- STUB: Replace with real notification logic ---
        # if channel_type == "slack":
        #     import urllib.request
        #     req = urllib.request.Request(
        #         channel["webhook_url"],
        #         data=json.dumps({"text": message}).encode(),
        #         headers={"Content-Type": "application/json"},
        #     )
        #     urllib.request.urlopen(req)

        logger.info("Notification sent via %s: %s", channel_type, message)


# ---------------------------------------------------------------------------
# Pipeline orchestrator
# ---------------------------------------------------------------------------


def run_pipeline(
    employee_name: str,
    role: str,
    team: str,
    email: str | None,
    start_date: str,
    config: dict[str, Any],
    dry_run: bool = False,
    state_dir: str = "onboarding-state",
) -> bool:
    """
    Execute the full onboarding pipeline for a single employee.

    Returns True if all steps completed successfully, False otherwise.
    """
    # Validate role exists in config
    roles = config.get("roles", {})
    if role not in roles:
        available = ", ".join(sorted(roles.keys()))
        logger.error(
            "Role '%s' not found in config. Available roles: %s",
            role,
            available,
        )
        return False

    role_config = roles[role]
    steps = role_config.get("steps", [])

    if not steps:
        logger.warning("No onboarding steps defined for role '%s'", role)
        return True

    # Build employee context
    if email is None:
        # Auto-generate email from name
        email = slugify(employee_name) + "@example.com"

    context: dict[str, Any] = {
        "employee_name": employee_name,
        "email": email,
        "role": role,
        "team": team,
        "start_date": start_date,
    }

    # Load or initialize state
    state_path = get_state_path(employee_name, state_dir)
    state = load_state(state_path)

    if state["started_at"] is None:
        state["started_at"] = datetime.now(timezone.utc).isoformat()

    logger.info("=" * 60)
    logger.info(
        "Onboarding: %s | Role: %s | Team: %s",
        employee_name,
        role,
        team,
    )
    logger.info("Email: %s | Start date: %s", email, start_date)
    if dry_run:
        logger.info("MODE: DRY RUN (no actions will be executed)")
    logger.info("=" * 60)

    total_steps = len(steps)
    success_count = 0
    failure_count = 0

    for i, step in enumerate(steps, 1):
        step_name = step.get("name", f"step-{i}")
        step_type = step.get("type", "unknown")
        step_key = f"{i:03d}-{slugify(step_name)}"

        # Skip already-completed steps
        existing = state["steps"].get(step_key, {})
        if existing.get("status") == "completed":
            logger.info(
                "[%d/%d] SKIP (already done): %s",
                i,
                total_steps,
                step_name,
            )
            success_count += 1
            continue

        logger.info(
            "[%d/%d] %s (type: %s)",
            i,
            total_steps,
            step_name,
            step_type,
        )

        if dry_run:
            logger.info(
                "  [DRY RUN] Would execute: %s -- %s",
                step_name,
                step.get("description", "no description"),
            )
            success_count += 1
            continue

        handler = STEP_HANDLERS.get(step_type)
        if handler is None:
            logger.warning(
                "  No handler for step type '%s'. Skipping.",
                step_type,
            )
            state["steps"][step_key] = {
                "status": "skipped",
                "reason": f"No handler for type '{step_type}'",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            continue

        try:
            result = handler(step, context, config)
            state["steps"][step_key] = {
                **result,
                "step_name": step_name,
                "step_type": step_type,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            if result.get("status") == "completed":
                logger.info("  Completed: %s", result.get("details", ""))
                success_count += 1
            else:
                logger.warning("  Unexpected result: %s", result)
                failure_count += 1
        except Exception as exc:
            logger.error("  FAILED: %s -- %s", step_name, str(exc))
            state["steps"][step_key] = {
                "status": "failed",
                "error": str(exc),
                "step_name": step_name,
                "step_type": step_type,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            failure_count += 1

        # Save state after each step for resilience
        if not dry_run:
            save_state(state_path, state)

    # Final status
    all_ok = failure_count == 0

    if not dry_run:
        if all_ok:
            state["completed_at"] = datetime.now(timezone.utc).isoformat()
        save_state(state_path, state)

    logger.info("-" * 60)
    logger.info(
        "Pipeline %s: %d/%d steps succeeded, %d failed",
        "COMPLETE" if all_ok else "INCOMPLETE",
        success_count,
        total_steps,
        failure_count,
    )
    if not dry_run and state_path.exists():
        logger.info("State file: %s", state_path)

    # Notify
    status_msg = (
        f"Onboarding {'completed' if all_ok else 'partially completed'} "
        f"for {employee_name} ({role}, {team}): "
        f"{success_count}/{total_steps} steps done"
    )
    send_notification(status_msg, config, dry_run=dry_run)

    return all_ok


# ---------------------------------------------------------------------------
# CLI entrypoint
# ---------------------------------------------------------------------------


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Automated employee/user onboarding pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python onboard.py --employee-name 'Jane Doe' --role engineer --team platform\n"
            "  python onboard.py --employee-name 'Jane Doe' --role designer --team brand --dry-run\n"
            "  python onboard.py --employee-name 'John Smith' --role pm --team product --email john@company.com\n"
        ),
    )

    parser.add_argument(
        "--employee-name",
        required=True,
        help="Full name of the new employee",
    )
    parser.add_argument(
        "--role",
        required=True,
        help="Role key from config.yaml (e.g., engineer, designer, pm)",
    )
    parser.add_argument(
        "--team",
        required=True,
        help="Team the employee is joining",
    )
    parser.add_argument(
        "--email",
        default=None,
        help="Employee email address (auto-generated from name if omitted)",
    )
    parser.add_argument(
        "--start-date",
        default=None,
        help="Start date in YYYY-MM-DD format (defaults to today)",
    )
    parser.add_argument(
        "--config",
        default=None,
        help="Path to config.yaml (defaults to scripts/config.yaml in the same directory)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview the pipeline without executing any steps",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug-level logging output",
    )

    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    """Main entrypoint. Returns 0 on success, 1 on failure."""
    args = parse_args(argv)

    setup_logging(verbose=args.verbose)

    # Resolve config path
    if args.config:
        config_path = args.config
    else:
        script_dir = Path(__file__).resolve().parent
        config_path = str(script_dir / "config.yaml")

    config = load_config(config_path)

    # Resolve start date
    start_date = args.start_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Resolve state directory
    state_dir = os.environ.get("ONBOARDING_STATE_DIR", "onboarding-state")

    success = run_pipeline(
        employee_name=args.employee_name,
        role=args.role,
        team=args.team,
        email=args.email,
        start_date=start_date,
        config=config,
        dry_run=args.dry_run,
        state_dir=state_dir,
    )

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
