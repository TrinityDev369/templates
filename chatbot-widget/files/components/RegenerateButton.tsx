/**
 * Small regenerate button shown below the last assistant message.
 *
 * Uses an inline SVG refresh icon. Only rendered when the conversation
 * is idle (not streaming) and the last message is from the assistant.
 */

interface RegenerateButtonProps {
  /** Called when the user clicks the regenerate button. */
  onClick: () => void;
  /** Disables the button (e.g. during streaming). */
  disabled: boolean;
}

export function RegenerateButton({ onClick, disabled }: RegenerateButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className="chatbot-regenerate"
      onClick={onClick}
      disabled={disabled}
      title="Regenerate response"
      aria-label="Regenerate response"
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
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
        <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
      </svg>
    </button>
  );
}
