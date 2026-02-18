// =============================================================================
// Example: Pure Logic Tests (No React)
// =============================================================================
// Demonstrates the core Vitest testing patterns:
//   - describe / it / expect structure
//   - beforeEach for setup
//   - vi.fn() for mock functions
//   - vi.spyOn() for spying on existing methods
//   - MSW handler overrides for API-dependent logic
//
// This file tests a simple utility function defined inline. In a real project,
// you would import the function from your source code instead.
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

// -----------------------------------------------------------------------------
// Utility under test (inline for demonstration)
// -----------------------------------------------------------------------------

/** Clamp a number between a min and max value */
function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError('min must be less than or equal to max');
  }
  return Math.min(Math.max(value, min), max);
}

/** Format a price in cents to a human-readable string */
function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/** Fetch the current user's name from the API */
async function fetchCurrentUserName(): Promise<string> {
  const response = await fetch('/api/user');
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }
  const user = await response.json();
  return user.name;
}

// =============================================================================
// Tests
// =============================================================================

describe('clamp', () => {
  it('should return the value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('should clamp to min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('should clamp to max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should return min/max when they are equal', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it('should throw when min > max', () => {
    expect(() => clamp(5, 10, 0)).toThrow(RangeError);
    expect(() => clamp(5, 10, 0)).toThrow('min must be less than or equal to max');
  });
});

describe('formatPrice', () => {
  it('should format cents as USD by default', () => {
    expect(formatPrice(1999)).toBe('$19.99');
  });

  it('should handle zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('should support other currencies', () => {
    expect(formatPrice(4999, 'EUR')).toBe('\u20AC49.99');
  });
});

// -----------------------------------------------------------------------------
// Mock function demonstrations
// -----------------------------------------------------------------------------

describe('vi.fn() — mock functions', () => {
  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callback = vi.fn();
  });

  it('should track calls', () => {
    callback('hello');
    callback('world');

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith('hello');
    expect(callback).toHaveBeenLastCalledWith('world');
  });

  it('should support return values', () => {
    callback.mockReturnValue(42);
    expect(callback()).toBe(42);

    callback.mockReturnValueOnce('first').mockReturnValueOnce('second');
    expect(callback()).toBe('first');
    expect(callback()).toBe('second');
    expect(callback()).toBe(42); // falls back to default
  });

  it('should support async return values', async () => {
    callback.mockResolvedValue({ ok: true });
    const result = await callback();
    expect(result).toEqual({ ok: true });
  });
});

// -----------------------------------------------------------------------------
// vi.spyOn() demonstrations
// -----------------------------------------------------------------------------

describe('vi.spyOn() — spying on existing methods', () => {
  it('should spy on console.warn without replacing it', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    console.warn('test warning');

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('test warning');

    spy.mockRestore(); // restore original implementation
  });

  it('should spy on Math.random for deterministic tests', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(Math.random()).toBe(0.5);
    expect(Math.random()).toBe(0.5);

    spy.mockRestore();
  });
});

// -----------------------------------------------------------------------------
// MSW handler override demonstration
// -----------------------------------------------------------------------------

describe('fetchCurrentUserName — with MSW', () => {
  it('should return the default mock user name', async () => {
    const name = await fetchCurrentUserName();
    expect(name).toBe('Test User'); // from default handler in handlers.ts
  });

  it('should work with a per-test handler override', async () => {
    // Override the /api/user handler for this test only
    server.use(
      http.get('/api/user', () => {
        return HttpResponse.json({ id: 99, name: 'Custom User' });
      }),
    );

    const name = await fetchCurrentUserName();
    expect(name).toBe('Custom User');
    // After this test, server.resetHandlers() in setup.ts restores defaults
  });

  it('should throw on API errors', async () => {
    server.use(
      http.get('/api/user', () => {
        return HttpResponse.json(
          { error: 'Unauthorized' },
          { status: 401 },
        );
      }),
    );

    await expect(fetchCurrentUserName()).rejects.toThrow('Failed to fetch user: 401');
  });
});
