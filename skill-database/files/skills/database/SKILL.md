---
name: database
description: DB migration patterns, query safety, schema design skill for PostgreSQL
---

# Database Expert

PostgreSQL schema design, migration strategies, query optimization, and data integrity patterns for TypeScript projects.

## Quick Reference

```bash
# Generate migration (Prisma)
npx prisma migrate dev --name <description>

# Generate migration (Drizzle)
npx drizzle-kit generate
npx drizzle-kit migrate

# Inspect schema
npx prisma studio
# or:
npx drizzle-kit studio

# Direct SQL
psql -d <database> -c "SELECT ..."

# Check table structure
psql -d <database> -c "\d+ <table_name>"

# List all tables
psql -d <database> -c "\dt"

# Analyze query performance
psql -d <database> -c "EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) <query>"
```

## Decision Framework

### ORM Selection

```
Project type?
+-- Next.js full-stack      --> Prisma (type-safe, migrations, studio)
+-- Performance-critical    --> Drizzle (SQL-like, lightweight)
+-- Existing DB schema      --> Drizzle (introspection-first)
+-- Rapid prototyping       --> Prisma (push-based, auto-relations)
+-- Complex raw queries     --> raw pg/postgres.js (full control)
```

### When to Use Raw SQL

- Complex CTEs, window functions, or recursive queries
- Bulk operations (COPY, multi-row INSERT)
- Advisory locks, LISTEN/NOTIFY
- Performance-critical hot paths where ORM overhead matters

## Schema Design Principles

1. **Normalize first, denormalize for reads** - Start at 3NF, add views/materialized views for query patterns
2. **UUIDs over auto-increment** - Better for distributed systems, no enumeration attacks
3. **Soft delete by default** - `deleted_at` timestamp, filter in queries
4. **Audit columns always** - `created_at`, `updated_at`, `created_by`
5. **Enum tables over string enums** - Referential integrity, queryable
6. **Consistent naming** - snake_case for tables/columns, plural table names, `_id` suffix for foreign keys
7. **Timestamps with timezone** - Always use `TIMESTAMPTZ`, never bare `TIMESTAMP`

### Base Table Template

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- domain columns here
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Migration Workflow

### Safe Migration Pattern

```sql
-- ALWAYS: Additive migrations in production
-- Step 1: Add new column (nullable or with default)
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Step 2: Backfill data (in batches for large tables)
UPDATE users SET display_name = name WHERE display_name IS NULL;

-- Step 3: Add constraints AFTER backfill
ALTER TABLE users ALTER COLUMN display_name SET NOT NULL;

-- Step 4: Remove old column in NEXT migration (after code deploys)
-- ALTER TABLE users DROP COLUMN name;  -- separate PR
```

### Migration Template

```sql
-- Migration: Brief description
-- Created: YYYY-MM-DD
-- Description: What this changes and why

BEGIN;

-- Add column (nullable or with default)
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS new_column TYPE;

-- Create index concurrently (non-blocking on large tables)
-- NOTE: CREATE INDEX CONCURRENTLY cannot run inside a transaction block
-- Run separately: CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_name ON table_name(column);

-- Add comment
COMMENT ON COLUMN table_name.new_column IS 'Description';

-- Backfill (for large tables, use batches)
UPDATE table_name SET new_column = 'value' WHERE new_column IS NULL;

-- Add constraint after backfill
ALTER TABLE table_name ALTER COLUMN new_column SET NOT NULL;

COMMIT;
```

### Dangerous Operations (Require Downtime or Careful Planning)

```
!!  Renaming columns       --> Add new, backfill, deploy code, drop old
!!  Changing column types   --> Add new column, migrate data, swap
!!  Adding NOT NULL without default --> Backfill first
!!  Dropping columns        --> Ensure no code references first
!!  Adding unique constraints --> Verify no duplicates exist
!!  Large table migrations  --> Use batched updates, off-peak hours
!!  Dropping indexes        --> Verify no queries depend on them
```

### Batch Update Pattern (Large Tables)

```sql
-- Update in batches of 1000 to avoid long locks
DO $$
DECLARE
  batch_size INT := 1000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE table_name
    SET new_column = compute_value(old_column)
    WHERE id IN (
      SELECT id FROM table_name
      WHERE new_column IS NULL
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    );
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;
    PERFORM pg_sleep(0.1);  -- Brief pause to reduce lock contention
  END LOOP;
END $$;
```

