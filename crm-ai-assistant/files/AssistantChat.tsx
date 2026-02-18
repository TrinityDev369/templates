'use client';

/**
 * CRM AI Assistant — Chat Component
 *
 * A self-contained chat interface for interacting with the CRM AI assistant.
 * Renders message history, insight cards, suggested questions, and a
 * typing indicator. Communicates with the server via a configurable
 * POST endpoint.
 *
 * All styling is Tailwind CSS with dark mode support.
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type CSSProperties,
  type FC,
} from 'react';

import type {
  Deal,
  DealInsight,
  ChatMessage,
  AssistantConfig,
  CRMContext,
} from './types';
import { DEFAULT_ASSISTANT_CONFIG } from './types';
import { summarizePipeline } from './deal-analyzer';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AssistantChatProps {
  /** Deals to provide as CRM context to the assistant. */
  deals: Deal[];
  /** Partial config — merged with defaults. */
  config?: Partial<AssistantConfig>;
  /** Callback when the user clicks an action button on an insight. */
  onAction?: (action: string, dealId: string) => void;
  /** Additional CSS class names on the root element. */
  className?: string;
  /** Inline styles on the root element. */
  style?: CSSProperties;
  /** Placeholder text in the input field. */
  placeholder?: string;
  /** Color theme — defaults to "auto" which follows prefers-color-scheme. */
  theme?: 'light' | 'dark' | 'auto';
}

// ---------------------------------------------------------------------------
// Suggested Questions
// ---------------------------------------------------------------------------

const SUGGESTED_QUESTIONS = [
  'What deals are at risk?',
  'Forecast for this quarter',
  'Top opportunities',
] as const;

// ---------------------------------------------------------------------------
// Utility: Simple Markdown Renderer
// ---------------------------------------------------------------------------

/**
 * Very lightweight markdown-like formatting: **bold**, `code`, and
 * unordered lists (lines starting with "- "). Returns JSX elements.
 */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Unordered list item
    if (line.startsWith('- ')) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-sm">
          {formatInline(line.slice(2))}
        </li>,
      );
      continue;
    }

    // Blank line -> spacer
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="text-sm leading-relaxed">
        {formatInline(line)}
      </p>,
    );
  }

  return elements;
}

/** Inline formatting: **bold** and `code`. */
function formatInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Split on **bold** and `code` patterns
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-gray-200 px-1 py-0.5 text-xs dark:bg-gray-700"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }

    lastIndex = match.index + token.length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

// ---------------------------------------------------------------------------
// Insight Card
// ---------------------------------------------------------------------------

const INSIGHT_COLORS: Record<string, string> = {
  risk: 'border-red-400 bg-red-50 dark:bg-red-950/30 dark:border-red-700',
  opportunity: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700',
  action: 'border-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700',
  forecast: 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700',
};

const INSIGHT_ICONS: Record<string, string> = {
  risk: '\u26A0',       // warning sign
  opportunity: '\u2728', // sparkles (text form, not emoji)
  action: '\u2794',      // right arrow
  forecast: '\u2139',    // info
};

interface InsightCardProps {
  insight: DealInsight;
  onAction?: (action: string, dealId: string) => void;
}

const InsightCard: FC<InsightCardProps> = ({ insight, onAction }) => {
  const colorClass = INSIGHT_COLORS[insight.type] ?? INSIGHT_COLORS.action;
  const icon = INSIGHT_ICONS[insight.type] ?? '';

  return (
    <div
      className={`my-2 rounded-lg border-l-4 p-3 ${colorClass}`}
      role="complementary"
      aria-label={`${insight.type} insight: ${insight.title}`}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-sm" aria-hidden="true">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
          {insight.type}
        </span>
        <span className="ml-auto text-xs text-gray-400">
          {insight.confidence}% confidence
        </span>
      </div>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {insight.title}
      </p>
      <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
        {insight.description}
      </p>
      {insight.dealId && onAction && (
        <div className="mt-2 flex flex-wrap gap-2">
          {['View Deal', 'Follow Up', 'Update Stage'].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onAction(label, insight.dealId)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Typing Indicator
// ---------------------------------------------------------------------------

const TypingIndicator: FC = () => (
  <div className="flex items-center gap-1 px-4 py-2" aria-label="Assistant is typing">
    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" style={{ animationDelay: '0ms' }} />
    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" style={{ animationDelay: '150ms' }} />
    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" style={{ animationDelay: '300ms' }} />
  </div>
);

// ---------------------------------------------------------------------------
// Unique ID generator
// ---------------------------------------------------------------------------

let idCounter = 0;
function uid(): string {
  return `msg-${Date.now()}-${++idCounter}`;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

/**
 * AI-powered CRM assistant chat interface.
 *
 * Renders a scrollable message history, insight cards, suggested questions,
 * and a text input. Sends messages to the configured API endpoint with
 * CRM context and streams the assistant response.
 */
export const AssistantChat: FC<AssistantChatProps> = ({
  deals,
  config: configOverrides,
  onAction,
  className = '',
  style,
  placeholder = 'Ask about your deals...',
  theme = 'auto',
}) => {
  const config: AssistantConfig = {
    ...DEFAULT_ASSISTANT_CONFIG,
    ...configOverrides,
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Build CRM context from deals
  const crmContext: CRMContext = React.useMemo(
    () => summarizePipeline(deals),
    [deals],
  );

  // ----- Send message -----
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: uid(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch(config.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: m.timestamp,
            })),
            context: crmContext,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(errorData.error ?? `HTTP ${response.status}`);
        }

        // Stream the response
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let assistantContent = '';
        const assistantId = uid();

        // Add an empty assistant message we will append to
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
          },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Parse SSE data lines (OpenAI streaming format)
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m,
                  ),
                );
              }
            } catch {
              // Non-JSON line or partial chunk — accumulate raw text as fallback
              if (data !== '' && data !== '[DONE]') {
                assistantContent += data;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m,
                  ),
                );
              }
            }
          }
        }
      } catch (err) {
        const errorContent =
          err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'assistant',
            content: `**Error:** ${errorContent}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [config.apiEndpoint, crmContext, isLoading, messages],
  );

  // ----- Form submit handler -----
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage],
  );

  // ----- Theme class -----
  const themeClass =
    theme === 'dark'
      ? 'dark'
      : theme === 'light'
        ? ''
        : ''; // "auto" relies on parent or prefers-color-scheme

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 ${themeClass} ${className}`}
      style={style}
      role="region"
      aria-label="CRM AI Assistant"
    >
      {/* ---- Header ---- */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          CRM Assistant
        </h2>
        <span className="ml-auto text-xs text-gray-400">
          {deals.length} deal{deals.length !== 1 ? 's' : ''} loaded
        </span>
      </div>

      {/* ---- Messages ---- */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ask me anything about your deals and pipeline.
            </p>

            {/* Suggested questions */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3.5 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              }`}
            >
              {renderMarkdown(msg.content)}

              {/* Insight cards */}
              {msg.insights?.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} onAction={onAction} />
              ))}
            </div>
          </div>
        ))}

        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ---- Suggested questions (when messages exist) ---- */}
      {messages.length > 0 && !isLoading && (
        <div className="flex gap-2 overflow-x-auto border-t border-gray-100 px-4 py-2 dark:border-gray-800">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendMessage(q)}
              className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ---- Input ---- */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400"
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
};
