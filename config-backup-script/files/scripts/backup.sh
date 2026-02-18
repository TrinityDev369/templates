#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# backup.sh — Database and file backup with rotation, encryption, S3, webhooks
#
# Usage:
#   ./backup.sh              # Run incremental/daily backup
#   ./backup.sh --full       # Run full backup (all databases + files)
#   ./backup.sh --db-only    # Only back up database
#   ./backup.sh --files-only # Only back up files
#   ./backup.sh --help       # Show usage
#
# Exit codes:
#   0 — Success
#   1 — General error
#   2 — Configuration error
#   3 — Database backup failed
#   4 — File backup failed
#   5 — Encryption failed
#   6 — S3 upload failed
###############################################################################

# =============================================================================
# CONFIGURATION — Edit these values for your environment
# =============================================================================

# Backup storage
BACKUP_DIR="${BACKUP_DIR:-/var/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# PostgreSQL (default database engine)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-myapp}"
DB_USER="${DB_USER:-postgres}"

# MySQL (uncomment and use --mysql flag or set DB_ENGINE=mysql)
# DB_ENGINE="${DB_ENGINE:-postgres}"
# MYSQL_HOST="${MYSQL_HOST:-localhost}"
# MYSQL_PORT="${MYSQL_PORT:-3306}"
# MYSQL_NAME="${MYSQL_NAME:-myapp}"
# MYSQL_USER="${MYSQL_USER:-root}"

# Database engine selection: postgres or mysql
DB_ENGINE="${DB_ENGINE:-postgres}"

# Directories to back up (space-separated paths)
BACKUP_PATHS=(
    "/etc/myapp"
    # "/var/www/myapp/uploads"
    # "/opt/myapp/config"
)

# S3 upload (leave empty to skip)
S3_BUCKET="${S3_BUCKET:-}"
S3_PREFIX="${S3_PREFIX:-backups}"
S3_ENDPOINT="${S3_ENDPOINT:-}"  # For S3-compatible storage (e.g., Hetzner, MinIO)

# Notifications (leave empty to skip)
NOTIFY_WEBHOOK="${NOTIFY_WEBHOOK:-}"

# Encryption (leave empty to skip)
ENCRYPT_PASSPHRASE="${ENCRYPT_PASSPHRASE:-}"

# Log file
LOG_FILE="${LOG_FILE:-${BACKUP_DIR}/backup.log}"

# =============================================================================
# INTERNALS — No need to edit below this line
# =============================================================================

readonly TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"
readonly DATE_SHORT="$(date +%Y-%m-%d)"
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMP_DIR=""
CREATED_FILES=()
TOTAL_SIZE=0
START_TIME="$(date +%s)"
BACKUP_MODE="daily"
ERRORS=()

# =============================================================================
# LOGGING
# =============================================================================

log() {
    local level="$1"
    shift
    local msg="$*"
    local ts
    ts="$(date '+%Y-%m-%d %H:%M:%S')"
    local line="[${ts}] [${level}] ${msg}"
    echo "${line}"
    if [[ -n "${LOG_FILE}" ]] && [[ -d "$(dirname "${LOG_FILE}")" ]]; then
        echo "${line}" >> "${LOG_FILE}"
    fi
}

log_info()  { log "INFO"  "$@"; }
log_warn()  { log "WARN"  "$@"; }
log_error() { log "ERROR" "$@"; }

# =============================================================================
# CLEANUP TRAP
# =============================================================================

cleanup() {
    local exit_code=$?
    if [[ -n "${TEMP_DIR}" ]] && [[ -d "${TEMP_DIR}" ]]; then
        log_info "Cleaning up temporary directory: ${TEMP_DIR}"
        rm -rf "${TEMP_DIR}"
    fi
    if [[ ${exit_code} -ne 0 ]]; then
        log_error "Backup failed with exit code ${exit_code}"
        notify "failure" "Backup failed with exit code ${exit_code}"
    fi
    exit ${exit_code}
}

trap cleanup EXIT INT TERM

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

human_size() {
    local bytes="$1"
    if [[ ${bytes} -ge 1073741824 ]]; then
        echo "$(awk "BEGIN {printf \"%.2f GB\", ${bytes}/1073741824}")"
    elif [[ ${bytes} -ge 1048576 ]]; then
        echo "$(awk "BEGIN {printf \"%.2f MB\", ${bytes}/1048576}")"
    elif [[ ${bytes} -ge 1024 ]]; then
        echo "$(awk "BEGIN {printf \"%.2f KB\", ${bytes}/1024}")"
    else
        echo "${bytes} B"
    fi
}

