/**
 * Scrollable message container that renders all conversation messages.
 *
 * Auto-scrolls to the bottom whenever new messages arrive or streaming
 * content updates. Shows a TypingIndicator during streaming and an
 * EscalationCard when escalation is active.
 *
 * Displays an empty-state prompt when no messages exist.
 */

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../lib/types';
import type { EscalationInfo } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EscalationCard } from './EscalationCard';
import { RegenerateButton } from './RegenerateButton';

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoading?: boolean;
  escalation: EscalationInfo | null;
  error?: string | null;
  onRegenerate?: () => void;
}

export function MessageList({ messages, isStreaming, isLoading, escalation, error, onRegenerate }: MessageListProps): JSX.Element {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, escalation]);

  return (
    <div className="chatbot-messages">
      {isLoading && messages.length === 0 && (
        <div className="chatbot-skeleton" aria-label="Loading conversation history">
          <div className="chatbot-skeleton-line chatbot-skeleton-line--long" />
          <div className="chatbot-skeleton-line chatbot-skeleton-line--medium" />
          <div className="chatbot-skeleton-line chatbot-skeleton-line--short" />
        </div>
      )}

      {!isLoading && messages.length === 0 && (
        <div className="chatbot-empty">
          <p>Start a conversation!</p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id ?? message.timestamp} message={message} />
      ))}

      {/* Show regenerate button below the last assistant message when idle */}
      {onRegenerate &&
        !isStreaming &&
        !error &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'assistant' && (
          <RegenerateButton onClick={onRegenerate} disabled={isStreaming} />
        )}

      {isStreaming && <TypingIndicator />}

      {escalation && (
        <EscalationCard
          agentName={escalation.agentName}
          reason={escalation.reason}
        />
      )}

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
