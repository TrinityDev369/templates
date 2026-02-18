// =============================================================================
// Global Test Setup
// =============================================================================
// This file runs before every test suite. It:
//   1. Registers jest-dom custom matchers (toBeInTheDocument, etc.)
//   2. Starts / resets / stops the MSW mock server
//   3. Cleans up the DOM after each test
//   4. Stubs browser APIs that jsdom does not implement
// =============================================================================

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

// -----------------------------------------------------------------------------
// MSW lifecycle
// -----------------------------------------------------------------------------

// Start intercepting requests before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn', // Log warnings for unhandled requests
  });
});

// Reset handlers between tests so one test's overrides don't leak into the next
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests are done
afterAll(() => {
  server.close();
});

// -----------------------------------------------------------------------------
// DOM cleanup
// -----------------------------------------------------------------------------

// Unmount React trees and clear the DOM after each test to prevent leaks
afterEach(() => {
  cleanup();
});

// -----------------------------------------------------------------------------
// Browser API stubs
// -----------------------------------------------------------------------------

// jsdom does not implement window.matchMedia — stub it for component tests
// that use responsive hooks or CSS media queries
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},    // deprecated but still used by some libs
      removeListener: () => {}, // deprecated but still used by some libs
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// jsdom does not implement IntersectionObserver — stub it for components
// that use lazy loading, infinite scroll, or visibility detection
if (typeof window !== 'undefined') {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];

    constructor(
      private callback: IntersectionObserverCallback,
      _options?: IntersectionObserverInit,
    ) {}

    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
  });
}
