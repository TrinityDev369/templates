#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# restore.sh — Restore database or file backups created by backup.sh
#
# Usage:
#   ./restore.sh                          # Interactive: list and select backup
#   ./restore.sh <backup-file>            # Restore specific file
#   ./restore.sh --latest                 # Restore most recent backup
#   ./restore.sh --latest --type db       # Restore most recent database backup
#   ./restore.sh --latest --type files    # Restore most recent file backup
#   ./restore.sh --dry-run <backup-file>  # Preview without restoring
#   ./restore.sh --list                   # List available backups
#   ./restore.sh --help                   # Show usage
#
# Exit codes:
#   0 — Success
#   1 — General error
#   2 — Configuration error
#   3 — Restore failed
#   4 — Decryption failed
#   5 — User cancelled
###############################################################################

# =============================================================================
# CONFIGURATION — Match these to your backup.sh settings
# =============================================================================

BACKUP_DIR="${BACKUP_DIR:-/var/backups}"

# PostgreSQL
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-myapp}"
DB_USER="${DB_USER:-postgres}"

# Encryption (must match backup.sh passphrase)
ENCRYPT_PASSPHRASE="${ENCRYPT_PASSPHRASE:-}"

# File restore target (where tar extracts to)
RESTORE_TARGET="${RESTORE_TARGET:-/}"

# =============================================================================
# INTERNALS
# =============================================================================

readonly SCRIPT_NAME="$(basename "$0")"
TEMP_DIR=""

# =============================================================================
# LOGGING
# =============================================================================

log() {
    local level="$1"
    shift
    local ts
    ts="$(date '+%Y-%m-%d %H:%M:%S')"
    echo "[${ts}] [${level}] $*"
}

log_info()  { log "INFO"  "$@"; }
log_warn()  { log "WARN"  "$@"; }
log_error() { log "ERROR" "$@"; }

# =============================================================================
# CLEANUP
# =============================================================================

cleanup() {
    if [[ -n "${TEMP_DIR}" ]] && [[ -d "${TEMP_DIR}" ]]; then
        rm -rf "${TEMP_DIR}"
    fi
}

trap cleanup EXIT INT TERM

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

human_size() {
    local bytes="$1"
    if [[ ${bytes} -ge 1073741824 ]]; then
        awk "BEGIN {printf \"%.2f GB\", ${bytes}/1073741824}"
    elif [[ ${bytes} -ge 1048576 ]]; then
        awk "BEGIN {printf \"%.2f MB\", ${bytes}/1048576}"
    elif [[ ${bytes} -ge 1024 ]]; then
        awk "BEGIN {printf \"%.2f KB\", ${bytes}/1024}"
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

# =============================================================================
# LIST BACKUPS
# =============================================================================

list_backups() {
    local type_filter="${1:-all}"  # all, db, files

    if [[ ! -d "${BACKUP_DIR}" ]]; then
        log_error "Backup directory does not exist: ${BACKUP_DIR}"
        exit 2
    fi

    local pattern="backup-*"
    case "${type_filter}" in
        db)    pattern="backup-db-*" ;;
        files) pattern="backup-files-*" ;;
        all)   pattern="backup-*" ;;
    esac

    local count=0
    echo ""
    echo "Available backups in: ${BACKUP_DIR}"
    echo "$(printf '=%.0s' {1..70})"
    printf "%-4s  %-45s  %10s  %s\n" "#" "Filename" "Size" "Date"
    echo "$(printf '-%.0s' {1..70})"

    while IFS= read -r file; do
        if [[ -z "${file}" ]]; then
            continue
        fi
        count=$((count + 1))
        local filename
        filename="$(basename "${file}")"
        local size
        size="$(file_size_bytes "${file}")"
        local date
        date="$(date -r "${file}" '+%Y-%m-%d %H:%M' 2>/dev/null || stat -c '%y' "${file}" 2>/dev/null | cut -d. -f1)"

        printf "%-4s  %-45s  %10s  %s\n" "${count}" "${filename}" "$(human_size "${size}")" "${date}"
    done < <(find "${BACKUP_DIR}" -maxdepth 1 -name "${pattern}" -type f 2>/dev/null | sort -r)

    echo "$(printf '-%.0s' {1..70})"
    echo "Total: ${count} backup(s)"
    echo ""

    return ${count}
}

# =============================================================================
# FIND LATEST BACKUP
# =============================================================================

