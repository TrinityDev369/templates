---
name: testing
description: Run and write tests using Vitest (unit/integration) and Playwright (E2E). Use when running tests, writing new tests, debugging test failures, or checking test coverage. Covers test patterns, runner commands, and best practices.
---

# Testing Skill

Run tests, write new tests, and maintain test coverage for your TypeScript project.

## Quick Reference

```bash
# Run all tests
npx vitest run

# Run specific test file
npx vitest run src/utils/math.test.ts

# Run tests matching a pattern
npx vitest run --reporter=verbose -t "should calculate"

# Run with coverage
npx vitest run --coverage

# Watch mode (re-runs on file changes)
npx vitest --watch

# Integration tests only (by filename convention)
npx vitest run --reporter=verbose "**/*.integration.test.ts"

# Unit tests only (exclude integration)
npx vitest run --exclude "**/*.integration.test.ts"
```

## Testing Stack

| Layer | Tool | Typical Location |
|-------|------|------------------|
| Unit | Vitest | `src/**/*.test.ts`, `tests/*.test.ts` |
| Integration | Vitest + Database | `src/**/*.integration.test.ts`, `tests/*.integration.test.ts` |
| E2E | Playwright | `e2e/*.spec.ts`, `tests/e2e/*.spec.ts` |

## File Naming

| Pattern | Purpose |
|---------|---------|
| `*.test.ts` | Unit tests (pure functions, isolated logic) |
| `*.integration.test.ts` | Integration tests (database, external services) |
| `*.spec.ts` | E2E tests (Playwright browser tests) |

## Writing Unit Tests

Use the AAA pattern (Arrange, Act, Assert):

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("ComponentName", () => {
  beforeEach(() => {
    // Reset state
  });

  it("should handle expected case", () => {
    // Arrange
    const input = createTestInput();

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expectedValue);
  });

  it("should throw on invalid input", () => {
    expect(() => functionUnderTest(null)).toThrow("Input required");
  });
});
```

## Factory Functions

Create typed factories for test data. Use `Partial<T>` overrides to keep tests concise:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "guest";
  createdAt: Date;
}

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-001",
    name: "Test User",
    email: "test@example.com",
    role: "member",
    createdAt: new Date("2025-01-01"),
    ...overrides,
  };
}

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order-001",
    userId: "user-001",
    status: "pending",
    total: 99.99,
    items: [],
    ...overrides,
  };
}

// Usage in tests
it("should grant access to admins", () => {
  const admin = makeUser({ role: "admin" });
  expect(canAccessDashboard(admin)).toBe(true);
});
```

## Database Integration Tests

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL || "postgres://localhost:5432/mydb_test";
const sql = postgres(DATABASE_URL);

describe("User Repository", () => {
  beforeAll(async () => {
    // Seed test data
    await sql`
      INSERT INTO users (id, name, email)
      VALUES ('test-001', 'Test User', 'test@example.com')
      ON CONFLICT DO NOTHING
    `;
  });

  afterAll(async () => {
    // Clean up test data
    await sql`DELETE FROM users WHERE id LIKE 'test-%'`;
    await sql.end();
  });

  it("should find user by email", async () => {
    const [user] = await sql`
      SELECT * FROM users WHERE email = 'test@example.com'
    `;
    expect(user).toBeDefined();
    expect(user.name).toBe("Test User");
  });

  it("should update user name", async () => {
    await sql`UPDATE users SET name = 'Updated' WHERE id = 'test-001'`;
    const [user] = await sql`SELECT name FROM users WHERE id = 'test-001'`;
    expect(user.name).toBe("Updated");
  });
});
```

**Integration test tips:**
- Always use a dedicated test database or test-prefixed IDs
- Clean up in `afterAll` to avoid polluting other test runs
- Use `ON CONFLICT DO NOTHING` for idempotent seeding
- End the database connection in `afterAll` to prevent hanging

## Assertions Reference

```typescript
// Equality
expect(result).toBe(expected);           // Strict equality (===)
expect(result).toEqual(expected);        // Deep equality
expect(result).toMatchObject(partial);   // Partial object match

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeDefined();
expect(value).toBeUndefined();

// Collections
expect(array).toContain(item);
expect(array).toHaveLength(3);
expect(new Set(items)).toEqual(new Set(expected));

// Numbers and ranges
expect(score).toBeGreaterThan(5);
expect(score).toBeLessThanOrEqual(10);
expect(price).toBeCloseTo(9.99, 2);

// Strings
expect(message).toMatch(/error/i);
expect(url).toContain("/api/v1");

// Types and properties
expect(typeof result).toBe("number");
expect(result).toHaveProperty("key");
expect(result).toHaveProperty("nested.value", 42);

// Exceptions
expect(() => riskyFn()).toThrow();
expect(() => riskyFn()).toThrow("specific message");
expect(() => riskyFn()).toThrowError(/pattern/);

// Async
await expect(asyncFn()).resolves.toBe(value);
await expect(asyncFn()).rejects.toThrow("error");

// Snapshots
expect(output).toMatchSnapshot();
expect(output).toMatchInlineSnapshot(`"expected"`);
```

## E2E with Playwright

```typescript
import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("should show error on invalid credentials", async ({ page }) => {
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("badpassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

  test("should redirect to dashboard on success", async ({ page }) => {
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("correctpassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
```

**Playwright tips:**
- Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
- Use `await expect(...).toBeVisible()` for element assertions
- Use `page.waitForURL()` or `expect(page).toHaveURL()` for navigation
- Run with `npx playwright test` and `npx playwright test --ui` for debugging

## Coverage Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Statements | 70% | 85% |
| Branches | 60% | 80% |
| Functions | 70% | 85% |
| Lines | 70% | 85% |

Configure in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
});
```

## Guidelines

**Do:**
- Test behavior, not implementation details
- Use descriptive test names that read like specifications
- One logical assertion per test when possible
- Use factory functions for test data
- Clean up test data in `afterAll`
- Test edge cases, error paths, and boundary conditions
- Keep tests independent -- no shared mutable state
- Run tests before committing

**Don't:**
- Test private implementation details
- Share mutable state between tests
- Rely on test execution order
- Use `any` types in tests
- Skip failing tests without tracking the issue
- Mock what you don't own (wrap external deps in adapters, mock the adapter)
- Write tests that pass when the code is broken
