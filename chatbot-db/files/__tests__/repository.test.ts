/**
 * Tests for the ChatbotRepositorySQL class.
 *
 * Uses a mock QueryFn that records all SQL calls and returns preset data,
 * validating query construction, parameter passing, and row mapping.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ChatbotRepositorySQL,
  type QueryFn,
  type Conversation,
  type Message,
  type ConversationStats,
} from '../repository';

// ---------------------------------------------------------------------------
// Mock QueryFn factory
// ---------------------------------------------------------------------------

interface RecordedCall {
  sql: string;
  params: unknown[] | undefined;
}

function createMockQueryFn(
  responses: Array<Array<Record<string, unknown>>>,
): { queryFn: QueryFn; calls: RecordedCall[] } {
  const calls: RecordedCall[] = [];
  let callIndex = 0;

  const queryFn: QueryFn = async (
    sql: string,
    params?: unknown[],
  ): Promise<Array<Record<string, unknown>>> => {
    calls.push({ sql, params });
    const response = responses[callIndex] ?? [];
    callIndex++;
    return response;
  };

  return { queryFn, calls };
}

// ---------------------------------------------------------------------------
// Test data factories
// ---------------------------------------------------------------------------

function fakeConversationRow(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    id: 'conv-001',
    session_id: 'sess-001',
    user_id: null,
    title: null,
    status: 'active',
    metadata: '{}',
    created_at: '2026-03-28T10:00:00.000Z',
    updated_at: '2026-03-28T10:00:00.000Z',
    ...overrides,
  };
}

function fakeMessageRow(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    id: 'msg-001',
    conversation_id: 'conv-001',
    role: 'user',
    content: 'Hello',
    tokens_used: null,
    model: null,
    sequence: 1,
    metadata: '{}',
    created_at: '2026-03-28T10:00:01.000Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ChatbotRepositorySQL', () => {
  describe('createConversation', () => {
    it('calls INSERT with correct params, returns mapped conversation', async () => {
      const { queryFn, calls } = createMockQueryFn([
        [fakeConversationRow({ session_id: 'sess-100', user_id: 'user-42' })],
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      const result = await repo.createConversation('sess-100', 'user-42');

      expect(calls).toHaveLength(1);
      expect(calls[0].sql).toContain('INSERT INTO chatbot_conversations');
      expect(calls[0].params).toEqual(['sess-100', 'user-42']);

      // Verify mapped result
      expect(result.sessionId).toBe('sess-100');
      expect(result.userId).toBe('user-42');
      expect(result.status).toBe('active');
      expect(result.metadata).toEqual({});
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('passes null for userId when not provided', async () => {
      const { queryFn, calls } = createMockQueryFn([
        [fakeConversationRow()],
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      await repo.createConversation('sess-200');

      expect(calls[0].params).toEqual(['sess-200', null]);
    });
  });

  describe('getConversation', () => {
    it('returns null when not found', async () => {
      const { queryFn } = createMockQueryFn([
        [], // No conversation rows
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      const result = await repo.getConversation('nonexistent');

      expect(result).toBeNull();
    });

    it('returns conversation with messages when found', async () => {
      const { queryFn, calls } = createMockQueryFn([
        [fakeConversationRow()], // Conversation query
        [
          fakeMessageRow({ sequence: 1, content: 'Hello', role: 'user' }),
          fakeMessageRow({ id: 'msg-002', sequence: 2, content: 'Hi!', role: 'assistant' }),
        ], // Messages query
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      const result = await repo.getConversation('conv-001');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('conv-001');
      expect(result!.messages).toHaveLength(2);
      expect(result!.messages[0].content).toBe('Hello');
      expect(result!.messages[0].role).toBe('user');
      expect(result!.messages[1].content).toBe('Hi!');
      expect(result!.messages[1].role).toBe('assistant');

      // Verify correct queries
      expect(calls).toHaveLength(2);
      expect(calls[0].sql).toContain('chatbot_conversations');
      expect(calls[0].params).toEqual(['conv-001']);
      expect(calls[1].sql).toContain('chatbot_messages');
    });
  });

  describe('getConversationBySession', () => {
    it('filters by session_id and active status', async () => {
      const { queryFn, calls } = createMockQueryFn([
        [fakeConversationRow({ session_id: 'sess-abc' })],
        [fakeMessageRow()],
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      const result = await repo.getConversationBySession('sess-abc');

      expect(result).not.toBeNull();
      expect(calls[0].sql).toContain("status = 'active'");
      expect(calls[0].sql).toContain('session_id = $1');
      expect(calls[0].params).toEqual(['sess-abc']);
    });

    it('returns null when no active conversation exists', async () => {
      const { queryFn } = createMockQueryFn([[]]);
      const repo = new ChatbotRepositorySQL(queryFn);

      const result = await repo.getConversationBySession('sess-none');

      expect(result).toBeNull();
    });
  });

  describe('addMessage', () => {
    it('auto-increments sequence', async () => {
      const { queryFn, calls } = createMockQueryFn([
        // Sequence query: MAX(sequence) = 3
        [{ next_seq: 4 }],
        // Insert result
        [fakeMessageRow({ sequence: 4, content: 'New message' })],
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      const result = await repo.addMessage('conv-001', 'user', 'New message');

      // First call gets next sequence
      expect(calls[0].sql).toContain('COALESCE(MAX(sequence), 0) + 1');
      expect(calls[0].params).toEqual(['conv-001']);

      // Second call inserts with correct sequence
      expect(calls[1].sql).toContain('INSERT INTO chatbot_messages');
      expect(calls[1].params![0]).toBe('conv-001');
      expect(calls[1].params![1]).toBe('user');
      expect(calls[1].params![2]).toBe('New message');
      expect(calls[1].params![3]).toBe(4); // next sequence

      expect(result.sequence).toBe(4);
      expect(result.content).toBe('New message');
    });

    it('passes optional fields (tokensUsed, model, metadata)', async () => {
      const { queryFn, calls } = createMockQueryFn([
        [{ next_seq: 1 }],
        [fakeMessageRow({ tokens_used: 150, model: 'claude-sonnet-4-6' })],
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      await repo.addMessage('conv-001', 'assistant', 'Response', {
        tokensUsed: 150,
        model: 'claude-sonnet-4-6',
        metadata: { source: 'test' },
      });

      const insertParams = calls[1].params!;
      expect(insertParams[4]).toBe(150); // tokensUsed
      expect(insertParams[5]).toBe('claude-sonnet-4-6'); // model
      expect(insertParams[6]).toBe('{"source":"test"}'); // metadata JSON
    });
  });

  describe('getMessages', () => {
    it('applies limit and offset', async () => {
      const { queryFn, calls } = createMockQueryFn([
        [
          fakeMessageRow({ sequence: 3 }),
          fakeMessageRow({ id: 'msg-002', sequence: 4 }),
        ],
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      const result = await repo.getMessages('conv-001', 10, 2);

      expect(calls[0].sql).toContain('LIMIT $2');
      expect(calls[0].sql).toContain('OFFSET $3');
      expect(calls[0].params).toEqual(['conv-001', 10, 2]);
      expect(result).toHaveLength(2);
    });

    it('omits LIMIT/OFFSET when not provided', async () => {
      const { queryFn, calls } = createMockQueryFn([
        [fakeMessageRow()],
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      await repo.getMessages('conv-001');

      expect(calls[0].sql).not.toContain('LIMIT');
      expect(calls[0].sql).not.toContain('OFFSET');
      expect(calls[0].params).toEqual(['conv-001']);
    });
  });

  describe('archiveConversation', () => {
    it('sets status to archived', async () => {
      const { queryFn, calls } = createMockQueryFn([
        [fakeConversationRow({ status: 'archived' })],
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      const result = await repo.archiveConversation('conv-001');

      expect(calls[0].sql).toContain("status = 'archived'");
      expect(calls[0].params).toEqual(['conv-001']);
      expect(result.status).toBe('archived');
    });

    it('throws when conversation not found', async () => {
      const { queryFn } = createMockQueryFn([[]]);
      const repo = new ChatbotRepositorySQL(queryFn);

      await expect(repo.archiveConversation('nonexistent')).rejects.toThrow(
        'Conversation not found',
      );
    });
  });

  describe('purgeOldConversations', () => {
    it('returns delete count', async () => {
      const { queryFn, calls } = createMockQueryFn([
        [{ count: 5 }],
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      const count = await repo.purgeOldConversations(90);

      expect(count).toBe(5);
      expect(calls[0].sql).toContain('DELETE FROM chatbot_conversations');
      expect(calls[0].params).toEqual([90]);
    });

    it('returns 0 when nothing to delete', async () => {
      const { queryFn } = createMockQueryFn([
        [{ count: 0 }],
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      const count = await repo.purgeOldConversations(30);

      expect(count).toBe(0);
    });
  });

  describe('getConversationStats', () => {
    it('calculates avg and escalation rate correctly', async () => {
      const { queryFn } = createMockQueryFn([
        // Stats query
        [{ total_conversations: 10, total_messages: 50, avg_messages: 5.0 }],
        // Status grouping query
        [
          { status: 'active', count: 6 },
          { status: 'archived', count: 2 },
          { status: 'closed', count: 2 },
        ],
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      const stats = await repo.getConversationStats();

      expect(stats.totalConversations).toBe(10);
      expect(stats.totalMessages).toBe(50);
      expect(stats.avgMessagesPerConversation).toBe(5.0);
      // escalationRate = closed / total = 2 / 10 = 0.2
      expect(stats.escalationRate).toBe(0.2);
      expect(stats.conversationsByStatus).toEqual({
        active: 6,
        archived: 2,
        closed: 2,
      });
    });

    it('returns zeros when no conversations exist', async () => {
      const { queryFn } = createMockQueryFn([
        [{ total_conversations: 0, total_messages: 0, avg_messages: 0 }],
        [], // No status groups
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      const stats = await repo.getConversationStats();

      expect(stats.totalConversations).toBe(0);
      expect(stats.totalMessages).toBe(0);
      expect(stats.avgMessagesPerConversation).toBe(0);
      expect(stats.escalationRate).toBe(0);
      expect(stats.conversationsByStatus).toEqual({
        active: 0,
        archived: 0,
        closed: 0,
      });
    });

    it('passes date filter when since is provided', async () => {
      const since = new Date('2026-01-01T00:00:00.000Z');
      const { queryFn, calls } = createMockQueryFn([
        [{ total_conversations: 3, total_messages: 15, avg_messages: 5.0 }],
        [{ status: 'active', count: 3 }],
      ]);
      const repo = new ChatbotRepositorySQL(queryFn);

      await repo.getConversationStats(since);

      // Both queries should receive the date parameter
      expect(calls[0].params).toEqual([since.toISOString()]);
      expect(calls[1].params).toEqual([since.toISOString()]);
      expect(calls[0].sql).toContain('created_at >= $1');
    });
  });
});
