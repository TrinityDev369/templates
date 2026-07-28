/**
 * Legal disclaimer banner displayed above the input area.
 *
 * Only renders when a `disclaimer` string is provided via config.
 * Features a collapsible toggle so the user can dismiss it.
 */

import { useState } from 'react';

interface DisclaimerBannerProps {
  text: string;
}

export function DisclaimerBanner({ text }: DisclaimerBannerProps): JSX.Element {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        type="button"
        className="chatbot-disclaimer chatbot-disclaimer--collapsed"
        onClick={() => setCollapsed(false)}
        aria-expanded="false"
        aria-label="Show disclaimer"
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
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>Disclaimer</span>
      </button>
    );
  }

  return (
    <div className="chatbot-disclaimer" role="note">
      <div className="chatbot-disclaimer-content">
        <p className="chatbot-disclaimer-text">{text}</p>
        <button
          type="button"
          className="chatbot-disclaimer-close"
          onClick={() => setCollapsed(true)}
          aria-label="Hide disclaimer"
        >
          <svg
            width="12"
            height="12"
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
