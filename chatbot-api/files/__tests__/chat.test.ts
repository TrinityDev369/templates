/**
 * Tests for the chat route handler.
 *
 * Mocks the Anthropic streamChat generator, Express req/res, and the
 * session store to validate request validation, SSE output, and
 * escalation detection.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import type { SSEEvent, ChatbotConfig } from '../lib/types';

// ---------------------------------------------------------------------------
// Mock: ../lib/anthropic
// ---------------------------------------------------------------------------

const mockStreamChat = vi.fn();

vi.mock('../lib/anthropic', () => ({
  streamChat: (...args: unknown[]) => mockStreamChat(...args),
}));

// ---------------------------------------------------------------------------
// Mock: ../lib/session
// ---------------------------------------------------------------------------

vi.mock('../lib/session', () => ({
  getOrCreateSession: vi.fn(() => ({
    id: 'test-session',
    messages: [],
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
  })),
  addMessage: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock: global fetch (for escalation webhook)
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// ---------------------------------------------------------------------------
// Import under test
// ---------------------------------------------------------------------------

import { createChatHandler } from '../chat';

// ---------------------------------------------------------------------------
// Test config
// ---------------------------------------------------------------------------

const TEST_CONFIG: ChatbotConfig = {
  name: 'TestBot',
  personality: 'A helpful test assistant.',
  tone: 'friendly and direct',
  antiIntents: ['never give legal advice'],
  disclaimer: 'This is a test bot.',
  escalationWebhook: 'https://hooks.example.com/escalate',
};

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

interface MockExpressRes {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  written: string[];
  ended: boolean;
  headersFlushed: boolean;
  status: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  write: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
  flushHeaders: ReturnType<typeof vi.fn>;
}

function createMockRes(): MockExpressRes {
  const res: MockExpressRes = {
    statusCode: 200,
    headers: {},
    body: undefined,
    written: [],
    ended: false,
    headersFlushed: false,
    status: vi.fn(),
    setHeader: vi.fn(),
    json: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
    flushHeaders: vi.fn(),
  };

  res.status.mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.setHeader.mockImplementation((key: string, value: string) => {
    res.headers[key] = value;
    return res;
  });
  res.json.mockImplementation((body: unknown) => {
    res.body = body;
  });
  res.write.mockImplementation((chunk: string) => {
    res.written.push(chunk);
  });
  res.end.mockImplementation(() => {
    res.ended = true;
  });
  res.flushHeaders.mockImplementation(() => {
    res.headersFlushed = true;
  });

  return res;
}

function createMockReq(body: unknown): Request {
  return { body } as Request;
}

// ---------------------------------------------------------------------------
// Async generator helper
// ---------------------------------------------------------------------------

async function* fakeStream(events: SSEEvent[]): AsyncGenerator<SSEEvent> {
  for (const event of events) {
    yield event;
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createChatHandler', () => {
  let handler: (req: Request, res: Response) => Promise<void>;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = createChatHandler(TEST_CONFIG);
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
  });

  it('returns 400 for missing sessionId', async () => {
    const req = createMockReq({ messages: [{ role: 'user', content: 'hi' }] });
    const res = createMockRes();

    await handler(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('sessionId') }),
    );
  });

  it('returns 400 for empty messages array', async () => {
    const req = createMockReq({ sessionId: 'sess-1', messages: [] });
    const res = createMockRes();

    await handler(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('messages') }),
    );
  });

  it('returns 400 when last message is not role user', async () => {
    const req = createMockReq({
      sessionId: 'sess-1',
      messages: [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi there' },
      ],
    });
    const res = createMockRes();

    await handler(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('last message') }),
    );
  });

  it('validates message structure (role, content)', async () => {
    const req = createMockReq({
      sessionId: 'sess-1',
      messages: [{ role: 'invalid', content: 'test' }],
    });
    const res = createMockRes();

    await handler(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('role') }),
    );
  });

  it('sets correct SSE headers (Content-Type, Cache-Control, Connection)', async () => {
    mockStreamChat.mockReturnValueOnce(
      fakeStream([{ type: 'start' }, { type: 'done' }]),
    );

    const req = createMockReq({
      sessionId: 'sess-1',
      messages: [{ role: 'user', content: 'hello' }],
    });
    const res = createMockRes();

    await handler(req, res as unknown as Response);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
    expect(res.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
    expect(res.flushHeaders).toHaveBeenCalled();
  });

  it('detects escalation phrases and sends escalation event', async () => {
    const req = createMockReq({
      sessionId: 'sess-1',
      messages: [{ role: 'user', content: 'I want to talk to a human' }],
    });
    const res = createMockRes();

    await handler(req, res as unknown as Response);

    // Should have written escalation and done events
    const writtenData = res.written.map((chunk: string) => {
      const match = chunk.match(/^data: (.+)\n\n$/);
      return match ? JSON.parse(match[1]) as SSEEvent : null;
    }).filter(Boolean) as SSEEvent[];

    const escalationEvent = writtenData.find((e) => e.type === 'escalation');
    expect(escalationEvent).toBeDefined();
    expect(escalationEvent!.escalation?.reason).toContain('human');

    const doneEvent = writtenData.find((e) => e.type === 'done');
    expect(doneEvent).toBeDefined();

    // streamChat should NOT have been called (escalation short-circuits)
    expect(mockStreamChat).not.toHaveBeenCalled();
  });

  it('fires escalation webhook when configured', async () => {
    const req = createMockReq({
      sessionId: 'sess-1',
      messages: [{ role: 'user', content: 'get me a human' }],
    });
    const res = createMockRes();

    await handler(req, res as unknown as Response);

    // Allow the background webhook to fire
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockFetch).toHaveBeenCalledWith(
      'https://hooks.example.com/escalate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"event":"escalation"'),
      }),
    );
  });

  it('streams response events via SSE format (data: {...}\\n\\n)', async () => {
    const streamEvents: SSEEvent[] = [
      { type: 'start' },
      { type: 'delta', content: 'Hello ' },
      { type: 'delta', content: 'world!' },
      { type: 'done' },
    ];
    mockStreamChat.mockReturnValueOnce(fakeStream(streamEvents));

    const req = createMockReq({
      sessionId: 'sess-1',
      messages: [{ role: 'user', content: 'hi' }],
    });
    const res = createMockRes();

    await handler(req, res as unknown as Response);

    // Verify each written chunk is in SSE format
    for (const chunk of res.written) {
      expect(chunk).toMatch(/^data: .+\n\n$/);
    }

    // Parse the written events
    const writtenEvents = res.written.map((chunk: string) => {
      const json = chunk.replace(/^data: /, '').replace(/\n\n$/, '');
      return JSON.parse(json) as SSEEvent;
    });

    expect(writtenEvents[0].type).toBe('start');
    expect(writtenEvents[1]).toEqual({ type: 'delta', content: 'Hello ' });
    expect(writtenEvents[2]).toEqual({ type: 'delta', content: 'world!' });
    expect(writtenEvents[3].type).toBe('done');

    expect(res.ended).toBe(true);
  });
});
