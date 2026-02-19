---
name: api-design
description: REST and GraphQL API design best practices — resource modeling, versioning, error handling, pagination, authentication patterns
---

# API Design Skill

Design production-grade REST APIs with consistent patterns, strong typing, and clear contracts.

## Use this skill when

- Designing new API endpoints or route handlers
- Reviewing API contracts for consistency and completeness
- Implementing pagination, filtering, or bulk operations
- Setting up error handling and validation patterns
- Writing OpenAPI/Swagger specifications
- Building Next.js Route Handlers or Hono APIs

## Do not use this skill when

- Building pure GraphQL schemas (use a dedicated GraphQL skill)
- Implementing WebSocket/real-time protocols
- Designing database schemas (use the database skill)

---

## 1. REST API Design Principles

### Resource Naming

| Convention | Example | Rule |
|-----------|---------|------|
| Plural nouns | `/users`, `/invoices` | Always plural for collections |
| Kebab-case | `/project-members` | Multi-word resources use hyphens |
| Nesting | `/projects/:id/tasks` | Max 2 levels deep |
| No verbs | `/users` not `/getUsers` | HTTP method conveys the action |
| Lowercase | `/api/v1/users` | Never mixed case |

### HTTP Methods

| Method | Action | Idempotent | Request Body | Success Code |
|--------|--------|-----------|-------------|-------------|
| `GET` | Read resource(s) | Yes | No | 200 |
| `POST` | Create resource | No | Yes | 201 |
| `PUT` | Full replace | Yes | Yes | 200 |
| `PATCH` | Partial update | Yes | Yes | 200 |
| `DELETE` | Remove resource | Yes | No | 204 |

### Status Code Reference

```
2xx Success
  200 OK              — General success, body contains result
  201 Created         — Resource created, Location header set
  204 No Content      — Success with no response body (DELETE)

4xx Client Error
  400 Bad Request     — Malformed syntax, missing required fields
  401 Unauthorized    — No valid authentication credentials
  403 Forbidden       — Authenticated but lacks permission
  404 Not Found       — Resource does not exist
  409 Conflict        — State conflict (duplicate, version mismatch)
  422 Unprocessable   — Valid syntax but semantic errors (validation)
  429 Too Many Reqs   — Rate limit exceeded

5xx Server Error
  500 Internal Error  — Unexpected server failure
  502 Bad Gateway     — Upstream service failure
  503 Unavailable     — Service temporarily down (maintenance)
```

### URL Structure

```
GET    /api/v1/projects                    # List projects
POST   /api/v1/projects                    # Create project
GET    /api/v1/projects/:id                # Get single project
PUT    /api/v1/projects/:id                # Replace project
PATCH  /api/v1/projects/:id                # Update project fields
DELETE /api/v1/projects/:id                # Delete project
GET    /api/v1/projects/:id/tasks          # List project tasks
POST   /api/v1/projects/:id/tasks          # Create task in project
POST   /api/v1/projects/:id/tasks/bulk     # Bulk create tasks
POST   /api/v1/projects/:id/archive        # Action (RPC-style, when no resource noun fits)
```

---

## 2. Request/Response Patterns

### Standard JSON Envelope

Every response uses a consistent envelope:

```typescript
// Success response
interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    cursor?: string | null;
    hasMore?: boolean;
  };
}

// Error response
interface ApiErrorResponse {
  error: {
    code: string;           // Machine-readable: "VALIDATION_ERROR"
    message: string;        // Human-readable: "Validation failed"
    details?: ErrorDetail[];
  };
}

interface ErrorDetail {
  field?: string;           // "email" or "address.zip"
  code: string;             // "REQUIRED", "INVALID_FORMAT"
  message: string;          // "Email is required"
}
```

### Response Examples

```typescript
// Single resource
{
  "data": {
    "id": "proj_abc123",
    "name": "Website Redesign",
    "status": "active",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}

// Collection with pagination meta
{
  "data": [
    { "id": "proj_abc123", "name": "Website Redesign" },
    { "id": "proj_def456", "name": "API Migration" }
  ],
  "meta": {
    "cursor": "eyJpZCI6InByb2pfZGVmNDU2In0",
    "hasMore": true,
    "total": 47
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "code": "INVALID_FORMAT", "message": "Must be a valid email" },
      { "field": "name", "code": "REQUIRED", "message": "Name is required" }
    ]
  }
}
```

### Cursor-Based Pagination (Preferred)

Cursor pagination avoids the drift problems of offset-based pagination:

