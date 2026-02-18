# Backup Scripts

Database and file backup with rotation, encryption, S3 upload, and webhook notifications.

## Prerequisites

**Required:**
- `bash` 4.0+ (for arrays and associative features)
- `pg_dump` / `pg_restore` (PostgreSQL) or `mysqldump` / `mysql` (MySQL)
- `tar`, `gzip`
- `find`, `stat`

**Optional:**
- `gpg` (GnuPG) -- for backup encryption
- `aws` CLI -- for S3 upload (supports S3-compatible storage)
- `curl` -- for webhook notifications (Slack/Discord)

### Installing Prerequisites

```bash
# Debian/Ubuntu
sudo apt-get install postgresql-client gnupg2 awscli curl

# RHEL/CentOS/Fedora
sudo dnf install postgresql gpgme awscli curl

# macOS
brew install postgresql gnupg awscli curl
```

## Quick Start

```bash
# 1. Make scripts executable
chmod +x scripts/backup.sh scripts/restore.sh

# 2. Edit configuration in backup.sh (top of file)
#    Set BACKUP_DIR, DB_NAME, DB_USER, etc.

# 3. Run a test backup
./scripts/backup.sh --dry-run

# 4. Run actual backup
./scripts/backup.sh

# 5. Verify backup was created
ls -la /var/backups/backup-*
```

## Configuration

Edit the configuration section at the top of `backup.sh`:

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKUP_DIR` | `/var/backups` | Where backups are stored |
| `RETENTION_DAYS` | `30` | Days to keep local backups |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `5432` | Database port |
| `DB_NAME` | `myapp` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_ENGINE` | `postgres` | Engine: `postgres` or `mysql` |
| `BACKUP_PATHS` | `(/etc/myapp)` | Directories to back up |
| `S3_BUCKET` | _(empty)_ | S3 bucket name (empty = skip) |
| `S3_PREFIX` | `backups` | S3 key prefix |
| `S3_ENDPOINT` | _(empty)_ | S3-compatible endpoint URL |
| `NOTIFY_WEBHOOK` | _(empty)_ | Slack/Discord webhook URL |
| `ENCRYPT_PASSPHRASE` | _(empty)_ | GPG passphrase (empty = no encryption) |
| `LOG_FILE` | `BACKUP_DIR/backup.log` | Log file path |

All variables can also be set as environment variables, which take precedence over the defaults in the script.

### PostgreSQL Authentication

The script uses `pg_dump` which respects standard PostgreSQL authentication:

- **`.pgpass` file** (recommended): Create `~/.pgpass` with `host:port:db:user:password`
- **`PGPASSWORD` env var**: Set before running the script
- **Peer authentication**: Works when running as the postgres system user

```bash
# Example .pgpass
echo "localhost:5432:myapp:postgres:secretpassword" >> ~/.pgpass
chmod 600 ~/.pgpass
```

### MySQL Authentication

For MySQL backups, configure authentication via:

- **`.my.cnf`** (recommended): Create `~/.my.cnf` with credentials
- **Environment variables**: `MYSQL_PWD` (not recommended for production)

```ini
# ~/.my.cnf
[client]
password=secretpassword
```

## Backup Modes

```bash
# Daily backup (default) -- database + files
./scripts/backup.sh

# Full backup -- same as daily but labeled differently
./scripts/backup.sh --full

# Database only
./scripts/backup.sh --db-only

# Files only
./scripts/backup.sh --files-only

# Skip specific steps
./scripts/backup.sh --no-rotate    # Skip rotation
./scripts/backup.sh --no-upload    # Skip S3 upload
./scripts/backup.sh --no-notify    # Skip webhook notification

# Preview without executing
./scripts/backup.sh --dry-run
```

## Cron Setup

### Option 1: Install from crontab file

```bash
# Review the cron schedule
cat scripts/backup.cron

# Edit paths in backup.cron, then install
crontab -l 2>/dev/null | cat - scripts/backup.cron | crontab -

# Verify
crontab -l
```

### Option 2: Manual crontab entry

```bash
crontab -e
```

Add:

```cron
# Daily database backup at 2 AM
0 2 * * * /absolute/path/to/scripts/backup.sh --db-only >> /var/log/backup.log 2>&1

# Weekly full backup Sunday at 1 AM
0 1 * * 0 /absolute/path/to/scripts/backup.sh --full >> /var/log/backup.log 2>&1
```

### Option 3: Systemd timer

```ini
# /etc/systemd/system/backup.service
[Unit]
Description=Database and file backup

[Service]
Type=oneshot
ExecStart=/path/to/scripts/backup.sh --full
User=backup
Group=backup
```

```ini
# /etc/systemd/system/backup.timer
[Unit]
Description=Daily backup timer

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl enable --now backup.timer
```

## Restore Procedures

### List available backups

```bash
./scripts/restore.sh --list
./scripts/restore.sh --list --type db
./scripts/restore.sh --list --type files
```

### Restore latest backup

```bash
# Latest backup of any type
./scripts/restore.sh --latest

# Latest database backup
./scripts/restore.sh --latest --type db

# Latest file backup
./scripts/restore.sh --latest --type files
```

### Restore specific backup

```bash
./scripts/restore.sh /var/backups/backup-db-myapp-2026-01-15_02-00-00.dump
```