file_size_bytes() {
    local file="$1"
    if [[ -f "${file}" ]]; then
        stat -c%s "${file}" 2>/dev/null || stat -f%z "${file}" 2>/dev/null || echo 0
    else
        echo 0
    fi
}

check_command() {
    if ! command -v "$1" &>/dev/null; then
        log_error "Required command not found: $1"
        return 1
    fi
}

generate_filename() {
    local type="$1"   # db, files
    local name="$2"   # database name or "files"
    local ext="$3"    # dump, sql.gz, tar.gz
    echo "backup-${type}-${name}-${TIMESTAMP}.${ext}"
}

# =============================================================================
# BACKUP FUNCTIONS
# =============================================================================

backup_postgres() {
    log_info "Starting PostgreSQL backup: ${DB_NAME}@${DB_HOST}:${DB_PORT}"

    check_command pg_dump || { log_error "pg_dump not found. Install postgresql-client."; return 3; }

    local filename
    filename="$(generate_filename "db" "${DB_NAME}" "dump")"
    local filepath="${BACKUP_DIR}/${filename}"

    log_info "Running pg_dump (custom format, compression level 9)..."

    local pg_args=(
        --host="${DB_HOST}"
        --port="${DB_PORT}"
        --username="${DB_USER}"
        --format=custom
        --compress=9
        --verbose
        --file="${filepath}"
        "${DB_NAME}"
    )

    if pg_dump "${pg_args[@]}" 2>>"${LOG_FILE:-/dev/null}"; then
        local size
        size="$(file_size_bytes "${filepath}")"
        TOTAL_SIZE=$((TOTAL_SIZE + size))
        CREATED_FILES+=("${filepath}")
        log_info "PostgreSQL backup complete: ${filename} ($(human_size "${size}"))"

        # Encrypt if configured
        if [[ -n "${ENCRYPT_PASSPHRASE}" ]]; then
            encrypt_backup "${filepath}"
        fi
    else
        log_error "pg_dump failed for database: ${DB_NAME}"
        ERRORS+=("PostgreSQL backup failed for ${DB_NAME}")
        return 3
    fi
}

# MySQL backup — uncomment DB_ENGINE=mysql in configuration to use
backup_mysql() {
    log_info "Starting MySQL backup: ${MYSQL_NAME:-${DB_NAME}}@${MYSQL_HOST:-${DB_HOST}}:${MYSQL_PORT:-3306}"

    check_command mysqldump || { log_error "mysqldump not found. Install mysql-client."; return 3; }

    local mysql_name="${MYSQL_NAME:-${DB_NAME}}"
    local mysql_host="${MYSQL_HOST:-${DB_HOST}}"
    local mysql_port="${MYSQL_PORT:-3306}"
    local mysql_user="${MYSQL_USER:-${DB_USER}}"

    local filename
    filename="$(generate_filename "db" "${mysql_name}" "sql.gz")"
    local filepath="${BACKUP_DIR}/${filename}"

    log_info "Running mysqldump (single-transaction, gzip)..."

    if mysqldump \
        --host="${mysql_host}" \
        --port="${mysql_port}" \
        --user="${mysql_user}" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --quick \
        "${mysql_name}" 2>>"${LOG_FILE:-/dev/null}" | gzip -9 > "${filepath}"; then

        local size
        size="$(file_size_bytes "${filepath}")"
        TOTAL_SIZE=$((TOTAL_SIZE + size))
        CREATED_FILES+=("${filepath}")
        log_info "MySQL backup complete: ${filename} ($(human_size "${size}"))"

        if [[ -n "${ENCRYPT_PASSPHRASE}" ]]; then
            encrypt_backup "${filepath}"
        fi
    else
        log_error "mysqldump failed for database: ${mysql_name}"
        ERRORS+=("MySQL backup failed for ${mysql_name}")
        return 3
    fi
}

