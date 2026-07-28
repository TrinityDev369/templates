/**
 * Chatbot Widget — Public API
 *
 * Use <ChatWidget> for the drop-in experience, or import individual
 * pieces (hooks, components, streaming client) for custom compositions.
 */

// Root component
export { ChatWidget } from './ChatWidget';

// Types
export type { ChatConfig, ChatMessage, SSEEvent, Session } from './lib/types';

// Hooks
export { useChat } from './hooks/useChat';
export type { EscalationInfo } from './hooks/useChat';
export { useSession } from './hooks/useSession';

// Streaming client
export { sendMessage } from './lib/stream';
export type { SSEEventHandler } from './lib/stream';

// History fetcher
export { fetchHistory } from './lib/history';
export type { HistoryResponse } from './lib/history';

// Components
export { ChatBubble } from './components/ChatBubble';
export { ChatWindow } from './components/ChatWindow';
export { MessageList } from './components/MessageList';
export { MessageBubble } from './components/MessageBubble';
export { Markdown } from './components/Markdown';
export { InputBar } from './components/InputBar';
export { TypingIndicator } from './components/TypingIndicator';
export { EscalationCard } from './components/EscalationCard';
export { DisclaimerBanner } from './components/DisclaimerBanner';
export { RetryBanner } from './components/RetryBanner';
export { RegenerateButton } from './components/RegenerateButton';