find_latest() {
    local type_filter="${1:-all}"

    local pattern="backup-*"
    case "${type_filter}" in
        db)    pattern="backup-db-*" ;;
        files) pattern="backup-files-*" ;;
    esac

    local latest
    latest="$(find "${BACKUP_DIR}" -maxdepth 1 -name "${pattern}" -type f 2>/dev/null | sort -r | head -1)"

    if [[ -z "${latest}" ]]; then
        log_error "No backups found matching type: ${type_filter}"
        exit 1
    fi

    echo "${latest}"
}

# =============================================================================
# DETECT BACKUP TYPE
# =============================================================================

detect_type() {
    local filepath="$1"
    local filename
    filename="$(basename "${filepath}")"

    # Remove .gpg extension for detection
    local base="${filename%.gpg}"

    if [[ "${base}" == backup-db-*.dump ]] || [[ "${base}" == backup-db-*.sql.gz ]]; then
        echo "db"
    elif [[ "${base}" == backup-files-*.tar.gz ]]; then
        echo "files"
    else
        echo "unknown"
    fi
}

# Detect database engine from filename
detect_db_engine() {
    local filepath="$1"
    local filename
    filename="$(basename "${filepath}")"
    local base="${filename%.gpg}"

    if [[ "${base}" == *.dump ]]; then
        echo "postgres"
    elif [[ "${base}" == *.sql.gz ]]; then
        echo "mysql"
    else
        echo "unknown"
    fi
}

# =============================================================================
# DECRYPTION
# =============================================================================

decrypt_backup() {
    local filepath="$1"

    if [[ "${filepath}" != *.gpg ]]; then
        echo "${filepath}"
        return 0
    fi

    log_info "Decrypting: $(basename "${filepath}")"

    if [[ -z "${ENCRYPT_PASSPHRASE}" ]]; then
        log_error "Backup is encrypted but ENCRYPT_PASSPHRASE is not set"
        exit 4
    fi

    if ! command -v gpg &>/dev/null; then
        log_error "gpg not found. Install gnupg."
        exit 4
    fi

    TEMP_DIR="$(mktemp -d)"
    local decrypted="${TEMP_DIR}/$(basename "${filepath%.gpg}")"

    if gpg --batch --yes --decrypt \
        --passphrase "${ENCRYPT_PASSPHRASE}" \
        --output "${decrypted}" \
        "${filepath}" 2>/dev/null; then
        log_info "Decryption successful"
        echo "${decrypted}"
    else
        log_error "Decryption failed. Wrong passphrase?"
        exit 4
    fi
}

# =============================================================================
# RESTORE FUNCTIONS
# =============================================================================

restore_postgres() {
    local filepath="$1"
    local dry_run="${2:-false}"

    log_info "Restoring PostgreSQL database: ${DB_NAME}"
    log_info "From: $(basename "${filepath}")"
    log_info "Target: ${DB_HOST}:${DB_PORT}/${DB_NAME}"

    if ! command -v pg_restore &>/dev/null; then
        log_error "pg_restore not found. Install postgresql-client."
        exit 3
    fi

    if [[ "${dry_run}" == true ]]; then
        log_info "[DRY RUN] Would run pg_restore with:"
        log_info "  Host:     ${DB_HOST}"
        log_info "  Port:     ${DB_PORT}"
        log_info "  Database: ${DB_NAME}"
        log_info "  User:     ${DB_USER}"
        log_info "  File:     $(basename "${filepath}")"

        log_info "[DRY RUN] Listing backup contents:"
        pg_restore --list "${filepath}" 2>/dev/null | head -30
        echo "  ... (truncated)"
        return 0
    fi

    log_info "Running pg_restore (clean + create)..."

    if pg_restore \
        --host="${DB_HOST}" \
        --port="${DB_PORT}" \
        --username="${DB_USER}" \
        --dbname="${DB_NAME}" \
        --clean \
        --if-exists \
        --verbose \
        "${filepath}" 2>&1 | while IFS= read -r line; do log_info "  ${line}"; done; then
        log_info "PostgreSQL restore completed successfully"
    else
        # pg_restore may return non-zero for warnings (e.g., "role does not exist")
        # which are often harmless. Check if database is accessible.
        log_warn "pg_restore exited with warnings (this may be normal)"
        if psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1" &>/dev/null; then
            log_info "Database is accessible after restore"
        else
            log_error "Database is not accessible after restore"
            exit 3
        fi
    fi
}

