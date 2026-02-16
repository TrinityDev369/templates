---
name: security
description: Security review skill for authentication, input validation, secrets management, and API security. Use when adding auth, handling user input, working with secrets, or creating API endpoints.
---

# Security Review Skill

Ensure code follows security best practices and identify potential vulnerabilities.

## When to Activate

- Implementing authentication or authorization
- Handling user input or file uploads
- Creating new API endpoints
- Working with secrets or credentials
- Storing or transmitting sensitive data
- Integrating third-party APIs

## Security Checklist

### 1. Secrets Management

**NEVER** hardcode secrets:
```typescript
// Bad
const apiKey = "sk-proj-xxxxx"

// Good
const apiKey = process.env.API_KEY
if (!apiKey) throw new Error("API_KEY not configured")
```

**Verify:**
- [ ] No hardcoded API keys, tokens, or passwords
- [ ] All secrets in environment variables
- [ ] `.env.local` in .gitignore
- [ ] No secrets in git history

### 2. Input Validation

Always validate user input with schemas:
```typescript
import { z } from "zod"

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150),
})

export async function createUser(input: unknown) {
  const validated = CreateUserSchema.parse(input)
  return await db.users.create(validated)
}
```

**File uploads:**
```typescript
function validateUpload(file: File) {
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) throw new Error("File too large")

  const allowed = ["image/jpeg", "image/png", "image/webp"]
  if (!allowed.includes(file.type)) throw new Error("Invalid type")
}
```

**Verify:**
- [ ] All user inputs validated with schemas
- [ ] File uploads restricted (size, type, extension)
- [ ] No direct use of user input in queries
- [ ] Error messages don't leak internal details

### 3. SQL Injection Prevention

**NEVER** concatenate SQL:
```typescript
// Bad — SQL injection
const query = `SELECT * FROM users WHERE email = '${email}'`

// Good — parameterized query
const result = await db.query("SELECT * FROM users WHERE email = $1", [email])

// Good — ORM/query builder
const user = await db.users.findFirst({ where: { email } })
```

**Verify:**
- [ ] All queries use parameterized queries or ORM
- [ ] No string concatenation in SQL

### 4. Authentication & Authorization

**Token storage:**
```typescript
// Bad — localStorage (XSS vulnerable)
localStorage.setItem("token", token)

// Good — httpOnly cookies
res.setHeader("Set-Cookie",
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

**Authorization checks:**
```typescript
export async function deleteUser(userId: string, requester: User) {
  if (requester.role !== "admin") {
    return { error: "Unauthorized", status: 403 }
  }
  await db.users.delete({ where: { id: userId } })
}
```

**Verify:**
- [ ] Tokens in httpOnly cookies (not localStorage)
- [ ] Authorization checks before sensitive operations
- [ ] Role-based access control implemented

### 5. XSS Prevention

```typescript
import DOMPurify from "isomorphic-dompurify"

// Always sanitize user-provided HTML
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p"],
    ALLOWED_ATTR: [],
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

**Verify:**
- [ ] User-provided HTML sanitized
- [ ] CSP headers configured
- [ ] React's built-in XSS protection used

### 6. CSRF Protection

```typescript
export async function POST(request: Request) {
  const token = request.headers.get("X-CSRF-Token")
  if (!csrf.verify(token)) {
    return Response.json({ error: "Invalid CSRF token" }, { status: 403 })
  }
}
```

**Verify:**
- [ ] CSRF tokens on state-changing operations
- [ ] SameSite=Strict on all cookies

### 7. Rate Limiting

```typescript
import rateLimit from "express-rate-limit"

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests",
})

app.use("/api/", limiter)
```

**Verify:**
- [ ] Rate limiting on all API endpoints
- [ ] Stricter limits on expensive operations (search, auth)

### 8. Error Handling

```typescript
// Bad — exposing internals
catch (error) {
  return Response.json({ error: error.message, stack: error.stack }, { status: 500 })
}

// Good — generic message
catch (error) {
  console.error("Internal error:", error)
  return Response.json({ error: "An error occurred" }, { status: 500 })
}
```

**Verify:**
- [ ] No passwords, tokens, or secrets in logs
- [ ] Error messages generic for users
- [ ] No stack traces exposed to clients

## Pre-Deployment Checklist

- [ ] **Secrets**: No hardcoded secrets, all in env vars
- [ ] **Input Validation**: All user inputs validated
- [ ] **SQL Injection**: All queries parameterized
- [ ] **XSS**: User content sanitized
- [ ] **CSRF**: Protection enabled
- [ ] **Authentication**: Proper token handling
- [ ] **Authorization**: Role checks in place
- [ ] **Rate Limiting**: Enabled on all endpoints
- [ ] **HTTPS**: Enforced in production
- [ ] **Error Handling**: No sensitive data in errors
- [ ] **Dependencies**: No known vulnerabilities

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

---

Security is not optional. When in doubt, err on the side of caution.
