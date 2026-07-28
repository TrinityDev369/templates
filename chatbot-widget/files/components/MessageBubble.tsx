/**
 * Single message bubble component.
 *
 * User messages: right-aligned, accent color background, white text.
 *   Rendered as plain text with preserved whitespace.
 * Assistant messages: left-aligned, light gray background, dark text.
 *   Rendered through the Markdown component to display formatted content.
 *
 * Features a subtle fade-in animation.
 */

import type { ChatMessage } from '../lib/types';
import { Markdown } from './Markdown';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps): JSX.Element {
  const variant = message.role === 'user' ? 'user' : 'assistant';

  return (
    <div className={`chatbot-message chatbot-message--${variant}`}>
      <div className={`chatbot-bubble-content chatbot-bubble-content--${variant}`}>
        {variant === 'assistant' ? (
          <Markdown content={message.content} />
        ) : (
          message.content
        )}
      </div>
    </div>
  );
}
