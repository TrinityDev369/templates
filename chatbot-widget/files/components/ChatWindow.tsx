/**
 * Main chat window panel.
 *
 * Fixed position, 400px wide, 600px max height (capped at 80vh).
 * Contains a header with bot name/avatar/close button,
 * the MessageList, an optional DisclaimerBanner, and the InputBar.
 *
 * Slide-up animation on mount. Shadow and rounded corners.
 */

import type { CSSProperties } from 'react';
import type { ChatConfig, ChatMessage } from '../lib/types';
import type { EscalationInfo } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { DisclaimerBanner } from './DisclaimerBanner';
import { RetryBanner } from './RetryBanner';

interface ChatWindowProps {
  config: ChatConfig;
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoading?: boolean;
  error: string | null;
  escalation: EscalationInfo | null;
  onSend: (text: string) => void;
  onClose: () => void;
  onRetry?: () => void;
  onRegenerate?: () => void;
  onDismissError?: () => void;
}

export function ChatWindow({
  config,
  messages,
  isStreaming,
  isLoading,
  error,
  escalation,
  onSend,
  onClose,
  onRetry,
  onRegenerate,
  onDismissError,
}: ChatWindowProps): JSX.Element {
  const position = config.position ?? 'bottom-right';

  const positionStyles: CSSProperties =
    position === 'bottom-left'
      ? { left: '24px', right: 'auto' }
      : { right: '24px', left: 'auto' };

  return (
    <div className="chatbot-window" style={positionStyles} role="dialog" aria-label={`Chat with ${config.name}`}>
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-info">
          {config.avatarUrl && (
            <img
              className="chatbot-header-avatar"
              src={config.avatarUrl}
              alt={`${config.name} avatar`}
              width={32}
              height={32}
            />
          )}
          <span className="chatbot-header-name">{config.name}</span>
        </div>
        <button
          type="button"
          className="chatbot-header-close"
          onClick={onClose}
          aria-label="Close chat"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Message area */}
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        isLoading={isLoading}
        escalation={escalation}
        error={error}
        onRegenerate={onRegenerate}
      />

      {/* Retry banner (replaces the old static error banner) */}
      {error && onRetry && onDismissError && (
        <RetryBanner error={error} onRetry={onRetry} onDismiss={onDismissError} />
      )}

      {/* Disclaimer */}
      {config.disclaimer && <DisclaimerBanner text={config.disclaimer} />}

      {/* Input */}
      <InputBar
        onSend={onSend}
        placeholder={config.placeholder ?? 'Type your message...'}
        disabled={isStreaming}
      />
    </div>
  );
}