```typescript
// Request
GET /api/v1/projects?limit=20&cursor=eyJpZCI6MTAwfQ

// Zod schema
const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Implementation
async function listProjects(params: { limit: number; cursor?: string }) {
  const { limit, cursor } = params;
  let query = sql`SELECT * FROM projects WHERE deleted_at IS NULL`;

  if (cursor) {
    const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString());
    query = sql`${query} AND id > ${decoded.id}`;
  }

  query = sql`${query} ORDER BY id ASC LIMIT ${limit + 1}`;
  const rows = await query;

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore
    ? Buffer.from(JSON.stringify({ id: data.at(-1)!.id })).toString("base64url")
    : null;

  return {
    data,
    meta: { cursor: nextCursor, hasMore, limit },
  };
}
```

### Offset Pagination (When Needed)

Use only when clients need to jump to arbitrary pages:

```typescript
GET /api/v1/projects?page=3&perPage=20

const offsetSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(20),
});
```

### Filtering and Sorting

```typescript
// Query parameters
GET /api/v1/projects?status=active&sort=-createdAt&limit=20

const filterSchema = z.object({
  status: z.enum(["active", "archived", "draft"]).optional(),
  search: z.string().min(1).max(200).optional(),
  createdAfter: z.coerce.date().optional(),
  createdBefore: z.coerce.date().optional(),
  sort: z.string().regex(/^-?(createdAt|name|updatedAt)$/).default("-createdAt"),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Parse sort direction
function parseSort(sort: string) {
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  return { field, direction: desc ? "DESC" : "ASC" } as const;
}
```

### Partial Responses

```typescript
// Request only specific fields
GET /api/v1/users?fields=id,name,email

const fieldsSchema = z.object({
  fields: z
    .string()
    .transform((s) => s.split(",").map((f) => f.trim()))
    .pipe(z.array(z.enum(["id", "name", "email", "role", "createdAt"])))
    .optional(),
});
```

### Bulk Operations

```typescript
// Bulk create
POST /api/v1/tasks/bulk
{
  "items": [
    { "title": "Task A", "projectId": "proj_abc" },
    { "title": "Task B", "projectId": "proj_abc" }
  ]
}

// Bulk response (per-item status)
{
  "data": {
    "succeeded": [
      { "index": 0, "id": "task_001", "title": "Task A" }
    ],
    "failed": [
      { "index": 1, "error": { "code": "CONFLICT", "message": "Duplicate title" } }
    ]
  },
  "meta": { "total": 2, "succeeded": 1, "failed": 1 }
}
```

---

## 3. Error Handling

### Standard Error Codes

```typescript
const ErrorCodes = {
  // Client errors
  VALIDATION_ERROR: { status: 422, message: "Validation failed" },
  NOT_FOUND: { status: 404, message: "Resource not found" },
  UNAUTHORIZED: { status: 401, message: "Authentication required" },
  FORBIDDEN: { status: 403, message: "Insufficient permissions" },
  CONFLICT: { status: 409, message: "Resource conflict" },
  RATE_LIMITED: { status: 429, message: "Too many requests" },
  BAD_REQUEST: { status: 400, message: "Invalid request" },

  // Server errors
  INTERNAL_ERROR: { status: 500, message: "Internal server error" },
  SERVICE_UNAVAILABLE: { status: 503, message: "Service temporarily unavailable" },
} as const;
```

### ApiError Class

```typescript
class ApiError extends Error {
  constructor(
    public readonly code: keyof typeof ErrorCodes,
    public readonly details?: ErrorDetail[],
    message?: string,
  ) {
    const def = ErrorCodes[code];
    super(message ?? def.message);
    this.name = "ApiError";
  }

  get status(): number {
    return ErrorCodes[this.code].status;
  }

  toJSON(): ApiErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details?.length ? { details: this.details } : {}),
      },
    };
  }
}

// Usage
throw new ApiError("NOT_FOUND");
throw new ApiError("VALIDATION_ERROR", [
  { field: "email", code: "INVALID_FORMAT", message: "Must be a valid email" },
]);
```

### Zod Validation Error Mapping

```typescript
import { ZodError } from "zod";

function zodToApiError(error: ZodError): ApiError {
  const details: ErrorDetail[] = error.issues.map((issue) => ({
    field: issue.path.join("."),
    code: issue.code.toUpperCase(),
    message: issue.message,
  }));
  return new ApiError("VALIDATION_ERROR", details);
}
```

### Rate Limiting Headers

