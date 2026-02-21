'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'reading-mode';

interface ReadingModeState {
  isReading: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

const ReadingModeContext = createContext<ReadingModeState | null>(null);

export function useReadingMode(): ReadingModeState {
  const ctx = useContext(ReadingModeContext);
  if (!ctx) throw new Error('useReadingMode must be used within ReadingModeProvider');
  return ctx;
}

export function ReadingModeProvider({ children }: { children: ReactNode }) {
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setIsReading(true);
  }, []);

  const persist = (value: boolean) => {
    setIsReading(value);
    localStorage.setItem(STORAGE_KEY, String(value));
    document.documentElement.classList.toggle('reading-mode', value);
  };

  const toggle = useCallback(() => persist(!isReading), [isReading]);
  const enable = useCallback(() => persist(true), []);
  const disable = useCallback(() => persist(false), []);

  useEffect(() => {
    document.documentElement.classList.toggle('reading-mode', isReading);
  }, [isReading]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  return (
    <ReadingModeContext.Provider value={{ isReading, toggle, enable, disable }}>
      {children}
    </ReadingModeContext.Provider>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

export function ReadingModeToggle({ className }: { className?: string }) {
  const { isReading, toggle } = useReadingMode();
  return (
    <button
      onClick={toggle}
      aria-label={isReading ? 'Exit reading mode' : 'Enter reading mode'}
      aria-pressed={isReading}
      title="Toggle reading mode (Alt+R)"
      className={[
        'inline-flex items-center justify-center rounded-md p-2 transition-colors',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        isReading ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400',
        className,
      ].filter(Boolean).join(' ')}
    >
      <BookIcon className="h-5 w-5" />
    </button>
  );
}

export function ReadingModeContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isReading } = useReadingMode();
  return (
    <div
      className={[
        'transition-all duration-300 ease-in-out',
        isReading ? 'mx-auto max-w-[65ch] text-lg leading-relaxed' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
