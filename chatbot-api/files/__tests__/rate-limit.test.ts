/**
 * Tests for the rate-limit middleware.
 *
 * Mocks Express req/res/next to validate sliding-window rate limiting,
 * IP extraction, and the Retry-After header.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { rateLimit } from '../middleware/rate-limit';

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockResponse;
  setHeader: (key: string, value: string) => MockResponse;
  json: (body: unknown) => void;
}

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    ip: '127.0.0.1',
    headers: {},
    ...overrides,
  } as Request;
}

function createMockRes(): MockResponse {
  const res: MockResponse = {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    setHeader(key: string, value: string) {
      res.headers[key] = value;
      return res;
    },
    json(body: unknown) {
      res.body = body;
    },
  };
  return res;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests under the limit', () => {
    const middleware = rateLimit({ maxRequests: 3, windowMs: 60_000 });
    const req = createMockReq();
    const next = vi.fn();

    // Send 3 requests (at the limit)
    for (let i = 0; i < 3; i++) {
      const res = createMockRes();
      middleware(req, res as unknown as Response, next);
    }

    expect(next).toHaveBeenCalledTimes(3);
  });

  it('blocks requests at the limit with 429 status', () => {
    const middleware = rateLimit({ maxRequests: 2, windowMs: 60_000 });
    const req = createMockReq();
    const next = vi.fn();

    // First 2 should pass
    for (let i = 0; i < 2; i++) {
      const res = createMockRes();
      middleware(req, res as unknown as Response, next);
    }
    expect(next).toHaveBeenCalledTimes(2);

    // Third should be blocked
    const blockedRes = createMockRes();
    middleware(req, blockedRes as unknown as Response, next);

    expect(next).toHaveBeenCalledTimes(2); // Not called again
    expect(blockedRes.statusCode).toBe(429);
    expect(blockedRes.body).toEqual(
      expect.objectContaining({ error: expect.stringContaining('Too many requests') }),
    );
  });

  it('returns Retry-After header when blocked', () => {
    const middleware = rateLimit({ maxRequests: 1, windowMs: 60_000 });
    const req = createMockReq();
    const next = vi.fn();

    // First request passes
    const res1 = createMockRes();
    middleware(req, res1 as unknown as Response, next);

    // Second request is blocked
    const res2 = createMockRes();
    middleware(req, res2 as unknown as Response, next);

    expect(res2.statusCode).toBe(429);
    expect(res2.headers['Retry-After']).toBeDefined();

    const retryAfter = parseInt(res2.headers['Retry-After'], 10);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });

  it('respects configurable maxRequests and windowMs', () => {
    const middleware = rateLimit({ maxRequests: 5, windowMs: 10_000 });
    const req = createMockReq();
    const next = vi.fn();

    // 5 requests should pass
    for (let i = 0; i < 5; i++) {
      const res = createMockRes();
      middleware(req, res as unknown as Response, next);
    }
    expect(next).toHaveBeenCalledTimes(5);

    // 6th should be blocked
    const blockedRes = createMockRes();
    middleware(req, blockedRes as unknown as Response, next);
    expect(blockedRes.statusCode).toBe(429);

    // Advance time past the window
    vi.advanceTimersByTime(10_001);

    // Now requests should be allowed again
    const res6 = createMockRes();
    middleware(req, res6 as unknown as Response, next);
    expect(next).toHaveBeenCalledTimes(6);
  });

  it('different IPs have separate counters', () => {
    const middleware = rateLimit({ maxRequests: 1, windowMs: 60_000 });
    const next = vi.fn();

    const req1 = createMockReq({ ip: '10.0.0.1' });
    const req2 = createMockReq({ ip: '10.0.0.2' });

    // First IP: first request passes
    const res1 = createMockRes();
    middleware(req1, res1 as unknown as Response, next);
    expect(next).toHaveBeenCalledTimes(1);

    // First IP: second request blocked
    const res1b = createMockRes();
    middleware(req1, res1b as unknown as Response, next);
    expect(res1b.statusCode).toBe(429);

    // Second IP: first request still passes (separate counter)
    const res2 = createMockRes();
    middleware(req2, res2 as unknown as Response, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('reads IP from x-forwarded-for header', () => {
    const middleware = rateLimit({ maxRequests: 1, windowMs: 60_000 });
    const next = vi.fn();

    const req = createMockReq({
      ip: '127.0.0.1',
      headers: { 'x-forwarded-for': '203.0.113.50, 70.41.3.18' } as Record<string, string>,
    });

    // First request passes
    const res1 = createMockRes();
    middleware(req, res1 as unknown as Response, next);
    expect(next).toHaveBeenCalledTimes(1);

    // Second request from same forwarded IP should be blocked
    const res2 = createMockRes();
    middleware(req, res2 as unknown as Response, next);
    expect(res2.statusCode).toBe(429);

    // Request from a different forwarded IP should pass
    const req2 = createMockReq({
      ip: '127.0.0.1',
      headers: { 'x-forwarded-for': '198.51.100.10' } as Record<string, string>,
    });
    const res3 = createMockRes();
    middleware(req2, res3 as unknown as Response, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('falls back to req.ip when no forwarded header', () => {
    const middleware = rateLimit({ maxRequests: 1, windowMs: 60_000 });
    const next = vi.fn();

    const req = createMockReq({ ip: '192.168.1.1', headers: {} });

    // First request passes
    const res1 = createMockRes();
    middleware(req, res1 as unknown as Response, next);
    expect(next).toHaveBeenCalledTimes(1);

    // Second request from same IP should be blocked
    const res2 = createMockRes();
    middleware(req, res2 as unknown as Response, next);
    expect(res2.statusCode).toBe(429);
  });

  it('expired entries are cleaned up', () => {
    const windowMs = 5_000;
    const middleware = rateLimit({ maxRequests: 2, windowMs });
    const req = createMockReq({ ip: '10.0.0.1' });
    const next = vi.fn();

    // Use up the limit
    for (let i = 0; i < 2; i++) {
      const res = createMockRes();
      middleware(req, res as unknown as Response, next);
    }
    expect(next).toHaveBeenCalledTimes(2);

    // Blocked
    const blockedRes = createMockRes();
    middleware(req, blockedRes as unknown as Response, next);
    expect(blockedRes.statusCode).toBe(429);

    // Advance past the window (triggers cleanup + allows new requests)
    vi.advanceTimersByTime(windowMs + 1);

    // Should be allowed again — old timestamps expired
    const res = createMockRes();
    middleware(req, res as unknown as Response, next);
    expect(next).toHaveBeenCalledTimes(3);
  });
});
