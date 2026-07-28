/**
 * @trinity369/use chatbot-api — Main chat route handler
 *
 * POST /api/chat — Streaming chat endpoint
 *
 * Accepts a ChatRequest body, builds the system prompt from chatbot config,
 * streams the Anthropic response as SSE events, persists messages to the
 * session store, and handles escalation triggers.
 */

import type { Request, Response } from 'express';
import { streamChat } from './lib/anthropic';
import { getOrCreateSession, addMessage } from './lib/session';
import type { ChatRequest, ChatbotConfig, SSEEvent, ChatMessage } from './lib/types';

// ---------------------------------------------------------------------------
// Escalation detection
// ---------------------------------------------------------------------------

const ESCALATION_PHRASES = [
  'talk to a human',
  'talk to someone',
  'talk to a person',
  'speak to a human',
  'speak to someone',
  'speak to a person',
  'speak with a human',
  'speak with someone',
  'get me a human',
  'human agent',
  'real person',
  'connect me to a human',
  'transfer to agent',
  'i want a human',
  'i need a human',
];

function detectEscalation(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return ESCALATION_PHRASES.some((phrase) => lower.includes(phrase));
}

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

function buildSystemPrompt(config: ChatbotConfig): string {
  const sections: string[] = [];

  // Identity
  sections.push(
    `You are ${config.name}. ${config.personality}`,
  );

  // Tone
  sections.push(`Tone: ${config.tone}`);

  // Anti-intents (explicit constraints)
  if (config.antiIntents.length > 0) {
    sections.push(
      'STRICT CONSTRAINTS — You must NEVER violate these rules:\n' +
        config.antiIntents.map((ai, i) => `${i + 1}. ${ai}`).join('\n'),
    );
  }

  // Disclaimer
  if (config.disclaimer) {
    sections.push(
      `DISCLAIMER (include this when relevant): ${config.disclaimer}`,
    );
  }

  return sections.join('\n\n');
}

// ---------------------------------------------------------------------------
// Escalation webhook
// ---------------------------------------------------------------------------

async function fireEscalationWebhook(
  webhookUrl: string,
  sessionId: string,
  messages: ChatMessage[],
  triggerMessage: string,
): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'escalation',
        sessionId,
        triggerMessage,
        transcript: messages,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error(
        `[chatbot-api] Escalation webhook returned ${response.status}: ${response.statusText}`,
      );
    }
  } catch (err) {
    console.error('[chatbot-api] Escalation webhook failed:', err);
  }
}

// ---------------------------------------------------------------------------
// SSE helpers
// ---------------------------------------------------------------------------

function writeSSE(res: Response, event: SSEEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function initSSE(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
}

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }

  const req = body as Record<string, unknown>;

  if (!req.sessionId || typeof req.sessionId !== 'string') {
    return { valid: false, error: 'sessionId is required and must be a string.' };
  }

  if (!Array.isArray(req.messages) || req.messages.length === 0) {
    return { valid: false, error: 'messages is required and must be a non-empty array.' };
  }

  for (let i = 0; i < req.messages.length; i++) {
    const msg = req.messages[i] as Record<string, unknown>;
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: `messages[${i}] must be an object.` };
    }
    if (msg.role !== 'user' && msg.role !== 'assistant') {
      return { valid: false, error: `messages[${i}].role must be 'user' or 'assistant'.` };
    }
    if (typeof msg.content !== 'string' || msg.content.trim().length === 0) {
      return { valid: false, error: `messages[${i}].content must be a non-empty string.` };
    }
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

/**
 * Create the POST /api/chat route handler.
 *
 * @param config - Chatbot configuration (loaded from chatbot.config.ts)
 */
export function createChatHandler(config: ChatbotConfig): (req: Request, res: Response) => Promise<void> {
  const systemPrompt = buildSystemPrompt(config);

  return async function chatHandler(req: Request, res: Response): Promise<void> {
    // --- Validate request ---
    const validation = validateRequest(req.body);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const { sessionId, messages } = req.body as ChatRequest;

    // --- Session management ---
    const session = getOrCreateSession(sessionId);

    // Get the latest user message (last message in the array should be from user)
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role !== 'user') {
      res.status(400).json({ error: 'The last message must have role "user".' });
      return;
    }

    // Store the user message
    addMessage(sessionId, 'user', latestMessage.content);

    // --- Escalation detection ---
    if (detectEscalation(latestMessage.content)) {
      initSSE(res);

      // Fire the webhook in the background if configured
      if (config.escalationWebhook) {
        fireEscalationWebhook(
          config.escalationWebhook,
          sessionId,
          session.messages,
          latestMessage.content,
        );
      }

      writeSSE(res, {
        type: 'escalation',
        escalation: {
          reason: 'User requested to speak with a human.',
        },
      });

      // Also store an assistant acknowledgment
      const ackMessage =
        "I've connected you with the team. They'll have our full conversation for context.";
      addMessage(sessionId, 'assistant', ackMessage);

      writeSSE(res, { type: 'done' });
      res.end();
      return;
    }

    // --- Stream the response ---
    initSSE(res);
    let fullResponse = '';

    try {
      for await (const event of streamChat(systemPrompt, messages, config)) {
        writeSSE(res, event);

        // Accumulate the response text for session storage
        if (event.type === 'delta' && event.content) {
          fullResponse += event.content;
        }
      }

      // Store the assistant's complete response
      if (fullResponse.length > 0) {
        addMessage(sessionId, 'assistant', fullResponse);
      }
    } catch (err) {
      console.error('[chatbot-api] Unhandled error in chat handler:', err);
      writeSSE(res, {
        type: 'error',
        error: 'An unexpected error occurred. Please try again.',
      });
    }

    res.end();
  };
}