backup_files() {
    if [[ ${#BACKUP_PATHS[@]} -eq 0 ]]; then
        log_warn "No BACKUP_PATHS configured, skipping file backup"
        return 0
    fi

    log_info "Starting file backup for ${#BACKUP_PATHS[@]} path(s)"

    # Validate paths exist
    local valid_paths=()
    for path in "${BACKUP_PATHS[@]}"; do
        if [[ -e "${path}" ]]; then
            valid_paths+=("${path}")
        else
            log_warn "Path does not exist, skipping: ${path}"
        fi
    done

    if [[ ${#valid_paths[@]} -eq 0 ]]; then
        log_warn "No valid paths to back up"
        return 0
    fi

    local filename
    filename="$(generate_filename "files" "archive" "tar.gz")"
    local filepath="${BACKUP_DIR}/${filename}"

    log_info "Creating tar archive of ${#valid_paths[@]} path(s)..."

    if tar czf "${filepath}" \
        --warning=no-file-changed \
        "${valid_paths[@]}" 2>>"${LOG_FILE:-/dev/null}"; then

        local size
        size="$(file_size_bytes "${filepath}")"
        TOTAL_SIZE=$((TOTAL_SIZE + size))
        CREATED_FILES+=("${filepath}")
        log_info "File backup complete: ${filename} ($(human_size "${size}"))"

        if [[ -n "${ENCRYPT_PASSPHRASE}" ]]; then
            encrypt_backup "${filepath}"
        fi
    else
        log_error "tar archive creation failed"
        ERRORS+=("File backup failed")
        return 4
    fi
}

# =============================================================================
# ENCRYPTION
# =============================================================================

encrypt_backup() {
    local filepath="$1"

    if [[ -z "${ENCRYPT_PASSPHRASE}" ]]; then
        return 0
    fi

    log_info "Encrypting: $(basename "${filepath}")"

    check_command gpg || { log_error "gpg not found. Install gnupg."; return 5; }

    local encrypted="${filepath}.gpg"

    if gpg --batch --yes --symmetric \
        --cipher-algo AES256 \
        --passphrase "${ENCRYPT_PASSPHRASE}" \
        --output "${encrypted}" \
        "${filepath}" 2>>"${LOG_FILE:-/dev/null}"; then

        # Remove unencrypted file
        rm -f "${filepath}"

        # Update tracking: replace original with encrypted in CREATED_FILES
        local new_files=()
        for f in "${CREATED_FILES[@]}"; do
            if [[ "${f}" == "${filepath}" ]]; then
                new_files+=("${encrypted}")
            else
                new_files+=("${f}")
            fi
        done
        CREATED_FILES=("${new_files[@]}")

        local size
        size="$(file_size_bytes "${encrypted}")"
        log_info "Encryption complete: $(basename "${encrypted}") ($(human_size "${size}"))"
    else
        log_error "Encryption failed for: $(basename "${filepath}")"
        ERRORS+=("Encryption failed for $(basename "${filepath}")")
        return 5
    fi
}

# =============================================================================
# S3 UPLOAD
# =============================================================================

upload_s3() {
    if [[ -z "${S3_BUCKET}" ]]; then
        log_info "S3 upload skipped (S3_BUCKET not configured)"
        return 0
    fi

    check_command aws || { log_error "aws CLI not found. Install awscli."; return 6; }

    log_info "Uploading ${#CREATED_FILES[@]} file(s) to s3://${S3_BUCKET}/${S3_PREFIX}/"

    local s3_args=()
    if [[ -n "${S3_ENDPOINT}" ]]; then
        s3_args+=(--endpoint-url "${S3_ENDPOINT}")
    fi

    local upload_errors=0
    for filepath in "${CREATED_FILES[@]}"; do
        local filename
        filename="$(basename "${filepath}")"
        local s3_dest="s3://${S3_BUCKET}/${S3_PREFIX}/${DATE_SHORT}/${filename}"

        log_info "Uploading: ${filename} -> ${s3_dest}"

        if aws s3 cp "${filepath}" "${s3_dest}" "${s3_args[@]}" 2>>"${LOG_FILE:-/dev/null}"; then
            log_info "Upload complete: ${filename}"
        else
            log_error "Upload failed: ${filename}"
            ERRORS+=("S3 upload failed for ${filename}")
            upload_errors=$((upload_errors + 1))
        fi
    done

    if [[ ${upload_errors} -gt 0 ]]; then
        return 6
    fi
}

# =============================================================================
# ROTATION
# =============================================================================

rotate_backups() {
    log_info "Rotating backups older than ${RETENTION_DAYS} days in: ${BACKUP_DIR}"

    local count=0
    local freed=0

    while IFS= read -r -d '' file; do
        local size
        size="$(file_size_bytes "${file}")"
        freed=$((freed + size))
        count=$((count + 1))
        log_info "Removing expired backup: $(basename "${file}")"
        rm -f "${file}"
    done < <(find "${BACKUP_DIR}" -maxdepth 1 -name "backup-*" -type f -mtime "+${RETENTION_DAYS}" -print0 2>/dev/null)

    if [[ ${count} -gt 0 ]]; then
        log_info "Rotation complete: removed ${count} file(s), freed $(human_size ${freed})"
    else
        log_info "Rotation complete: no expired backups found"
    fi
}

# =============================================================================
# NOTIFICATIONS
# =============================================================================

notify() {
    local status="$1"  # success or failure
    local message="$2"

    if [[ -z "${NOTIFY_WEBHOOK}" ]]; then
        return 0
    fi

    local color
    local emoji
    if [[ "${status}" == "success" ]]; then
        color="#36a64f"
        emoji="white_check_mark"
    else
        color="#ff0000"
        emoji="x"
    fi

    local hostname
    hostname="$(hostname -f 2>/dev/null || hostname)"

    # Build payload compatible with both Slack and Discord webhooks
    local payload
    payload=$(cat <<JSONEOF
{
    "text": ":${emoji}: Backup ${status} on ${hostname}",
    "attachments": [{
        "color": "${color}",
        "title": "Backup Report — ${DATE_SHORT}",
        "text": "${message}",
        "fields": [
            {"title": "Host", "value": "${hostname}", "short": true},
            {"title": "Database", "value": "${DB_NAME}", "short": true},
            {"title": "Files", "value": "${#CREATED_FILES[@]}", "short": true},
            {"title": "Mode", "value": "${BACKUP_MODE}", "short": true}
        ],
        "footer": "backup.sh",
        "ts": $(date +%s)
    }]
}
JSONEOF
)

    if curl -sf -X POST \
        -H "Content-Type: application/json" \
        -d "${payload}" \
        "${NOTIFY_WEBHOOK}" &>/dev/null; then
        log_info "Notification sent (${status})"
    else
        log_warn "Failed to send notification webhook"
    fi
}

# =============================================================================
# USAGE
# =============================================================================

usage() {
    cat <<USAGE
Usage: ${SCRIPT_NAME} [OPTIONS]

Database and file backup with rotation, encryption, S3 upload, and notifications.

Options:
    --full          Run full backup (database + files)
    --db-only       Only back up database
    --files-only    Only back up files
    --no-rotate     Skip backup rotation
    --no-upload     Skip S3 upload
    --no-notify     Skip webhook notification
    --dry-run       Show what would be done without executing
    --help, -h      Show this help message

Environment variables:
    BACKUP_DIR          Backup destination (default: /var/backups)
    RETENTION_DAYS      Days to keep backups (default: 30)
    DB_HOST             Database host (default: localhost)
    DB_PORT             Database port (default: 5432)
    DB_NAME             Database name (default: myapp)
    DB_USER             Database user (default: postgres)
    DB_ENGINE           Database engine: postgres or mysql (default: postgres)
    S3_BUCKET           S3 bucket for upload (empty = skip)
    S3_PREFIX           S3 key prefix (default: backups)
    S3_ENDPOINT         S3-compatible endpoint URL (empty = AWS default)
    NOTIFY_WEBHOOK      Slack/Discord webhook URL (empty = skip)
    ENCRYPT_PASSPHRASE  GPG encryption passphrase (empty = no encryption)
    LOG_FILE            Log file path (default: BACKUP_DIR/backup.log)

Examples:
    ${SCRIPT_NAME}                  # Daily backup (database + files)
    ${SCRIPT_NAME} --db-only        # Database backup only
    ${SCRIPT_NAME} --full           # Full backup with all components
    ${SCRIPT_NAME} --dry-run        # Preview without executing

USAGE
    exit 0
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    local do_db=true
    local do_files=true
    local do_rotate=true
    local do_upload=true
    local do_notify=true
    local dry_run=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --full)
                BACKUP_MODE="full"
                do_db=true
                do_files=true
                ;;
            --db-only)
                BACKUP_MODE="db-only"
                do_db=true
                do_files=false
                ;;
            --files-only)
                BACKUP_MODE="files-only"
                do_db=false
                do_files=true
                ;;
            --no-rotate)
                do_rotate=false
                ;;
            --no-upload)
                do_upload=false
                ;;
            --no-notify)
                do_notify=false
                ;;
            --dry-run)
                dry_run=true
                ;;
            --help|-h)
                usage
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                ;;
        esac
        shift
    done

    log_info "=========================================="
    log_info "Backup started — mode: ${BACKUP_MODE}"
    log_info "=========================================="
    log_info "Timestamp:  ${TIMESTAMP}"
    log_info "Backup dir: ${BACKUP_DIR}"
    log_info "Retention:  ${RETENTION_DAYS} days"
    log_info "DB engine:  ${DB_ENGINE}"
    log_info "DB name:    ${DB_NAME}"
    log_info "Encryption: $(if [[ -n "${ENCRYPT_PASSPHRASE}" ]]; then echo "enabled (AES-256)"; else echo "disabled"; fi)"
    log_info "S3 upload:  $(if [[ -n "${S3_BUCKET}" ]]; then echo "s3://${S3_BUCKET}/${S3_PREFIX}/"; else echo "disabled"; fi)"
    log_info "Webhook:    $(if [[ -n "${NOTIFY_WEBHOOK}" ]]; then echo "configured"; else echo "disabled"; fi)"

    if [[ "${dry_run}" == true ]]; then
        log_info "[DRY RUN] Would perform the following:"
        [[ "${do_db}" == true ]] && log_info "  - Database backup (${DB_ENGINE}: ${DB_NAME})"
        [[ "${do_files}" == true ]] && log_info "  - File backup (${#BACKUP_PATHS[@]} paths)"
        [[ "${do_rotate}" == true ]] && log_info "  - Rotate backups older than ${RETENTION_DAYS} days"
        [[ "${do_upload}" == true ]] && [[ -n "${S3_BUCKET}" ]] && log_info "  - Upload to S3"
        [[ "${do_notify}" == true ]] && [[ -n "${NOTIFY_WEBHOOK}" ]] && log_info "  - Send notification"
        log_info "[DRY RUN] No changes made."
        exit 0
    fi

    # Create backup directory
    if [[ ! -d "${BACKUP_DIR}" ]]; then
        log_info "Creating backup directory: ${BACKUP_DIR}"
        mkdir -p "${BACKUP_DIR}"
    fi

    # Create temp directory
    TEMP_DIR="$(mktemp -d "${BACKUP_DIR}/.backup-tmp-XXXXXX")"

    # Database backup
    if [[ "${do_db}" == true ]]; then
        case "${DB_ENGINE}" in
            postgres)
                backup_postgres
                ;;
            mysql)
                backup_mysql
                ;;
            *)
                log_error "Unknown DB_ENGINE: ${DB_ENGINE}. Use 'postgres' or 'mysql'."
                exit 2
                ;;
        esac
    fi

    # File backup
    if [[ "${do_files}" == true ]]; then
        backup_files
    fi

    # S3 upload
    if [[ "${do_upload}" == true ]]; then
        upload_s3
    fi

    # Rotation
    if [[ "${do_rotate}" == true ]]; then
        rotate_backups
    fi

    # Calculate duration
    local end_time
    end_time="$(date +%s)"
    local duration=$((end_time - START_TIME))
    local duration_human
    if [[ ${duration} -ge 3600 ]]; then
        duration_human="$((duration / 3600))h $((duration % 3600 / 60))m $((duration % 60))s"
    elif [[ ${duration} -ge 60 ]]; then
        duration_human="$((duration / 60))m $((duration % 60))s"
    else
        duration_human="${duration}s"
    fi

    # Summary
    log_info "=========================================="
    log_info "Backup Summary"
    log_info "=========================================="
    log_info "Mode:       ${BACKUP_MODE}"
    log_info "Duration:   ${duration_human}"
    log_info "Files:      ${#CREATED_FILES[@]}"
    log_info "Total size: $(human_size ${TOTAL_SIZE})"

    if [[ ${#CREATED_FILES[@]} -gt 0 ]]; then
        log_info "Created:"
        for f in "${CREATED_FILES[@]}"; do
            local fsize
            fsize="$(file_size_bytes "${f}")"
            log_info "  $(basename "${f}") ($(human_size "${fsize}"))"
        done
    fi

    if [[ ${#ERRORS[@]} -gt 0 ]]; then
        log_error "Errors encountered:"
        for e in "${ERRORS[@]}"; do
            log_error "  - ${e}"
        done
        if [[ "${do_notify}" == true ]]; then
            notify "failure" "Completed with ${#ERRORS[@]} error(s): ${ERRORS[*]}"
        fi
        exit 1
    fi

    log_info "Backup completed successfully"

    # Send success notification
    if [[ "${do_notify}" == true ]]; then
        notify "success" "Backup completed: ${#CREATED_FILES[@]} file(s), $(human_size ${TOTAL_SIZE}), ${duration_human}"
    fi
}

main "$@"