## Query Optimization

### Index Strategy

```sql
-- B-tree (default): equality and range queries
CREATE INDEX idx_users_email ON users(email);

-- Composite: match query patterns (leftmost prefix rule)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
-- Works for: WHERE user_id = ? AND status = ?
-- Works for: WHERE user_id = ?
-- Does NOT work for: WHERE status = ?

-- Partial: reduce index size for common filters
CREATE INDEX idx_active_users ON users(email) WHERE deleted_at IS NULL;

-- GIN: array/JSONB containment
CREATE INDEX idx_tags ON posts USING GIN(tags);

-- Expression index: for computed lookups
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- Covering index: include columns to avoid table lookup
CREATE INDEX idx_orders_covering ON orders(user_id) INCLUDE (status, total);
```

### Query Anti-Patterns

```sql
-- BAD: SELECT * (fetches unnecessary data)
SELECT * FROM users WHERE id = $1;
-- GOOD: Select only needed columns
SELECT id, email, name FROM users WHERE id = $1;

-- BAD: N+1 queries
for user in users:
  orders = SELECT * FROM orders WHERE user_id = user.id
-- GOOD: Join or batch
SELECT u.id, u.email, o.id as order_id, o.total
FROM users u LEFT JOIN orders o ON o.user_id = u.id;

-- BAD: Offset pagination (scans all skipped rows)
SELECT * FROM posts ORDER BY created_at LIMIT 20 OFFSET 1000;
-- GOOD: Cursor pagination
SELECT * FROM posts WHERE created_at < $cursor ORDER BY created_at DESC LIMIT 20;

-- BAD: Functions on indexed columns
SELECT * FROM users WHERE LOWER(email) = 'foo@bar.com';
-- GOOD: Expression index or store normalized
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- BAD: OR conditions preventing index use
SELECT * FROM orders WHERE user_id = $1 OR status = $2;
-- GOOD: UNION ALL for separate index scans
SELECT * FROM orders WHERE user_id = $1
UNION ALL
SELECT * FROM orders WHERE status = $2 AND user_id != $1;
```

### EXPLAIN ANALYZE Reading

```
Key metrics to check:
- Seq Scan on large table        --> Missing index
- Nested Loop with high rows     --> Consider hash/merge join
- Sort with high memory          --> Add index for ORDER BY
- Hash Join memory > work_mem    --> Increase work_mem
- Rows estimate vs actual far off --> Run ANALYZE
- Bitmap Heap Scan with lossy    --> Increase work_mem
- Disk sort (external merge)     --> Increase work_mem or add index
```

## Prisma Patterns

### Schema Design

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      Role     @default(MEMBER)

  // Relations
  projects  ProjectMember[]

  // Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@index([email])
  @@map("users")
}

enum Role {
  ADMIN
  MANAGER
  MEMBER
  VIEWER
}
```

### Efficient Queries

```typescript
// Batch operations (reduces round-trips)
const [users, count] = await prisma.$transaction([
  prisma.user.findMany({ where, take: 20, skip: offset }),
  prisma.user.count({ where }),
])

// Select only needed fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, role: true },
})

// Cursor pagination
const posts = await prisma.post.findMany({
  take: 20,
  cursor: { id: lastId },
  skip: 1, // skip the cursor itself
  orderBy: { createdAt: "desc" },
})

