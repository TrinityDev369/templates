/**
 * Tests for the SSE streaming client.
 *
 * Mocks the global fetch with a fake ReadableStream that emits SSE lines,
 * validating event parsing, error handling, and cancellation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SSEEvent, ChatMessage } from '../lib/types';

// ---------------------------------------------------------------------------
// Helpers: Create a fake SSE ReadableStream from lines
// ---------------------------------------------------------------------------

function createSSEStream(lines: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const payload = lines.join('\n') + '\n';

  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(payload));
      controller.close();
    },
  });
}

function createFakeResponse(
  lines: string[],
  status = 200,
  statusText = 'OK',
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers({ 'Content-Type': 'text/event-stream' }),
    body: createSSEStream(lines),
    text: async () => `Error ${status}: ${statusText}`,
    json: async () => ({}),
    clone: () => createFakeResponse(lines, status, statusText),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    bytes: async () => new Uint8Array(),
  } as Response;
}

function createFakeResponseNoBody(status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    headers: new Headers(),
    body: null,
    text: async () => '',
    json: async () => ({}),
    clone: () => createFakeResponseNoBody(status),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    bytes: async () => new Uint8Array(),
  } as Response;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

// ---------------------------------------------------------------------------
// Import under test
// ---------------------------------------------------------------------------

import { sendMessage, type SSEEventHandler } from '../lib/stream';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const TEST_API = 'https://api.example.com/chat';
const TEST_SESSION = 'session-001';
const TEST_MESSAGES: ChatMessage[] = [
  { role: 'user', content: 'Hello' },
];

function collectEvents(): { events: SSEEvent[]; handler: SSEEventHandler } {
  const events: SSEEvent[] = [];
  const handler: SSEEventHandler = (event) => events.push(event);
  return { events, handler };
}

/** Wait for microtask queue to flush (stream processing is async). */
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 50));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('stream - sendMessage', () => {
  it('parses SSE data: {...} lines correctly', async () => {
    const lines = [
      'data: {"type":"start"}',
      'data: {"type":"delta","content":"Hi"}',
      'data: {"type":"done"}',
    ];
    fetchMock.mockResolvedValueOnce(createFakeResponse(lines));

    const { events, handler } = collectEvents();
    sendMessage(TEST_API, TEST_MESSAGES, TEST_SESSION, handler);
    await flush();

    expect(events).toEqual([
      { type: 'start' },
      { type: 'delta', content: 'Hi' },
      { type: 'done' },
    ]);
  });

  it('handles start/delta/done event sequence', async () => {
    const lines = [
      'data: {"type":"start"}',
      'data: {"type":"delta","content":"Hello "}',
      'data: {"type":"delta","content":"world"}',
      'data: {"type":"done"}',
    ];
    fetchMock.mockResolvedValueOnce(createFakeResponse(lines));

    const { events, handler } = collectEvents();
    sendMessage(TEST_API, TEST_MESSAGES, TEST_SESSION, handler);
    await flush();

    expect(events[0].type).toBe('start');
    expect(events[1]).toEqual({ type: 'delta', content: 'Hello ' });
    expect(events[2]).toEqual({ type: 'delta', content: 'world' });
    expect(events[3].type).toBe('done');
    expect(events).toHaveLength(4);
  });

  it('handles error events', async () => {
    const lines = [
      'data: {"type":"error","error":"Rate limit exceeded"}',
    ];
    fetchMock.mockResolvedValueOnce(createFakeResponse(lines));

    const { events, handler } = collectEvents();
    sendMessage(TEST_API, TEST_MESSAGES, TEST_SESSION, handler);
    await flush();

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'error', error: 'Rate limit exceeded' });
  });

  it('handles escalation events', async () => {
    const lines = [
      'data: {"type":"escalation","escalation":{"reason":"User requested human"}}',
    ];
    fetchMock.mockResolvedValueOnce(createFakeResponse(lines));

    const { events, handler } = collectEvents();
    sendMessage(TEST_API, TEST_MESSAGES, TEST_SESSION, handler);
    await flush();

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('escalation');
    expect(events[0].escalation).toEqual({ reason: 'User requested human' });
  });

  it('ignores empty lines and SSE comments (:)', async () => {
    const lines = [
      ': this is a comment',
      '',
      'data: {"type":"start"}',
      '',
      ': keep-alive',
      'data: {"type":"done"}',
    ];
    fetchMock.mockResolvedValueOnce(createFakeResponse(lines));

    const { events, handler } = collectEvents();
    sendMessage(TEST_API, TEST_MESSAGES, TEST_SESSION, handler);
    await flush();

    expect(events).toEqual([
      { type: 'start' },
      { type: 'done' },
    ]);
  });

  it('handles data: [DONE] termination', async () => {
    const lines = [
      'data: {"type":"start"}',
      'data: {"type":"delta","content":"hi"}',
      'data: [DONE]',
    ];
    fetchMock.mockResolvedValueOnce(createFakeResponse(lines));

    const { events, handler } = collectEvents();
    sendMessage(TEST_API, TEST_MESSAGES, TEST_SESSION, handler);
    await flush();

    expect(events).toEqual([
      { type: 'start' },
      { type: 'delta', content: 'hi' },
      { type: 'done' },
    ]);
  });

  it('calls onEvent for each parsed event', async () => {
    const lines = [
      'data: {"type":"start"}',
      'data: {"type":"delta","content":"a"}',
      'data: {"type":"delta","content":"b"}',
      'data: {"type":"done"}',
    ];
    fetchMock.mockResolvedValueOnce(createFakeResponse(lines));

    const handler = vi.fn();
    sendMessage(TEST_API, TEST_MESSAGES, TEST_SESSION, handler);
    await flush();

    expect(handler).toHaveBeenCalledTimes(4);
    expect(handler).toHaveBeenNthCalledWith(1, { type: 'start' });
    expect(handler).toHaveBeenNthCalledWith(2, { type: 'delta', content: 'a' });
    expect(handler).toHaveBeenNthCalledWith(3, { type: 'delta', content: 'b' });
    expect(handler).toHaveBeenNthCalledWith(4, { type: 'done' });
  });

  it('returns cancel function that aborts the request', async () => {
    // Simulate a long-running stream that never closes
    const neverEndingStream = new ReadableStream<Uint8Array>({
      start() {
        // Never closes
      },
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: neverEndingStream,
      text: async () => '',
    } as unknown as Response);

    const { events, handler } = collectEvents();
    const cancel = sendMessage(TEST_API, TEST_MESSAGES, TEST_SESSION, handler);

    // Cancel should be a function
    expect(typeof cancel).toBe('function');

    // Calling cancel should not throw
    cancel();

    await flush();

    // After abort, no error events should have been emitted
    // (AbortError is silently swallowed)
    const errorEvents = events.filter((e) => e.type === 'error');
    expect(errorEvents).toHaveLength(0);
  });

  it('handles HTTP error responses (non-200)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      body: null,
      text: async () => 'Server exploded',
    } as unknown as Response);

    const { events, handler } = collectEvents();
    sendMessage(TEST_API, TEST_MESSAGES, TEST_SESSION, handler);
    await flush();

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('error');
    expect(events[0].error).toContain('HTTP 500');
    expect(events[0].error).toContain('Server exploded');
  });

  it('handles missing response body', async () => {
    fetchMock.mockResolvedValueOnce(createFakeResponseNoBody(200));

    const { events, handler } = collectEvents();
    sendMessage(TEST_API, TEST_MESSAGES, TEST_SESSION, handler);
    await flush();

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('error');
    expect(events[0].error).toContain('empty');
  });
});