restore_mysql() {
    local filepath="$1"
    local dry_run="${2:-false}"

    local mysql_name="${MYSQL_NAME:-${DB_NAME}}"
    local mysql_host="${MYSQL_HOST:-${DB_HOST}}"
    local mysql_port="${MYSQL_PORT:-3306}"
    local mysql_user="${MYSQL_USER:-${DB_USER}}"

    log_info "Restoring MySQL database: ${mysql_name}"
    log_info "From: $(basename "${filepath}")"
    log_info "Target: ${mysql_host}:${mysql_port}/${mysql_name}"

    if ! command -v mysql &>/dev/null; then
        log_error "mysql client not found. Install mysql-client."
        exit 3
    fi

    if [[ "${dry_run}" == true ]]; then
        log_info "[DRY RUN] Would run mysql restore with:"
        log_info "  Host:     ${mysql_host}"
        log_info "  Port:     ${mysql_port}"
        log_info "  Database: ${mysql_name}"
        log_info "  User:     ${mysql_user}"
        log_info "  File:     $(basename "${filepath}")"
        return 0
    fi

    log_info "Running mysql restore (gunzip | mysql)..."

    if gunzip -c "${filepath}" | mysql \
        --host="${mysql_host}" \
        --port="${mysql_port}" \
        --user="${mysql_user}" \
        "${mysql_name}" 2>&1; then
        log_info "MySQL restore completed successfully"
    else
        log_error "MySQL restore failed"
        exit 3
    fi
}

restore_files() {
    local filepath="$1"
    local dry_run="${2:-false}"

    log_info "Restoring file backup"
    log_info "From: $(basename "${filepath}")"
    log_info "Target: ${RESTORE_TARGET}"

    if [[ "${dry_run}" == true ]]; then
        log_info "[DRY RUN] Would extract to: ${RESTORE_TARGET}"
        log_info "[DRY RUN] Archive contents:"
        tar tzf "${filepath}" 2>/dev/null | head -30
        echo "  ... (truncated, $(tar tzf "${filepath}" 2>/dev/null | wc -l) total entries)"
        return 0
    fi

    log_info "Extracting archive..."

    if tar xzf "${filepath}" -C "${RESTORE_TARGET}" 2>&1; then
        log_info "File restore completed successfully"
    else
        log_error "File restore failed"
        exit 3
    fi
}

# =============================================================================
# CONFIRMATION PROMPT
# =============================================================================

confirm_restore() {
    local filepath="$1"
    local backup_type="$2"

    echo ""
    echo "$(printf '=%.0s' {1..60})"
    echo "  RESTORE CONFIRMATION"
    echo "$(printf '=%.0s' {1..60})"
    echo ""
    echo "  File:     $(basename "${filepath}")"
    echo "  Type:     ${backup_type}"
    echo "  Size:     $(human_size "$(file_size_bytes "${filepath}")")"

    if [[ "${backup_type}" == "db" ]]; then
        echo "  Target:   ${DB_HOST}:${DB_PORT}/${DB_NAME}"
        echo ""
        echo "  WARNING: This will OVERWRITE the current database!"
    elif [[ "${backup_type}" == "files" ]]; then
        echo "  Target:   ${RESTORE_TARGET}"
        echo ""
        echo "  WARNING: This will OVERWRITE existing files!"
    fi

    echo ""
    echo "$(printf '=%.0s' {1..60})"
    echo ""

    read -rp "  Proceed with restore? (yes/no): " answer

    if [[ "${answer}" != "yes" ]]; then
        log_info "Restore cancelled by user"
        exit 5
    fi

    echo ""
}

# =============================================================================
# INTERACTIVE SELECTION
# =============================================================================

