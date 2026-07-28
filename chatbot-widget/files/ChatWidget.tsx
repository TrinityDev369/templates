/**
 * Root ChatWidget component.
 *
 * Composes all sub-components: ChatBubble (when closed), ChatWindow (when open).
 * Manages open/closed state, applies CSS custom properties from config,
 * and handles the Escape key to close the window.
 *
 * Usage:
 *   import { ChatWidget } from './chatbot';
 *
 *   <ChatWidget
 *     name="Acme Support"
 *     apiUrl="https://api.example.com/chat"
 *     accentColor="#7c3aed"
 *     welcomeMessage="Hi! How can I help you today?"
 *   />
 */

import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ChatConfig } from './lib/types';
import { useChat } from './hooks/useChat';
import { ChatBubble } from './components/ChatBubble';
import { ChatWindow } from './components/ChatWindow';
// If your bundler doesn't handle CSS imports, load widget.css via a <link> tag
// and remove this import. See: styles/widget.css
import './styles/widget.css';

export function ChatWidget(config: ChatConfig): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isStreaming, isLoading, error, escalation, sendMessage, retry, regenerate, dismissError } = useChat(config);

  const accentColor = config.accentColor ?? '#2563eb';
  const position = config.position ?? 'bottom-right';

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const rootStyle = {
    '--chatbot-accent': accentColor,
    '--chatbot-accent-hover': adjustBrightness(accentColor, -15),
  } as CSSProperties;

  return (
    <div className="chatbot-root" style={rootStyle}>
      {isOpen ? (
        <ChatWindow
          config={config}
          messages={messages}
          isStreaming={isStreaming}
          isLoading={isLoading}
          error={error}
          escalation={escalation}
          onSend={sendMessage}
          onClose={() => setIsOpen(false)}
          onRetry={retry}
          onRegenerate={regenerate}
          onDismissError={dismissError}
        />
      ) : (
        <ChatBubble
          onClick={() => setIsOpen(true)}
          accentColor={accentColor}
          position={position}
        />
      )}
    </div>
  );
}

/** Adjust a hex color's brightness by the given percentage. */
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(2.55 * percent)));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