```typescript
// Always include on rate-limited endpoints
const rateLimitHeaders = {
  "X-RateLimit-Limit": "100",       // Max requests per window
  "X-RateLimit-Remaining": "97",    // Remaining in current window
  "X-RateLimit-Reset": "1706799600", // Unix timestamp when window resets
  "Retry-After": "30",              // Seconds until retry (on 429 only)
};
```

### Idempotency Keys

```typescript
// Client sends a unique key with POST requests
POST /api/v1/payments
Idempotency-Key: idem_a1b2c3d4e5

// Server implementation
async function handleWithIdempotency(
  key: string,
  handler: () => Promise<Response>,
): Promise<Response> {
  // Check if already processed
  const existing = await sql`
    SELECT response_status, response_body
    FROM idempotency_keys WHERE key = ${key}
  `;

  if (existing.length > 0) {
    return new Response(existing[0].response_body, {
      status: existing[0].response_status,
    });
  }

  // Process and store result
  const response = await handler();
  const body = await response.clone().text();

  await sql`
    INSERT INTO idempotency_keys (key, response_status, response_body, expires_at)
    VALUES (${key}, ${response.status}, ${body}, NOW() + INTERVAL '24 hours')
    ON CONFLICT (key) DO NOTHING
  `;

  return response;
}
```

---

## 4. Authentication and Authorization

### Bearer Token Pattern

```typescript
// Client request
GET /api/v1/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Server extraction
function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}
```

### API Key Patterns

```typescript
// Header-based (preferred — keys stay out of URLs/logs)
GET /api/v1/projects
X-API-Key: sk_live_abc123def456

// Server validation
async function validateApiKey(request: Request): Promise<ApiKeyRecord | null> {
  const key = request.headers.get("X-API-Key");
  if (!key) return null;

  // Hash the key for lookup (never store plain-text keys)
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(key),
  );
  const hashHex = Buffer.from(hash).toString("hex");

  const [record] = await sql`
    SELECT * FROM api_keys
    WHERE key_hash = ${hashHex} AND revoked_at IS NULL
  `;
  return record ?? null;
}
```

### Scope-Based Authorization

```typescript
type Scope =
  | "projects:read"
  | "projects:write"
  | "users:read"
  | "users:write"
  | "billing:read"
  | "billing:write";

function requireScopes(...required: Scope[]) {
  return (handler: Handler): Handler => {
    return async (request, context) => {
      const tokenScopes: Scope[] = context.auth.scopes;
      const missing = required.filter((s) => !tokenScopes.includes(s));

      if (missing.length > 0) {
        throw new ApiError("FORBIDDEN", [
          {
            code: "MISSING_SCOPES",
            message: `Required scopes: ${missing.join(", ")}`,
          },
        ]);
      }

      return handler(request, context);
    };
  };
}

// Usage
const listProjects = requireScopes("projects:read")(async (req, ctx) => {
  // handler logic
});
```

---

## 5. API Versioning

### URL Path Versioning (Recommended)

```
/api/v1/projects     ← current stable
/api/v2/projects     ← new version with breaking changes
```

Advantages: explicit, cacheable, easy to route at load-balancer level.

### Header Versioning (Alternative)

```
GET /api/projects
Accept: application/vnd.myapp.v2+json
```

### Breaking vs Non-Breaking Changes

| Change | Breaking? | Action |
|--------|----------|--------|
| Add optional field to response | No | Just add it |
| Add optional query parameter | No | Just add it |
| Remove response field | **Yes** | New version |
| Rename response field | **Yes** | New version |
| Change field type | **Yes** | New version |
| Add required request field | **Yes** | New version |
| Change URL structure | **Yes** | New version |
| Change error code format | **Yes** | New version |

### Version Routing in Next.js

```typescript
// app/api/v1/projects/route.ts  — v1 handler
// app/api/v2/projects/route.ts  — v2 handler with breaking changes

// Or with route groups for shared middleware:
// app/api/(v1)/v1/projects/route.ts
// app/api/(v2)/v2/projects/route.ts
```

---

## 6. OpenAPI / Swagger

### Schema-First Workflow

```
1. Define schemas in Zod          (source of truth)
2. Generate OpenAPI from Zod      (zod-to-openapi)
3. Generate docs from OpenAPI     (Swagger UI / Redoc)
4. Validate requests with Zod     (runtime safety)
```

### Zod to OpenAPI

