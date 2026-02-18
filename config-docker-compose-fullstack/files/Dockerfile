# =============================================================================
# Multi-stage Dockerfile — Node.js Application
# Stage 1 (deps):    Install dependencies
# Stage 2 (build):   Compile TypeScript / bundle
# Stage 3 (production): Minimal runtime image
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Dependencies
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Install OS packages needed for native modules (if any)
RUN apk add --no-cache libc6-compat

# Copy only package manifests for better layer caching
COPY package.json package-lock.json* ./

# Clean install — deterministic, production + dev deps (needed for build)
RUN npm ci

# ---------------------------------------------------------------------------
# Stage 2: Build
# ---------------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Build the application (TypeScript compile, bundler, etc.)
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: Production
# ---------------------------------------------------------------------------
FROM node:20-alpine AS production
WORKDIR /app

# Install wget for healthcheck probes
RUN apk add --no-cache wget

# Security: run as non-root user
RUN addgroup --system --gid 1001 appgroup \
 && adduser --system --uid 1001 --ingroup appgroup appuser

# Copy package manifests and install production-only dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from build stage
COPY --from=build --chown=appuser:appgroup /app/dist ./dist

# Drop privileges
USER appuser

# Expose application port
EXPOSE 3000

# Healthcheck — verify the app responds
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