### Preview restore (dry-run)

```bash
# See what would happen without restoring
./scripts/restore.sh --dry-run --latest --type db
```

### Restore encrypted backup

Set the same passphrase used during backup:

```bash
ENCRYPT_PASSPHRASE="your-secret" ./scripts/restore.sh --latest
```

### Non-interactive restore

```bash
./scripts/restore.sh --no-confirm --latest --type db
```

## Testing Backups

Regular backup verification is critical. Test your backups periodically:

```bash
# 1. Create a backup
./scripts/backup.sh --db-only

# 2. Create a test database
createdb myapp_restore_test

# 3. Restore into test database
DB_NAME=myapp_restore_test ./scripts/restore.sh --latest --type db --no-confirm

# 4. Verify data
psql -d myapp_restore_test -c "SELECT count(*) FROM important_table;"

# 5. Clean up
dropdb myapp_restore_test
```

### Automated backup verification

Add to your cron schedule:

```bash
#!/bin/bash
# verify-backup.sh -- Run after backup, alert on failure
set -euo pipefail

TEST_DB="backup_verify_$(date +%s)"
createdb "${TEST_DB}"

if DB_NAME="${TEST_DB}" ./scripts/restore.sh --latest --type db --no-confirm; then
    ROW_COUNT=$(psql -d "${TEST_DB}" -t -c "SELECT count(*) FROM important_table;")
    if [[ ${ROW_COUNT} -gt 0 ]]; then
        echo "Backup verification PASSED: ${ROW_COUNT} rows"
    else
        echo "Backup verification FAILED: 0 rows" >&2
        exit 1
    fi
else
    echo "Backup verification FAILED: restore error" >&2
    exit 1
fi

dropdb "${TEST_DB}"
```

## S3 Lifecycle Policy

For S3-stored backups, configure a lifecycle policy to manage storage costs:

```json
{
    "Rules": [
        {
            "ID": "BackupRetention",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "backups/"
            },
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "STANDARD_IA"
                },
                {
                    "Days": 90,
                    "StorageClass": "GLACIER"
                }
            ],
            "Expiration": {
                "Days": 365
            }
        }
    ]
}
```

Apply with:

```bash
aws s3api put-bucket-lifecycle-configuration \
    --bucket your-bucket \
    --lifecycle-configuration file://lifecycle.json
```

For Hetzner S3-compatible storage, lifecycle policies may have limited support. Use the local `RETENTION_DAYS` setting as the primary retention mechanism and verify S3 lifecycle support with your provider.

## Troubleshooting

### Common Issues

**pg_dump: connection refused**
- Verify PostgreSQL is running: `pg_isready -h localhost -p 5432`
- Check `DB_HOST` and `DB_PORT` configuration
- Verify authentication in `~/.pgpass` or `pg_hba.conf`

**Permission denied on backup directory**
- Ensure the backup user has write access: `mkdir -p /var/backups && chown backup:backup /var/backups`
- For cron jobs, verify the cron user has appropriate permissions

**GPG encryption fails**
- Ensure `gpg` is installed: `gpg --version`
- Test encryption manually: `echo test | gpg --batch --symmetric --passphrase "pass" -o /tmp/test.gpg`
- Check for GPG agent issues: `gpgconf --kill gpg-agent`

**S3 upload fails**
- Verify AWS CLI configuration: `aws sts get-caller-identity`
- For S3-compatible storage, ensure `S3_ENDPOINT` is set correctly
- Check bucket permissions and CORS settings
- Test manually: `aws s3 ls s3://your-bucket/ --endpoint-url https://your-endpoint`

**Cron job not running**
- Check cron logs: `grep CRON /var/log/syslog`
- Verify script has execute permission: `chmod +x scripts/backup.sh`
- Use absolute paths in crontab entries
- Ensure environment variables are set in crontab (see `backup.cron`)

**Backup files are very large**
- PostgreSQL: compression level 9 is already maximum; consider excluding large tables
- Files: review `BACKUP_PATHS` for unnecessary directories
- Enable encryption (GPG does not reduce size but encrypted + original is temporary)
- Use `--db-only` for frequent backups, `--full` weekly

**Restore fails with "role does not exist"**
- This is a common pg_restore warning, usually harmless
- The script checks database accessibility after restore
- To suppress: `pg_restore --no-owner --no-privileges ...`

### Log Analysis

```bash
# View recent backup logs
tail -100 /var/backups/backup.log

# Find errors
grep ERROR /var/backups/backup.log

# Check backup sizes over time
grep "Total size" /var/backups/backup.log

# Find failed backups
grep "failed" /var/backups/backup.log
```

## File Naming Convention

Backups follow this naming pattern:

```
backup-{type}-{name}-{YYYY-MM-DD_HH-MM-SS}.{ext}[.gpg]
```

| Component | Values | Example |
|-----------|--------|---------|
| `type` | `db`, `files` | `db` |
| `name` | database name or `archive` | `myapp` |
| `ext` | `dump`, `sql.gz`, `tar.gz` | `dump` |
| `.gpg` | present if encrypted | `.gpg` |

Examples:
- `backup-db-myapp-2026-01-15_02-00-00.dump`
- `backup-db-myapp-2026-01-15_02-00-00.dump.gpg`
- `backup-files-archive-2026-01-15_02-00-00.tar.gz`
