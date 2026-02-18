# Onboarding Automation Pipeline

Automated employee/user onboarding pipeline. Reads role-based configuration from YAML and orchestrates provisioning, notifications, task assignment, access grants, and documentation delivery.

## Overview

This pipeline eliminates manual onboarding checklists by automating the repetitive steps that every new hire goes through. Each role (engineer, designer, PM, etc.) has a tailored sequence of onboarding steps defined in `scripts/config.yaml`. The Python orchestrator runs those steps in order, logging progress and handling failures gracefully.

## Architecture

```
scripts/config.yaml      <- Role definitions, steps, channels, templates
scripts/onboard.py       <- Python orchestrator (CLI entrypoint)
```

### Pipeline Stages

1. **Account Provisioning** -- Create accounts in required services (email, Slack, GitHub, etc.)
2. **Welcome Email** -- Send a personalized welcome message with first-day instructions
3. **Access Grants** -- Provision permissions for tools, repos, dashboards, and internal systems
4. **Task Assignment** -- Create starter tasks in your project management tool (onboarding checklist, intro meetings, training modules)
5. **Documentation Delivery** -- Share role-specific docs, handbooks, and onboarding guides

Each stage is idempotent: re-running the pipeline for the same employee skips already-completed steps (tracked via a local state file).

## Configuration

All onboarding behavior is driven by `scripts/config.yaml`. Edit this file to match your organization.

### Roles

Each role defines a list of onboarding steps. Steps have:

| Field | Description |
|-------|-------------|
| `name` | Human-readable step name |
| `type` | One of: `account`, `email`, `access`, `task`, `docs` |
| `description` | What this step does |
| `assignee` | Who is responsible (can be `auto`, a team name, or a person) |
| `service` | (optional) External service to interact with |
| `template` | (optional) Template name for emails/docs |

### Notification Channels

Configure where onboarding notifications are sent:

```yaml
notifications:
  channels:
    - type: slack
      webhook_url: "${SLACK_ONBOARDING_WEBHOOK}"
    - type: email
      smtp_host: "${SMTP_HOST}"
      smtp_port: 587
```

### Example

```yaml
roles:
  engineer:
    steps:
      - name: Create GitHub account
        type: account
        service: github
        description: Invite to organization and relevant teams
        assignee: auto
```

## Usage

### Basic Run

```bash
python scripts/onboard.py --employee-name "Jane Doe" --role engineer --team platform
```

### Dry Run (preview without executing)

```bash
python scripts/onboard.py --employee-name "Jane Doe" --role engineer --team platform --dry-run
```

### Specify a Custom Config

```bash
python scripts/onboard.py --employee-name "Jane Doe" --role designer --team brand --config path/to/config.yaml
```

### CLI Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--employee-name` | Yes | Full name of the new hire |
| `--role` | Yes | Role key from config.yaml (e.g., `engineer`, `designer`, `pm`) |
| `--team` | Yes | Team the employee is joining |
| `--email` | No | Employee email (auto-generated from name if omitted) |
| `--start-date` | No | Start date in YYYY-MM-DD format (defaults to today) |
| `--config` | No | Path to config.yaml (defaults to `scripts/config.yaml`) |
| `--dry-run` | No | Preview pipeline without executing any steps |
| `--verbose` | No | Enable debug-level logging |

## Customization Guide

### Adding a New Role

1. Open `scripts/config.yaml`
2. Add a new entry under `roles:` with the role key
3. Define the `steps` list with each onboarding action
4. Run with `--dry-run` to verify the pipeline

### Adding a New Step Type

1. Open `scripts/onboard.py`
2. Add a new handler function following the pattern of existing handlers
3. Register it in the `STEP_HANDLERS` dictionary
4. Add steps of that type to the relevant roles in `config.yaml`

### Integrating with External Services

The step handlers in `onboard.py` are stubs by default. To connect them to real services:

- **Email**: Replace the `send_welcome_email()` stub with your SMTP or API-based email sender
- **Slack**: Use the webhook URL from config to post onboarding notifications
- **GitHub/GitLab**: Use the respective API to send org invitations
- **Project Management**: Integrate with Jira, Linear, Asana, etc. to create onboarding tasks
- **IAM/SSO**: Connect to your identity provider for access grants

### State Tracking

The pipeline writes a state file to `onboarding-state/<employee-slug>.json` to track completed steps. This enables:

- Resuming a partially-completed onboarding
- Auditing what was done and when
- Skipping already-completed steps on re-run

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SLACK_ONBOARDING_WEBHOOK` | Slack webhook for onboarding notifications |
| `SMTP_HOST` | SMTP server for sending welcome emails |
| `SMTP_PORT` | SMTP port (default: 587) |
| `SMTP_USER` | SMTP authentication username |
| `SMTP_PASS` | SMTP authentication password |
| `GITHUB_TOKEN` | GitHub personal access token for org invitations |
| `ONBOARDING_STATE_DIR` | Directory for state files (default: `onboarding-state/`) |

## Troubleshooting

- **"Role not found"**: Check that the `--role` value matches a key in `config.yaml` under `roles:`
- **Step failures**: Check the log output. Failed steps are recorded in the state file with error details. Fix the issue and re-run -- the pipeline will retry only failed/pending steps.
- **Dry run shows no steps**: Verify your config.yaml is valid YAML and the role has a non-empty `steps` list.
