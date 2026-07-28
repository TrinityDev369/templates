/**
 * Tests for the useSession hook.
 *
 * Mocks localStorage with a Map-based implementation and validates
 * session creation, retrieval, persistence, and error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';

// ---------------------------------------------------------------------------
// Mock localStorage
// ---------------------------------------------------------------------------

class MockStorage {
  private store = new Map<string, string>();
  private shouldThrow = false;

  getItem(key: string): string | null {
    if (this.shouldThrow) throw new Error('Storage unavailable');
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.shouldThrow) throw new Error('Storage unavailable');
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    const keys = [...this.store.keys()];
    return keys[index] ?? null;
  }

  /** Enable/disable throwing on all operations (simulates quota exceeded). */
  setThrowMode(shouldThrow: boolean): void {
    this.shouldThrow = shouldThrow;
  }

  /** Return all stored keys for inspection. */
  keys(): string[] {
    return [...this.store.keys()];
  }
}

const mockStorage = new MockStorage();

Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
});

// ---------------------------------------------------------------------------
// Mock crypto.randomUUID
// ---------------------------------------------------------------------------

let uuidCounter = 0;

vi.stubGlobal('crypto', {
  randomUUID: () => {
    uuidCounter++;
    return `00000000-0000-4000-a000-${String(uuidCounter).padStart(12, '0')}`;
  },
});

// ---------------------------------------------------------------------------
// Import the hook under test (after mocks are in place)
// ---------------------------------------------------------------------------

import { useSession } from '../hooks/useSession';
import type { Session } from '../lib/types';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useSession', () => {
  beforeEach(() => {
    mockStorage.clear();
    mockStorage.setThrowMode(false);
    uuidCounter = 0;
  });

  it('creates a new session with UUID when none exists in localStorage', () => {
    const { result } = renderHook(() => useSession('https://api.example.com/chat'));

    let session: Session;
    act(() => {
      session = result.current.getOrCreateSession();
    });

    expect(session!.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(session!.conversationId).toBeNull();
    expect(typeof session!.createdAt).toBe('number');
    expect(session!.createdAt).toBeGreaterThan(0);
  });

  it('returns existing session from localStorage on subsequent calls', () => {
    const { result } = renderHook(() => useSession('https://api.example.com/chat'));

    let first: Session;
    let second: Session;
    act(() => {
      first = result.current.getOrCreateSession();
    });
    act(() => {
      second = result.current.getOrCreateSession();
    });

    expect(first!.sessionId).toBe(second!.sessionId);
    expect(first!.createdAt).toBe(second!.createdAt);
  });

  it('updates conversationId and persists to localStorage', () => {
    const { result } = renderHook(() => useSession('https://api.example.com/chat'));

    act(() => {
      result.current.getOrCreateSession();
    });

    act(() => {
      result.current.updateConversationId('conv-abc-123');
    });

    let updated: Session;
    act(() => {
      updated = result.current.getOrCreateSession();
    });

    expect(updated!.conversationId).toBe('conv-abc-123');

    // Verify it was persisted to localStorage
    const storedKeys = mockStorage.keys();
    expect(storedKeys.length).toBeGreaterThan(0);

    const raw = mockStorage.getItem(storedKeys[0]);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as Session;
    expect(parsed.conversationId).toBe('conv-abc-123');
  });

  it('handles localStorage failures gracefully (returns new session, does not throw)', () => {
    mockStorage.setThrowMode(true);

    const { result } = renderHook(() => useSession('https://api.example.com/chat'));

    let session: Session;
    act(() => {
      session = result.current.getOrCreateSession();
    });

    // Should still return a valid session even though storage is broken
    expect(session!.sessionId).toBeDefined();
    expect(typeof session!.sessionId).toBe('string');
    expect(session!.conversationId).toBeNull();
    expect(typeof session!.createdAt).toBe('number');
  });

  it('different apiUrl values produce different storage keys', () => {
    const { result: r1 } = renderHook(() => useSession('https://api.example.com/chat'));
    const { result: r2 } = renderHook(() => useSession('https://other.example.com/chat'));

    act(() => {
      r1.current.getOrCreateSession();
    });
    act(() => {
      r2.current.getOrCreateSession();
    });

    // Two different keys should have been written
    const keys = mockStorage.keys();
    expect(keys.length).toBe(2);
    expect(keys[0]).not.toBe(keys[1]);
  });

  it('session structure matches the Session type', () => {
    const { result } = renderHook(() => useSession('https://api.example.com/chat'));

    let session: Session;
    act(() => {
      session = result.current.getOrCreateSession();
    });

    // Verify all required fields exist with correct types
    expect(session!).toHaveProperty('sessionId');
    expect(session!).toHaveProperty('conversationId');
    expect(session!).toHaveProperty('createdAt');

    expect(typeof session!.sessionId).toBe('string');
    expect(session!.conversationId === null || typeof session!.conversationId === 'string').toBe(true);
    expect(typeof session!.createdAt).toBe('number');

    // No extra properties beyond what Session defines
    const keys = Object.keys(session!);
    expect(keys).toEqual(expect.arrayContaining(['sessionId', 'conversationId', 'createdAt']));
    expect(keys.length).toBe(3);
  });
});