interactive_select() {
    local type_filter="${1:-all}"

    list_backups "${type_filter}"

    local files=()
    while IFS= read -r file; do
        if [[ -n "${file}" ]]; then
            files+=("${file}")
        fi
    done < <(find "${BACKUP_DIR}" -maxdepth 1 -name "backup-*" -type f 2>/dev/null | sort -r)

    if [[ ${#files[@]} -eq 0 ]]; then
        log_error "No backups found"
        exit 1
    fi

    read -rp "Enter backup number to restore (or 'q' to quit): " selection

    if [[ "${selection}" == "q" ]] || [[ "${selection}" == "Q" ]]; then
        echo "Cancelled."
        exit 0
    fi

    if ! [[ "${selection}" =~ ^[0-9]+$ ]] || [[ ${selection} -lt 1 ]] || [[ ${selection} -gt ${#files[@]} ]]; then
        log_error "Invalid selection: ${selection}"
        exit 1
    fi

    echo "${files[$((selection - 1))]}"
}

# =============================================================================
# USAGE
# =============================================================================

usage() {
    cat <<USAGE
Usage: ${SCRIPT_NAME} [OPTIONS] [BACKUP_FILE]

Restore database or file backups created by backup.sh.

Options:
    --list              List available backups
    --latest            Restore the most recent backup
    --type TYPE         Filter by type: db, files, all (default: all)
    --dry-run           Preview restore without executing
    --no-confirm        Skip confirmation prompt
    --restore-target    Override file restore target directory
    --help, -h          Show this help message

Arguments:
    BACKUP_FILE         Path to specific backup file to restore

Examples:
    ${SCRIPT_NAME}                              # Interactive selection
    ${SCRIPT_NAME} --list                       # List all backups
    ${SCRIPT_NAME} --latest                     # Restore latest backup
    ${SCRIPT_NAME} --latest --type db           # Restore latest database backup
    ${SCRIPT_NAME} --dry-run backup-db-*.dump   # Preview restore
    ${SCRIPT_NAME} /var/backups/backup-db-myapp-2026-01-15_02-00-00.dump

Environment variables:
    BACKUP_DIR          Backup directory (default: /var/backups)
    DB_HOST             Database host (default: localhost)
    DB_PORT             Database port (default: 5432)
    DB_NAME             Database name (default: myapp)
    DB_USER             Database user (default: postgres)
    ENCRYPT_PASSPHRASE  Decryption passphrase (required for .gpg files)
    RESTORE_TARGET      File restore target directory (default: /)

USAGE
    exit 0
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    local target_file=""
    local use_latest=false
    local type_filter="all"
    local dry_run=false
    local no_confirm=false
    local list_only=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --list)
                list_only=true
                ;;
            --latest)
                use_latest=true
                ;;
            --type)
                shift
                type_filter="${1:-all}"
                ;;
            --dry-run)
                dry_run=true
                ;;
            --no-confirm)
                no_confirm=true
                ;;
            --restore-target)
                shift
                RESTORE_TARGET="${1:-/}"
                ;;
            --help|-h)
                usage
                ;;
            -*)
                log_error "Unknown option: $1"
                usage
                ;;
            *)
                target_file="$1"
                ;;
        esac
        shift
    done

    # List mode
    if [[ "${list_only}" == true ]]; then
        list_backups "${type_filter}"
        exit 0
    fi

    # Determine which file to restore
    if [[ -n "${target_file}" ]]; then
        # Resolve relative paths
        if [[ "${target_file}" != /* ]]; then
            target_file="${BACKUP_DIR}/${target_file}"
        fi
        if [[ ! -f "${target_file}" ]]; then
            log_error "Backup file not found: ${target_file}"
            exit 1
        fi
    elif [[ "${use_latest}" == true ]]; then
        target_file="$(find_latest "${type_filter}")"
        log_info "Selected latest backup: $(basename "${target_file}")"
    else
        # Interactive mode
        if [[ -t 0 ]]; then
            target_file="$(interactive_select "${type_filter}")"
        else
            log_error "No backup file specified. Use --latest or provide a file path."
            usage
        fi
    fi

    # Detect backup type
    local backup_type
    backup_type="$(detect_type "${target_file}")"

    if [[ "${backup_type}" == "unknown" ]]; then
        log_error "Cannot determine backup type from filename: $(basename "${target_file}")"
        log_error "Expected: backup-db-*.dump, backup-db-*.sql.gz, or backup-files-*.tar.gz"
        exit 2
    fi

    log_info "Backup type: ${backup_type}"

    # Confirmation
    if [[ "${dry_run}" == false ]] && [[ "${no_confirm}" == false ]]; then
        confirm_restore "${target_file}" "${backup_type}"
    fi

    # Decrypt if needed
    local restore_file
    restore_file="$(decrypt_backup "${target_file}")"

    # Perform restore
    case "${backup_type}" in
        db)
            local db_engine
            db_engine="$(detect_db_engine "${restore_file}")"
            case "${db_engine}" in
                postgres)
                    restore_postgres "${restore_file}" "${dry_run}"
                    ;;
                mysql)
                    restore_mysql "${restore_file}" "${dry_run}"
                    ;;
                *)
                    log_error "Cannot determine database engine from file extension"
                    exit 2
                    ;;
            esac
            ;;
        files)
            restore_files "${restore_file}" "${dry_run}"
            ;;
    esac

    if [[ "${dry_run}" == false ]]; then
        log_info "Restore completed successfully"
    else
        log_info "[DRY RUN] No changes were made"
    fi
}

main "$@"