```typescript
import { z } from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// Define reusable schemas
const ProjectSchema = z
  .object({
    id: z.string().openapi({ example: "proj_abc123" }),
    name: z.string().min(1).max(200).openapi({ example: "Website Redesign" }),
    status: z.enum(["active", "archived", "draft"]),
    createdAt: z.string().datetime(),
  })
  .openapi("Project");

const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  createdAt: true,
}).openapi("CreateProject");

// Register endpoints
registry.registerPath({
  method: "get",
  path: "/api/v1/projects",
  summary: "List projects",
  request: {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "Projects list",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(ProjectSchema),
            meta: z.object({
              cursor: z.string().nullable(),
              hasMore: z.boolean(),
            }),
          }),
        },
      },
    },
  },
});
```

### Generate OpenAPI Document

```typescript
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

const generator = new OpenApiGeneratorV3(registry.definitions);
const document = generator.generateDocument({
  openapi: "3.0.3",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "API documentation",
  },
  servers: [{ url: "https://api.example.com" }],
});

// Serve at /api/docs/openapi.json
```

---

## 7. Next.js Route Handlers

### Route Handler Structure

```
app/
  api/
    v1/
      projects/
        route.ts              # GET (list), POST (create)
        [id]/
          route.ts            # GET, PUT, PATCH, DELETE
          tasks/
            route.ts          # GET (list tasks), POST (create task)
```

### Request Validation with Zod

```typescript
// app/api/v1/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["active", "draft"]).default("draft"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const [project] = await sql`
      INSERT INTO projects (name, description, status)
      VALUES (${validated.name}, ${validated.description ?? null}, ${validated.status})
      RETURNING *
    `;

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const apiError = zodToApiError(error);
      return NextResponse.json(apiError.toJSON(), { status: 422 });
    }
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.status });
    }
    console.error("Unhandled error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 },
    );
  }
}
```

### Params Validation

```typescript
// app/api/v1/projects/[id]/route.ts
const paramsSchema = z.object({
  id: z.string().uuid("Invalid project ID"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = paramsSchema.parse(await params);

  const [project] = await sql`
    SELECT * FROM projects WHERE id = ${id} AND deleted_at IS NULL
  `;

  if (!project) {
    throw new ApiError("NOT_FOUND");
  }

  return NextResponse.json({ data: project });
}
```

### Error Handler Wrapper

```typescript
type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>;

function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const apiError = zodToApiError(error);
        return NextResponse.json(apiError.toJSON(), { status: 422 });
      }
      if (error instanceof ApiError) {
        return NextResponse.json(error.toJSON(), { status: error.status });
      }
      console.error("Unhandled API error:", error);
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        { status: 500 },
      );
    }
  };
}

// Usage — clean handlers without try/catch boilerplate
export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = paramsSchema.parse(await params);
  const [project] = await sql`SELECT * FROM projects WHERE id = ${id}`;
  if (!project) throw new ApiError("NOT_FOUND");
  return NextResponse.json({ data: project });
});

export const DELETE = withErrorHandling(async (request, { params }) => {
  const { id } = paramsSchema.parse(await params);
  await sql`UPDATE projects SET deleted_at = NOW() WHERE id = ${id}`;
  return new NextResponse(null, { status: 204 });
});
```

### Type-Safe Response Helper

```typescript
function jsonResponse<T>(data: T, init?: { status?: number; headers?: Record<string, string> }) {
  return NextResponse.json(
    { data },
    {
      status: init?.status ?? 200,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    },
  );
}

function createdResponse<T>(data: T, location?: string) {
  return NextResponse.json(
    { data },
    {
      status: 201,
      headers: location ? { Location: location } : undefined,
    },
  );
}

function noContentResponse() {
  return new NextResponse(null, { status: 204 });
}
```

---

## Quick Reference Checklist

When designing a new API endpoint, verify:

- [ ] Resource name is plural, kebab-case, no verbs
- [ ] HTTP method matches the operation semantics
- [ ] Response uses `{ data, meta?, error? }` envelope
- [ ] Errors use `{ error: { code, message, details? } }` format
- [ ] Request body validated with Zod schema
- [ ] URL params validated (UUID format, etc.)
- [ ] Pagination uses cursor-based approach (or offset with justification)
- [ ] Sort/filter params are validated against allowed values
- [ ] Appropriate status code for each response path
- [ ] Auth check occurs before business logic
- [ ] Rate limiting headers included on public endpoints
- [ ] No sensitive data leaked in error messages
- [ ] Idempotency key supported for non-idempotent mutations
- [ ] Breaking changes increment the API version
