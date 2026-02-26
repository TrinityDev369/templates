---
name: monitor
description: "System and process monitoring \u2014 check service health, detect stuck processes, audit resource usage, and report structured diagnostics. Run anytime for a quick health check."
---

# Monitor -- System Health & Process Diagnostics

Check running services, detect anomalies, audit resource usage, and produce a structured health report. This skill works with any project that uses standard infrastructure (Docker, PostgreSQL, Redis, nginx, Node).

## Usage

```
/monitor              # Full health check (all categories)
/monitor services     # Service and process health only
/monitor docker       # Docker container status only
/monitor db           # Database connectivity and pool health only
```

**Default**: `all` (runs every step).

## Workflow

### Step 1: System Snapshot

Gather baseline system metrics. Run each command and capture results.

```bash
# Uptime and load average
uptime

# Memory usage (human-readable)
free -h

# Disk usage for all mounted filesystems
df -h --exclude-type=tmpfs --exclude-type=devtmpfs 2>/dev/null || df -h

# CPU core count (for contextualizing load average)
nproc
```

**Interpret results:**

| Metric | OK | WARN | CRIT |
|--------|-----|------|------|
| Load average (1m) | < cores * 0.7 | < cores * 1.0 | >= cores * 1.0 |
| Memory used % | < 70% | 70-85% | > 85% |
| Swap used | 0 | < 50% of total | > 50% of total |
| Disk used % | < 70% | 70-85% | > 85% |

Record each metric with its traffic-light status for the final report.

### Step 2: Process & Service Health

Check services in order of likelihood. Skip gracefully if a tool is not installed.

#### 2a. Docker Containers

```bash
# Check if Docker is available
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null
else
  echo "SKIP: Docker not available"
fi
```

**Decision tree for each container:**

| Status Pattern | Assessment |
|----------------|------------|
| `Up X minutes/hours` | OK |
| `Up X seconds` (< 60s) | WARN -- recently restarted, check logs |
| `Restarting` | CRIT -- restart loop detected |
| `Exited (0)` | OK -- clean shutdown |
| `Exited (non-zero)` | CRIT -- crashed |
| `Created` (never started) | WARN -- stale container |

For any container in CRIT state, capture recent logs:

```bash
docker logs --tail 20 <container_name> 2>&1
```

For containers restarting, check restart count:

```bash
docker inspect --format '{{.RestartCount}}' <container_name> 2>/dev/null
```

A restart count > 3 within the last hour is a confirmed restart loop.

#### 2b. Database Connectivity

Try PostgreSQL first, then MySQL. Use standard environment variables.

```bash
# PostgreSQL (via DATABASE_URL or PG* env vars)
if command -v psql &>/dev/null; then
  psql -c "SELECT 1 AS pg_ok;" 2>&1 && echo "PostgreSQL: OK" || echo "PostgreSQL: FAIL"
fi

# MySQL (via MYSQL_HOST or DATABASE_URL)
if command -v mysql &>/dev/null; then
  mysql -e "SELECT 1 AS mysql_ok;" 2>&1 && echo "MySQL: OK" || echo "MySQL: FAIL"
fi
```

If a database is reachable, check connection pool pressure:

```bash
# PostgreSQL: active connections vs max
psql -c "
  SELECT count(*) AS active_connections,
         current_setting('max_connections')::int AS max_connections,
         round(count(*)::numeric / current_setting('max_connections')::int * 100, 1) AS usage_pct
  FROM pg_stat_activity;
" 2>/dev/null
```

| Pool Usage % | Assessment |
|--------------|------------|
| < 50% | OK |
| 50-80% | WARN -- connection pressure building |
| > 80% | CRIT -- pool near exhaustion |

#### 2c. Common Services

```bash
# Redis
if command -v redis-cli &>/dev/null; then
  redis-cli ping 2>/dev/null && echo "Redis: OK" || echo "Redis: FAIL"
fi

# nginx
if command -v nginx &>/dev/null || [ -f /etc/nginx/nginx.conf ]; then
  nginx -t 2>&1 && echo "nginx config: OK" || echo "nginx config: FAIL"
  systemctl is-active nginx 2>/dev/null || pgrep -x nginx >/dev/null && echo "nginx process: OK" || echo "nginx process: NOT RUNNING"
fi

# Node.js processes
pgrep -a node 2>/dev/null | head -10 || echo "No Node processes running"
```

#### 2d. Custom Service Endpoints

If the project has known health-check URLs (e.g., from environment or config), probe them:

```bash
# Generic health-check probe pattern
# Replace URL with project-specific endpoints as needed
for url in "http://localhost:3000/health" "http://localhost:8080/health"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$url" 2>/dev/null)
  if [ "$status" = "200" ]; then
    echo "$url: OK ($status)"
  elif [ -n "$status" ] && [ "$status" != "000" ]; then
    echo "$url: WARN (HTTP $status)"
  else
    echo "$url: SKIP (not reachable)"
  fi
done
```

### Step 3: Anomaly Detection

Systematically check for problems that may not be obvious from basic status.

#### 3a. High Resource Consumers