// Upsert (insert or update)
const user = await prisma.user.upsert({
  where: { email },
  update: { name, updatedAt: new Date() },
  create: { email, name, role: "MEMBER" },
})
```

## Drizzle Patterns

### Schema Design

```typescript
import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["ADMIN", "MANAGER", "MEMBER", "VIEWER"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("MEMBER"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  total: text("total").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

### Efficient Queries

```typescript
import { db } from "./db";
import { users, orders } from "./schema";
import { eq, and, lt, desc, sql } from "drizzle-orm";

// Select with filter
const activeUsers = await db
  .select({ id: users.id, email: users.email })
  .from(users)
  .where(eq(users.role, "MEMBER"));

// Join
const userOrders = await db
  .select()
  .from(users)
  .leftJoin(orders, eq(orders.userId, users.id))
  .where(eq(users.id, userId));

// Cursor pagination
const posts = await db
  .select()
  .from(posts)
  .where(lt(posts.createdAt, cursor))
  .orderBy(desc(posts.createdAt))
  .limit(20);

// Insert returning
const [newUser] = await db
  .insert(users)
  .values({ email, name, role: "MEMBER" })
  .returning();

// Update
await db
  .update(users)
  .set({ name: "New Name", updatedAt: new Date() })
  .where(eq(users.id, userId));

// Raw SQL escape hatch
const result = await db.execute(
  sql`SELECT * FROM users WHERE email ILIKE ${`%${search}%`}`
);
```

### Drizzle Connection Setup

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

## Connection Management

```typescript
// Singleton pattern for Prisma in Next.js
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query"] : [],
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

### Connection Pool Sizing

```
Formula: connections = (CPU cores * 2) + effective_spindle_count
- Serverless (Vercel): Use connection pooler (PgBouncer/Supabase pooler)
- Max pool size: 10-20 for typical apps
- Statement timeout: 30s for web, 5min for background jobs
```

### Serverless Considerations

```typescript
// For serverless environments, use a connection pooler URL
// and limit max connections to prevent exhaustion

// Prisma
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }, // Use pooler URL (port 6543)
  },
})

// postgres.js
const sql = postgres(process.env.DATABASE_URL!, {
  max: 5,           // Limit connections in serverless
  idle_timeout: 20, // Close idle connections quickly
  max_lifetime: 60 * 30, // 30 min max lifetime
})
```

## Data Integrity Patterns

```sql
-- Optimistic locking (prevent lost updates)
UPDATE projects
SET name = $1, version = version + 1
WHERE id = $2 AND version = $3;
-- If 0 rows affected --> concurrent modification, retry

-- Advisory locks (prevent duplicate processing)
SELECT pg_try_advisory_lock(hashtext('process-payments'));
-- Do work...
SELECT pg_advisory_unlock(hashtext('process-payments'));

-- Idempotency keys (safe retries)
CREATE UNIQUE INDEX idx_idempotency ON operations(idempotency_key);
INSERT INTO operations (idempotency_key, ...)
ON CONFLICT (idempotency_key) DO NOTHING
RETURNING *;

-- Row-level locking (SELECT FOR UPDATE)
BEGIN;
SELECT * FROM accounts WHERE id = $1 FOR UPDATE;
UPDATE accounts SET balance = balance - $2 WHERE id = $1;
COMMIT;

-- Serializable transactions (strongest isolation)
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- Critical operations here
COMMIT;
-- Handle serialization failures with retry logic
```

## JSONB Patterns

```sql
-- Store flexible metadata
ALTER TABLE users ADD COLUMN metadata JSONB DEFAULT '{}';

-- Query nested fields
SELECT * FROM users WHERE metadata->>'plan' = 'premium';
SELECT * FROM users WHERE metadata @> '{"features": ["sso"]}';

-- Index for containment queries
CREATE INDEX idx_users_metadata ON users USING GIN(metadata);

-- Index specific key for equality
CREATE INDEX idx_users_plan ON users ((metadata->>'plan'));

-- Update nested value
UPDATE users
SET metadata = jsonb_set(metadata, '{plan}', '"enterprise"')
WHERE id = $1;
```

## Common Gotchas

1. **Forgetting `WHERE` on UPDATE/DELETE** - Always double-check destructive statements
2. **Missing indexes on foreign keys** - PostgreSQL does NOT auto-index FK columns
3. **TIMESTAMP vs TIMESTAMPTZ** - Always use `TIMESTAMPTZ` to avoid timezone bugs
4. **Connection leaks** - Always close/release connections in `finally` blocks
5. **Large transactions** - Keep transactions short to avoid long-held locks
6. **Missing ANALYZE after bulk load** - Stale statistics lead to bad query plans
7. **Text vs VARCHAR** - In PostgreSQL, `TEXT` and `VARCHAR` perform identically; prefer `TEXT`
8. **Enum migrations** - PostgreSQL enums are hard to modify; consider text + CHECK constraint instead
