/**
 * Tests for the in-memory session store.
 *
 * Validates session creation, message persistence, history isolation,
 * and the clearAll utility.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getOrCreateSession,
  addMessage,
  getHistory,
  clearAll,
  stopCleanup,
} from '../lib/session';

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  clearAll();
});

// Stop the cleanup interval so it doesn't leak across tests
afterAll(() => {
  stopCleanup();
});

// afterAll needs to be imported
import { afterAll } from 'vitest';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('session store', () => {
  it('creates new session on first call', () => {
    const session = getOrCreateSession('sess-001');

    expect(session.id).toBe('sess-001');
    expect(session.messages).toEqual([]);
    expect(typeof session.createdAt).toBe('number');
    expect(typeof session.lastActivityAt).toBe('number');
    expect(session.createdAt).toBeGreaterThan(0);
  });

  it('returns same session on subsequent calls with same ID', () => {
    const first = getOrCreateSession('sess-002');
    const second = getOrCreateSession('sess-002');

    expect(first).toBe(second); // Same reference
    expect(first.id).toBe(second.id);
    expect(first.createdAt).toBe(second.createdAt);
  });

  it('addMessage appends to history', () => {
    getOrCreateSession('sess-003');

    addMessage('sess-003', 'user', 'Hello');
    addMessage('sess-003', 'assistant', 'Hi there!');
    addMessage('sess-003', 'user', 'How are you?');

    const history = getHistory('sess-003');
    expect(history).toHaveLength(3);
    expect(history[0]).toEqual({ role: 'user', content: 'Hello' });
    expect(history[1]).toEqual({ role: 'assistant', content: 'Hi there!' });
    expect(history[2]).toEqual({ role: 'user', content: 'How are you?' });
  });

  it('getHistory returns copy (not reference)', () => {
    getOrCreateSession('sess-004');
    addMessage('sess-004', 'user', 'Test');

    const history1 = getHistory('sess-004');
    const history2 = getHistory('sess-004');

    // Same content
    expect(history1).toEqual(history2);

    // Different array instances
    expect(history1).not.toBe(history2);

    // Mutating the returned array should not affect the store
    history1.push({ role: 'assistant', content: 'Injected' });
    const history3 = getHistory('sess-004');
    expect(history3).toHaveLength(1);
  });

  it('different sessionIds get different sessions', () => {
    const sessionA = getOrCreateSession('sess-A');
    const sessionB = getOrCreateSession('sess-B');

    expect(sessionA).not.toBe(sessionB);
    expect(sessionA.id).toBe('sess-A');
    expect(sessionB.id).toBe('sess-B');

    addMessage('sess-A', 'user', 'Message for A');
    addMessage('sess-B', 'user', 'Message for B');

    const historyA = getHistory('sess-A');
    const historyB = getHistory('sess-B');

    expect(historyA).toHaveLength(1);
    expect(historyA[0].content).toBe('Message for A');
    expect(historyB).toHaveLength(1);
    expect(historyB[0].content).toBe('Message for B');
  });

  it('clearAll removes all sessions', () => {
    getOrCreateSession('sess-X');
    getOrCreateSession('sess-Y');
    addMessage('sess-X', 'user', 'Hello');
    addMessage('sess-Y', 'user', 'World');

    clearAll();

    // After clearing, getHistory returns empty for both
    expect(getHistory('sess-X')).toEqual([]);
    expect(getHistory('sess-Y')).toEqual([]);

    // Creating session-X again should return a fresh session
    const fresh = getOrCreateSession('sess-X');
    expect(fresh.messages).toEqual([]);
  });
});
