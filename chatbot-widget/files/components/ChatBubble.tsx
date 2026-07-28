/**
 * Floating action button that opens the chat window.
 *
 * Renders a circular 56px button with a chat SVG icon,
 * positioned fixed in the configured screen corner.
 * Features a subtle pulse animation on mount and hover scale.
 */

import type { CSSProperties } from 'react';

interface ChatBubbleProps {
  onClick: () => void;
  accentColor: string;
  position: 'bottom-right' | 'bottom-left';
}

export function ChatBubble({ onClick, accentColor, position }: ChatBubbleProps): JSX.Element {
  const positionStyles: CSSProperties =
    position === 'bottom-left'
      ? { left: '24px', right: 'auto' }
      : { right: '24px', left: 'auto' };

  return (
    <button
      type="button"
      className="chatbot-bubble"
      onClick={onClick}
      aria-label="Open chat"
      style={{
        ...positionStyles,
        backgroundColor: accentColor,
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
