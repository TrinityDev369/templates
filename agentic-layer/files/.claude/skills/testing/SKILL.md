---
name: testing
description: Run and write tests using Vitest, Jest, or Playwright. Use when running tests, writing new tests, debugging failures, or checking coverage.
---

# Testing Skill

Run tests, write new tests, and maintain test coverage.

## Quick Reference

```bash
# Common test runners — adjust to your project
npx vitest run                     # Vitest (all tests)
npx vitest run --watch             # Vitest (watch mode)
npx vitest run --coverage          # Vitest (with coverage)
npx jest                           # Jest (all tests)
npx jest --watch                   # Jest (watch mode)
npx playwright test                # Playwright (E2E)
npx playwright test --ui           # Playwright (UI mode)
```

## Test File Naming

| Pattern | Purpose |
|---------|---------|
| `*.test.ts` | Unit tests (pure functions, isolated logic) |
| `*.integration.test.ts` | Integration tests (database, APIs, services) |
| `*.spec.ts` | E2E tests (browser, full-stack flows) |

## Writing Unit Tests

Use AAA pattern (Arrange, Act, Assert):

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
});
```

## Factory Functions

Create typed factories for test data:

```typescript
function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "test-id",
    name: "Test User",
    email: "test@example.com",
    ...overrides,
  };
}
```

## Assertions Reference

```typescript
// Equality
expect(result).toBe(expected);           // Strict
expect(result).toEqual(expected);        // Deep
expect(result).toMatchObject(partial);   // Partial

// Collections
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Ranges
expect(score).toBeGreaterThan(5);
expect(score).toBeLessThanOrEqual(10);

// Types
expect(typeof result).toBe("number");
expect(result).toHaveProperty("key");

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow("message");
```

## E2E with Playwright

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/path");
  });

  test("should display content", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Title" })).toBeVisible();
  });
});
```

## Coverage Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Statements | 70% | 85% |
| Branches | 60% | 80% |
| Functions | 70% | 85% |
| Lines | 70% | 85% |

## Guidelines

**Do:**
- Test behavior, not implementation details
- Use descriptive test names that read as sentences
- One assertion per test when practical
- Use factory functions for test data
- Clean up test data in `afterAll` / `afterEach`
- Test edge cases and error paths

**Don't:**
- Test private implementation details
- Share mutable state between tests
- Rely on test execution order
- Use `any` types in tests
- Skip failing tests without a tracking issue
