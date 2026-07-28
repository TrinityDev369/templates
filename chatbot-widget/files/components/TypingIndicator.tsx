/**
 * Three bouncing dots animation displayed while the assistant is streaming.
 *
 * Pure CSS animation — no JS timers. Styled to visually align with
 * assistant message bubbles.
 */

export function TypingIndicator(): JSX.Element {
  return (
    <div className="chatbot-typing" aria-label="Assistant is typing">
      <span className="chatbot-typing-dot" />
      <span className="chatbot-typing-dot" />
      <span className="chatbot-typing-dot" />
    </div>
  );
}