```bash
# Top 5 processes by CPU
ps aux --sort=-%cpu | head -6

# Top 5 processes by memory
ps aux --sort=-%mem | head -6
```

**Flag any process using:**
- CPU > 80% sustained --> CRIT
- Memory > 80% of system RAM --> CRIT
- CPU 50-80% --> WARN
- Memory 50-80% --> WARN

#### 3b. Zombie and Defunct Processes

```bash
# Zombie processes
ps aux | awk '$8 ~ /Z/ {print}' | head -10
```

Any zombie processes found --> WARN (indicates parent process not reaping children).

#### 3c. Docker Restart Loops

```bash
# Containers with high restart counts
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  docker ps -a --format "{{.Names}} {{.Status}}" | while read name status; do
    restarts=$(docker inspect --format '{{.RestartCount}}' "$name" 2>/dev/null || echo 0)
    if [ "$restarts" -gt 3 ] 2>/dev/null; then
      echo "CRIT: $name has restarted $restarts times"
    fi
  done
fi
```

#### 3d. Disk Space Critical Paths

```bash
# Check specific critical paths for unexpected growth
for dir in /var/log /tmp /var/lib/docker; do
  if [ -d "$dir" ]; then
    size=$(du -sh "$dir" 2>/dev/null | cut -f1)
    echo "$dir: $size"
  fi
done
```

| Path | WARN threshold | CRIT threshold |
|------|----------------|----------------|
| /var/log | > 5GB | > 20GB |
| /tmp | > 2GB | > 10GB |
| /var/lib/docker | > 50GB | > 100GB |

#### 3e. Database Connection Leak Detection

```bash
# PostgreSQL: long-running idle connections (potential leaks)
psql -c "
  SELECT pid, usename, application_name, state,
         now() - state_change AS idle_duration
  FROM pg_stat_activity
  WHERE state = 'idle'
    AND now() - state_change > interval '30 minutes'
  ORDER BY idle_duration DESC
  LIMIT 10;
" 2>/dev/null
```

More than 10 idle connections older than 30 minutes --> WARN (possible connection leak).

#### 3f. Failed systemd Services

```bash
# Check for failed services (systemd-based systems)
if command -v systemctl &>/dev/null; then
  systemctl --failed --no-pager 2>/dev/null || true
fi
```

### Step 4: Structured Report

Compile all findings into a single health report using traffic-light indicators.

```
## System Health Report

### System Resources
| Metric          | Value       | Status |
|-----------------|-------------|--------|
| Load Average    | <1m/5m/15m> | <OK/WARN/CRIT> |
| Memory          | <used/total (%)> | <OK/WARN/CRIT> |
| Swap            | <used/total> | <OK/WARN/CRIT> |
| Disk (/)        | <used/total (%)> | <OK/WARN/CRIT> |
| Disk (<mount>)  | <used/total (%)> | <OK/WARN/CRIT> |
| Uptime          | <duration>  | -- |

### Services
| Service         | Status      | Details |
|-----------------|-------------|---------|
| Docker          | <OK/WARN/CRIT/SKIP> | <N running, N stopped> |
| PostgreSQL      | <OK/FAIL/SKIP> | <connections: N/max (%)> |
| Redis           | <OK/FAIL/SKIP> | <ping result> |
| nginx           | <OK/FAIL/SKIP> | <config valid, process state> |
| Node processes  | <OK/NONE>   | <count and details> |

### Docker Containers
| Container       | Status      | Restarts | Assessment |
|-----------------|-------------|----------|------------|
| <name>          | <status>    | <count>  | <OK/WARN/CRIT> |

### Anomalies Detected
<numbered list, or "None detected">

1. [CRIT] <description> -- <recommended action>
2. [WARN] <description> -- <recommended action>

### Recommendations
<1-3 prioritized next steps based on findings>
```

**Traffic-light legend:**
- **OK** -- healthy, no action needed
- **WARN** -- degraded or approaching threshold, investigate soon
- **CRIT** -- failing or exceeded threshold, immediate action needed
- **SKIP** -- tool or service not present, not checked

## Guidelines

- **Non-destructive**: This skill only reads state. It never kills processes, restarts services, or modifies configuration. If an action is needed, recommend it in the report.
- **Graceful degradation**: If a tool is not installed (e.g., `docker`, `psql`, `redis-cli`), skip that check and mark it as SKIP. Never fail the entire report because one tool is missing.
- **Environment-aware**: Use standard environment variables (`DATABASE_URL`, `PGHOST`, `REDIS_URL`, etc.) rather than hardcoded credentials. If env vars are missing, note it and skip.
- **Idempotent**: Running the monitor multiple times produces the same result for the same system state. No side effects.
- **Proportional output**: For a healthy system, the report should be concise. Only expand detail sections (logs, process lists) when anomalies are detected.

## When to Run

- **Before deploying**: Verify the system is healthy before pushing changes
- **After deploying**: Confirm services came back up correctly
- **When something feels slow**: Check resource usage and connection pools
- **On alerts or errors**: Get a full picture before diving into specific logs
- **Periodically**: Quick baseline to catch creeping issues (disk growth, connection leaks)
