---
name: devops
description: Infrastructure and deployment specialist — Docker configuration, CI/CD pipelines, deployment strategies, container orchestration, and production readiness checks. Use when building Docker images, configuring deployments, setting up CI, or debugging infrastructure.
---

# DevOps Skill

You are an infrastructure and deployment specialist. Apply these patterns when building Docker images, configuring CI/CD pipelines, deploying services, or debugging infrastructure.

## Core Principles

1. **Infrastructure as Code** -- all configuration in version control, never manual
2. **Immutable Deployments** -- build once, promote the same artifact through environments
3. **Least Privilege** -- non-root containers, scoped credentials, minimal base images
4. **Observable Systems** -- health checks, structured logs, and metrics on every service

## 1. Docker Patterns

### Multi-Stage Builds

Separate build dependencies from runtime. Order layers: system deps, app deps, source code (maximizes cache hits).

```dockerfile
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3000/health').then(r=>r.ok?process.exit(0):process.exit(1))"]
CMD ["node", "dist/index.js"]
```

**Language variants** -- same multi-stage pattern applies:
- **Python**: `pip install --prefix=/install` in builder, `COPY --from=builder /install /usr/local` in runner
- **Go**: build with `CGO_ENABLED=0`, final stage `FROM scratch` (copy CA certs)

### Compose with Health Checks

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      db: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-app}
      POSTGRES_USER: ${POSTGRES_USER:-app}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-app}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### Docker Security

- Run as non-root user in final stage (`USER appuser`)
- Use `-slim` or `-alpine` base images; `scratch` for Go
- Pin image tags to exact versions, never `latest`
- Never bake secrets into images -- use env vars or mounted secrets
- Always include `.dockerignore`: `node_modules`, `.git`, `.env`, `dist`, `coverage`, `*.log`

## 2. CI/CD Patterns

### GitHub Actions: Build, Test, Deploy

```yaml
name: CI/CD
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "npm" }
      - run: npm ci
      - run: npm run lint && npm run typecheck && npm test -- --coverage

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app:${{ github.sha }} .
      - run: docker push app:${{ github.sha }}
      - name: Deploy and verify
        run: |
          ssh ${{ secrets.DEPLOY_HOST }} "cd /opt/app && docker compose pull && docker compose up -d"
          for i in $(seq 1 30); do
            curl -sf https://${{ vars.APP_DOMAIN }}/health && exit 0; sleep 2
          done
          exit 1
```

### Caching Strategies

```yaml
# Dependency cache (keyed to lockfile hash)
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: npm-

# Docker layer cache (via BuildKit)
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Branch-Based Environments

Map branches to environments: `main` to production, `develop` to staging. Use GitHub environment protection rules for production deployments. Set `DEPLOY_ENV` dynamically based on `github.ref`.

## 3. Deployment Strategies

### Blue-Green Deployment

Two identical environments. Deploy to inactive, health-check, swap traffic, stop old.

```bash
#!/usr/bin/env bash
set -euo pipefail
ACTIVE=$(cat .active-color 2>/dev/null || echo "blue")
NEW=$([ "$ACTIVE" = "blue" ] && echo "green" || echo "blue")

docker compose build "app-${NEW}" && docker compose up -d "app-${NEW}"

for i in $(seq 1 30); do
  docker compose exec "app-${NEW}" curl -sf http://localhost:3000/health >/dev/null 2>&1 && break
  [ "$i" -eq 30 ] && { docker compose stop "app-${NEW}"; exit 1; }
  sleep 2
done

sed -i "s/app-${ACTIVE}/app-${NEW}/g" nginx/upstream.conf
docker compose exec nginx nginx -s reload
echo "$NEW" > .active-color
docker compose stop "app-${ACTIVE}"
```

### Rolling Updates (Compose Deploy)

```yaml
deploy:
  replicas: 3
  update_config: { parallelism: 1, delay: 10s, order: start-first, failure_action: rollback }
```

### Rollback

Reverse the blue-green swap: start the previous color, update nginx upstream, stop the broken instance. Always keep the previous image available for instant rollback.

## 4. Production Readiness Checklist

**Security**
- [ ] Containers run as non-root
- [ ] No secrets in images (env vars or secret mounts)
- [ ] Base images pinned to specific versions
- [ ] TLS termination configured
- [ ] Security headers: CSP, HSTS, X-Frame-Options

**Configuration**
- [ ] All config via environment variables (12-factor)
- [ ] `.env.example` documents every required variable
- [ ] Secrets in CI/CD vault, never committed
- [ ] DATABASE_URL and tokens validated at startup

**Monitoring**
- [ ] `/health` endpoint checks app + dependencies
- [ ] Structured JSON logging to stdout
- [ ] Resource monitoring (CPU, memory, disk)
- [ ] Alerting on failures and error rate spikes

**Backup**
- [ ] Automated database backups (daily minimum)
- [ ] Restoration tested and documented
- [ ] Retention policy: 7 daily, 4 weekly, 12 monthly

**Deployment**
- [ ] Zero-downtime strategy in place
- [ ] Rollback tested and documented
- [ ] Migrations run before app deployment

## 5. Troubleshooting Guide

### Container Debugging

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"  # status overview
docker logs -f --tail 100 <container>                            # stream logs
docker exec -it <container> /bin/sh                              # shell into container
docker inspect --format='{{.State.ExitCode}}' <container>        # check exit code
docker stats --no-stream                                         # resource usage
```

### Log Analysis

```bash
docker logs <container> 2>&1 | grep -i "error\|fatal\|panic"    # find errors
docker logs --since "1h" <container>                             # recent logs
docker compose logs -f --tail 50 <service>                       # compose service logs
```

### Network Diagnosis

```bash
docker network inspect <network>                                 # list connected containers
docker exec <container> curl -sf http://<service>:<port>/health  # test connectivity
docker exec <container> nslookup <service-name>                  # DNS resolution
```

### Common Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Container exits immediately | Crash on startup | Check `docker logs`, verify CMD/entrypoint |
| Port already in use | Host port conflict | `lsof -i :<port>`, change mapping |
| Cannot resolve service name | Different networks | Put both on the same Docker network |
| Permission denied on volume | UID mismatch | Match UIDs or `chown` in entrypoint |
| Build cache not working | COPY invalidates layers | Deps first, source code last |
| OOM killed | Memory limit too low | `docker inspect` OOMKilled, raise limit |
