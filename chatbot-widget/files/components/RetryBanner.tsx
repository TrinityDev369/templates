/**
 * Error banner with retry and dismiss actions.
 *
 * Shown between the MessageList and InputBar when a streaming error
 * occurs. Provides a "Try again" button to resend the last user message
 * and a dismiss button to clear the error without retrying.
 *
 * Slides down on mount via the chatbot-slideDown animation.
 */

interface RetryBannerProps {
  /** Error message to display (truncated to ~100 chars in the UI). */
  error: string;
  /** Called when the user clicks "Try again". */
  onRetry: () => void;
  /** Called when the user clicks the dismiss button. */
  onDismiss: () => void;
}

/** Truncate a string to the given max length, appending an ellipsis if needed. */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '\u2026';
}

export function RetryBanner({ error, onRetry, onDismiss }: RetryBannerProps): JSX.Element {
  return (
    <div className="chatbot-retry" role="alert">
      <p className="chatbot-retry-message">{truncate(error, 100)}</p>
      <div className="chatbot-retry-actions">
        <button
          type="button"
          className="chatbot-retry-btn"
          onClick={onRetry}
        >
          Try again
        </button>
        <button
          type="button"
          className="chatbot-retry-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          <svg
            width="14"
            height="14"
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
    </div>
  );
}
